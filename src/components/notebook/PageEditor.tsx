import { useCallback, useEffect, useMemo, useRef, useState, type PointerEvent as ReactPointerEvent } from 'react';
import {
  PenTool, Pencil, Highlighter, Eraser, Keyboard, Hand, Undo2, Redo2, Trash2,
  CheckCircle2, AlertCircle, Loader2, WifiOff, SpellCheck, Lock,
} from 'lucide-react';
import { uid, type NotebookPage, type Stroke, type Tool } from '@/lib/notebookStore';
import {
  PAGE_W, PAGE_H, SCALE, PALETTES, DEFAULT_SIZE, r1, drawStroke, strokeHit,
  PAPER_STYLE, RULES_STYLE, TYPE_STYLE, MARGIN_LEFT,
} from '@/lib/ink';
import {
  useSpellCheck, LANGS, KIND_COLOR, KIND_LABEL, type Issue, type IssueKind, type SpellStatus,
} from '@/hooks/useSpellCheck';

type PageTool = Tool | 'type' | 'move';

const TOOLS: { key: PageTool; label: string; Icon: typeof PenTool }[] = [
  { key: 'pen', label: 'Pen', Icon: PenTool },
  { key: 'pencil', label: 'Pencil', Icon: Pencil },
  { key: 'highlighter', label: 'Highlight', Icon: Highlighter },
  { key: 'eraser', label: 'Eraser', Icon: Eraser },
  { key: 'type', label: 'Type', Icon: Keyboard },
  { key: 'move', label: 'Move', Icon: Hand },
];

const ZOOMS = [1, 1.5, 2];

export function PageEditor({
  page,
  onStrokes,
  onText,
  privateMode,
}: {
  page: NotebookPage;
  onStrokes: (strokes: Stroke[]) => void;
  onText: (text: string) => void;
  privateMode: boolean;
}) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const committedRef = useRef<HTMLCanvasElement | null>(null);
  const strokesRef = useRef<Stroke[]>(page.strokes);
  const currentRef = useRef<Stroke | null>(null);
  const erasingRef = useRef({ active: false, pushed: false });
  const undoRef = useRef<Stroke[][]>([]);
  const redoRef = useRef<Stroke[][]>([]);
  const onStrokesRef = useRef(onStrokes);
  onStrokesRef.current = onStrokes;
  const taRef = useRef<HTMLTextAreaElement>(null);
  const backRef = useRef<HTMLDivElement>(null);

  const [strokes, setStrokes] = useState<Stroke[]>(page.strokes);
  const [tool, setTool] = useState<PageTool>('pen');
  const [colors, setColors] = useState({ pen: PALETTES.pen[1], pencil: PALETTES.pencil[0], highlighter: PALETTES.highlighter[0] });
  const [sizes, setSizes] = useState({ ...DEFAULT_SIZE });
  const [zoom, setZoom] = useState(1);

  const spell = useSpellCheck(page.text, !privateMode);
  const isInk = tool === 'pen' || tool === 'pencil' || tool === 'highlighter' || tool === 'eraser';

  // ---------- ink drawing ----------
  const redraw = useCallback(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    if (committedRef.current) ctx.drawImage(committedRef.current, 0, 0);
    if (currentRef.current) {
      ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
      drawStroke(ctx, currentRef.current);
    }
  }, []);

  const rebuildCommitted = useCallback((list: Stroke[]) => {
    if (!committedRef.current) {
      committedRef.current = document.createElement('canvas');
      committedRef.current.width = PAGE_W * SCALE;
      committedRef.current.height = PAGE_H * SCALE;
    }
    const c = committedRef.current;
    const ctx = c.getContext('2d');
    if (!ctx) return;
    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, c.width, c.height);
    ctx.setTransform(SCALE, 0, 0, SCALE, 0, 0);
    list.forEach((s) => drawStroke(ctx, s));
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (canvas) {
      canvas.width = PAGE_W * SCALE;
      canvas.height = PAGE_H * SCALE;
    }
  }, []);

  useEffect(() => {
    rebuildCommitted(strokes);
    redraw();
  }, [strokes, rebuildCommitted, redraw]);

  const commit = useCallback((next: Stroke[], pushUndo = true) => {
    if (pushUndo) {
      undoRef.current = [...undoRef.current.slice(-49), strokesRef.current];
      redoRef.current = [];
    }
    strokesRef.current = next;
    setStrokes(next);
    onStrokesRef.current(next);
  }, []);

  const undo = useCallback(() => {
    const stack = undoRef.current;
    if (!stack.length) return;
    const prev = stack[stack.length - 1];
    undoRef.current = stack.slice(0, -1);
    redoRef.current = [...redoRef.current, strokesRef.current];
    strokesRef.current = prev;
    setStrokes(prev);
    onStrokesRef.current(prev);
  }, []);

  const redo = useCallback(() => {
    const stack = redoRef.current;
    if (!stack.length) return;
    const next = stack[stack.length - 1];
    redoRef.current = stack.slice(0, -1);
    undoRef.current = [...undoRef.current, strokesRef.current];
    strokesRef.current = next;
    setStrokes(next);
    onStrokesRef.current(next);
  }, []);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      const tag = (e.target as HTMLElement | null)?.tagName;
      if (tag === 'INPUT' || tag === 'TEXTAREA' || tag === 'SELECT') return;
      if ((e.ctrlKey || e.metaKey) && !e.shiftKey && e.key.toLowerCase() === 'z') {
        e.preventDefault();
        undo();
      } else if ((e.ctrlKey || e.metaKey) && (e.key.toLowerCase() === 'y' || (e.shiftKey && e.key.toLowerCase() === 'z'))) {
        e.preventDefault();
        redo();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [undo, redo]);

  const toPoint = (e: { clientX: number; clientY: number; pressure: number }): [number, number, number] => {
    const rect = canvasRef.current!.getBoundingClientRect();
    const x = ((e.clientX - rect.left) * PAGE_W) / rect.width;
    const y = ((e.clientY - rect.top) * PAGE_H) / rect.height;
    const p = e.pressure > 0 ? e.pressure : 0.5;
    return [r1(x), r1(y), Math.round(p * 100) / 100];
  };

  const eraseAt = (pt: [number, number, number]) => {
    const next = strokesRef.current.filter((s) => !strokeHit(s, pt[0], pt[1], 14));
    if (next.length !== strokesRef.current.length) {
      commit(next, !erasingRef.current.pushed);
      erasingRef.current.pushed = true;
    }
  };

  const onPointerDown = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    if (!isInk) return;
    if (e.pointerType === 'mouse' && e.button !== 0) return;
    e.preventDefault();
    canvasRef.current?.setPointerCapture(e.pointerId);
    const pt = toPoint(e);
    if (tool === 'eraser') {
      erasingRef.current = { active: true, pushed: false };
      eraseAt(pt);
    } else if (tool === 'pen' || tool === 'pencil' || tool === 'highlighter') {
      currentRef.current = { id: uid(), tool, color: colors[tool], size: sizes[tool], points: [pt] };
      redraw();
    }
  };

  const onPointerMove = (e: ReactPointerEvent<HTMLCanvasElement>) => {
    const erasing = erasingRef.current.active;
    if (!erasing && !currentRef.current) return;
    const ne = e.nativeEvent as PointerEvent & { getCoalescedEvents?: () => PointerEvent[] };
    const events = ne.getCoalescedEvents ? ne.getCoalescedEvents() : [];
    const list = events.length ? events : [ne];
    for (const ev of list) {
      const pt = toPoint(ev);
      if (erasing) eraseAt(pt);
      else currentRef.current!.points.push(pt);
    }
    if (!erasing) redraw();
  };

  const finish = () => {
    if (erasingRef.current.active) erasingRef.current = { active: false, pushed: false };
    const cur = currentRef.current;
    if (cur) {
      currentRef.current = null;
      commit([...strokesRef.current, cur]);
    }
  };

  const clearInk = () => {
    if (!strokesRef.current.length) return;
    if (window.confirm('Clear all handwriting on this page? (Typed text stays.)')) commit([]);
  };

  // ---------- typed text + word checker ----------
  useEffect(() => {
    if (tool === 'type') taRef.current?.focus();
  }, [tool]);

  const syncScroll = () => {
    if (backRef.current && taRef.current) backRef.current.scrollTop = taRef.current.scrollTop;
  };

  const backdrop = useMemo(() => {
    const text = page.text;
    if (!spell.issues.length) return [text + '\n'];
    const sorted = [...spell.issues].sort((a, b) => a.offset - b.offset);
    const parts: (string | { text: string; kind: IssueKind })[] = [];
    let cursor = 0;
    sorted.forEach((i) => {
      if (i.offset < cursor) return;
      parts.push(text.slice(cursor, i.offset));
      parts.push({ text: text.slice(i.offset, i.offset + i.length), kind: i.kind });
      cursor = i.offset + i.length;
    });
    parts.push(text.slice(cursor) + '\n');
    return parts;
  }, [page.text, spell.issues]);

  const applyFix = (issue: Issue, replacement: string) => {
    const t = page.text;
    onText(t.slice(0, issue.offset) + replacement + t.slice(issue.offset + issue.length));
  };

  const activeInk = tool === 'pen' || tool === 'pencil' || tool === 'highlighter' ? tool : null;
  const layersLocked = tool === 'type' || tool === 'move';

  return (
    <div className="space-y-3">
      <style>{`.ofs-noscroll{scrollbar-width:none}.ofs-noscroll::-webkit-scrollbar{display:none}`}</style>

      {/* Toolbar */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl bg-white dark:bg-ink-800 border border-ink-100/60 dark:border-ink-700/60 shadow-soft p-2">
        <div className="flex gap-1 flex-wrap">
          {TOOLS.map(({ key, label, Icon }) => (
            <button
              key={key}
              onClick={() => setTool(key)}
              aria-label={label}
              title={label}
              className={`h-11 px-3 min-w-11 inline-flex items-center justify-center gap-1.5 rounded-lg transition-colors ${
                tool === key
                  ? 'bg-ink-500 text-white'
                  : 'text-ink-500 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-700'
              }`}
            >
              <Icon size={20} />
              <span className="hidden md:inline text-xs font-heading font-semibold">{label}</span>
            </button>
          ))}
        </div>

        <span className="w-px h-7 bg-ink-100 dark:bg-ink-700 hidden sm:block" />

        {activeInk && (
          <>
            <div className="flex gap-1.5 items-center">
              {PALETTES[activeInk].map((c) => (
                <button
                  key={c}
                  onClick={() => setColors((prev) => ({ ...prev, [activeInk]: c }))}
                  aria-label={`Colour ${c}`}
                  className={`w-8 h-8 rounded-full border-2 ${
                    colors[activeInk] === c ? 'border-ink-500 scale-110' : 'border-white dark:border-ink-700'
                  } shadow-sm transition-transform`}
                  style={{ backgroundColor: c }}
                />
              ))}
            </div>
            <label className="flex items-center gap-2 text-xs text-ink-400 dark:text-ink-200">
              Size
              <input
                type="range"
                min={1}
                max={10}
                value={sizes[activeInk]}
                onChange={(e) => setSizes((prev) => ({ ...prev, [activeInk]: Number(e.target.value) }))}
                className="w-24 accent-[#2B4C7E]"
              />
            </label>
          </>
        )}
        {tool === 'eraser' && <span className="text-sm text-ink-400 dark:text-ink-200 px-1">Touch a line to erase it</span>}
        {tool === 'type' && <span className="text-sm text-ink-400 dark:text-ink-200 px-1">Tap the page and type</span>}
        {tool === 'move' && <span className="text-sm text-ink-400 dark:text-ink-200 px-1">Drag to scroll around the page</span>}

        <div className="flex gap-1 ml-auto items-center">
          <select
            value={zoom}
            onChange={(e) => setZoom(Number(e.target.value))}
            aria-label="Zoom"
            className="h-11 rounded-lg text-sm bg-ink-50 dark:bg-ink-700 text-ink-600 dark:text-ink-100 px-2 border border-ink-100 dark:border-ink-600"
          >
            {ZOOMS.map((z) => (
              <option key={z} value={z}>{Math.round(z * 100)}%</option>
            ))}
          </select>
          <button onClick={undo} disabled={!undoRef.current.length} aria-label="Undo" title="Undo handwriting (Ctrl+Z)"
            className="w-11 h-11 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-700 disabled:opacity-30">
            <Undo2 size={20} />
          </button>
          <button onClick={redo} disabled={!redoRef.current.length} aria-label="Redo" title="Redo (Ctrl+Y)"
            className="w-11 h-11 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-700 disabled:opacity-30">
            <Redo2 size={20} />
          </button>
          <button onClick={clearInk} disabled={!strokes.length} aria-label="Clear handwriting" title="Clear handwriting"
            className="w-11 h-11 grid place-items-center rounded-lg text-clay-600 hover:bg-clay-50 dark:text-clay-100 dark:hover:bg-ink-700 disabled:opacity-30">
            <Trash2 size={20} />
          </button>
        </div>
      </div>

      <div className="grid xl:grid-cols-[minmax(0,1fr)_17rem] gap-4 items-start">
        {/* One page: ruled paper + typed text + handwriting together */}
        <div className="overflow-x-auto rounded-xl min-w-0">
          <div className="max-w-[820px]" style={{ width: `${zoom * 100}%` }}>
            <div className="relative w-full rounded-xl shadow-card overflow-hidden" style={PAPER_STYLE}>
              <div className="absolute inset-0" style={RULES_STYLE} />
              <div className="absolute top-0 bottom-0" style={{ left: MARGIN_LEFT, width: 1, backgroundColor: 'rgba(209,73,91,0.45)' }} />

              {/* typed layer: marked-up copy behind, real textarea in front */}
              <div
                ref={backRef}
                aria-hidden="true"
                className="ofs-noscroll absolute inset-0 pointer-events-none"
                style={{ ...TYPE_STYLE, overflowY: 'scroll', color: 'transparent' }}
              >
                {backdrop.map((part, i) =>
                  typeof part === 'string' ? (
                    <span key={i}>{part}</span>
                  ) : (
                    <span
                      key={i}
                      style={{
                        textDecoration: 'underline wavy',
                        textDecorationColor: KIND_COLOR[part.kind],
                        textDecorationThickness: 2,
                        textUnderlineOffset: '0.6cqw',
                      }}
                    >
                      {part.text}
                    </span>
                  )
                )}
              </div>
              <textarea
                ref={taRef}
                value={page.text}
                onChange={(e) => onText(e.target.value)}
                onScroll={syncScroll}
                spellCheck={spell.status === 'offline' || spell.status === 'private'}
                tabIndex={tool === 'type' ? 0 : -1}
                aria-label="Typed notes"
                placeholder={tool === 'type' ? 'Start typing…' : ''}
                className="ofs-noscroll absolute inset-0 w-full h-full bg-transparent resize-none outline-none placeholder:text-[#9AA3AE]"
                style={{
                  ...TYPE_STYLE,
                  overflowY: 'scroll',
                  color: '#1F2933',
                  caretColor: '#2B4C7E',
                  pointerEvents: tool === 'type' ? 'auto' : 'none',
                }}
              />

              {/* handwriting layer */}
              <canvas
                ref={canvasRef}
                className="absolute inset-0 w-full h-full"
                style={{
                  touchAction: 'none',
                  pointerEvents: layersLocked ? 'none' : 'auto',
                  cursor: tool === 'eraser' ? 'cell' : 'crosshair',
                }}
                onPointerDown={onPointerDown}
                onPointerMove={onPointerMove}
                onPointerUp={finish}
                onPointerCancel={finish}
              />
            </div>
          </div>
        </div>

        <WordChecker
          status={spell.status}
          issues={spell.issues}
          lang={spell.lang}
          onLang={spell.setLang}
          onFix={applyFix}
          onIgnore={spell.ignore}
          privateMode={privateMode}
        />
      </div>
    </div>
  );
}

function WordChecker({
  status, issues, lang, onLang, onFix, onIgnore, privateMode,
}: {
  status: SpellStatus;
  issues: Issue[];
  lang: string;
  onLang: (l: string) => void;
  onFix: (i: Issue, r: string) => void;
  onIgnore: (w: string) => void;
  privateMode: boolean;
}) {
  return (
    <div className="rounded-xl bg-white dark:bg-ink-800 border border-ink-100/60 dark:border-ink-700/60 shadow-soft p-4 space-y-3">
      <div className="flex items-center justify-between gap-2">
        <h3 className="font-heading font-bold text-ink-600 dark:text-white flex items-center gap-1.5">
          <SpellCheck size={18} /> Word checker
        </h3>
        {!privateMode && (
          <select
            value={lang}
            onChange={(e) => onLang(e.target.value)}
            aria-label="Language"
            className="h-9 rounded-lg text-xs bg-ink-50 dark:bg-ink-700 text-ink-600 dark:text-ink-100 px-2 border border-ink-100 dark:border-ink-600"
          >
            {LANGS.map((l) => (
              <option key={l.code} value={l.code}>{l.label}</option>
            ))}
          </select>
        )}
      </div>

      <Status status={status} count={issues.length} />

      {issues.length > 0 && (
        <ul className="space-y-2.5 max-h-[50vh] overflow-y-auto no-scrollbar">
          {issues.map((i, idx) => (
            <li key={`${i.offset}-${idx}`} className="rounded-lg border border-ink-100 dark:border-ink-700 p-3">
              <div className="flex items-center gap-2 mb-1">
                <span
                  className="text-[10px] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded text-white"
                  style={{ backgroundColor: KIND_COLOR[i.kind] }}
                >
                  {KIND_LABEL[i.kind]}
                </span>
                <span className="font-heading font-bold text-sm text-ink-600 dark:text-white break-all">
                  {i.word.trim() ? i.word : '(space)'}
                </span>
              </div>
              <p className="text-xs text-ink-400 dark:text-ink-200 mb-2">{i.message}</p>
              <div className="flex flex-wrap gap-1.5">
                {i.replacements.map((r) => (
                  <button
                    key={r}
                    onClick={() => onFix(i, r)}
                    className="h-8 px-2.5 rounded-lg bg-leaf-50 text-leaf-700 hover:bg-leaf-100 dark:bg-leaf-700/30 dark:text-leaf-100 text-sm font-semibold"
                  >
                    {r || '(remove)'}
                  </button>
                ))}
                <button
                  onClick={() => onIgnore(i.word)}
                  className="h-8 px-2.5 rounded-lg text-xs text-ink-400 dark:text-ink-200 hover:bg-ink-50 dark:hover:bg-ink-700"
                >
                  Ignore
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

function Status({ status, count }: { status: SpellStatus; count: number }) {
  const base = 'flex items-start gap-2 text-sm';
  if (status === 'private')
    return (
      <p className={`${base} text-ink-400 dark:text-ink-200`}>
        <Lock size={16} className="mt-0.5 shrink-0" />
        Private notebook: your text never leaves this device, so only your browser's red underlines are used.
      </p>
    );
  if (status === 'idle')
    return <p className="text-sm text-ink-300 dark:text-ink-200">Use the Type tool and I'll check every word.</p>;
  if (status === 'checking')
    return (
      <p className={`${base} text-ink-400 dark:text-ink-200`}>
        <Loader2 size={16} className="animate-spin mt-0.5 shrink-0" /> Checking your words…
      </p>
    );
  if (status === 'offline')
    return (
      <p className={`${base} text-amber-600 dark:text-amber-100`}>
        <WifiOff size={16} className="mt-0.5 shrink-0" />
        The word checker can't reach the internet right now. Your browser's red underlines still help.
      </p>
    );
  if (status === 'busy')
    return (
      <p className={`${base} text-amber-600 dark:text-amber-100`}>
        <AlertCircle size={16} className="mt-0.5 shrink-0" />
        The checker is resting for a minute. Keep typing and it will catch up.
      </p>
    );
  if (count === 0)
    return (
      <p className={`${base} text-leaf-600 dark:text-leaf-100`}>
        <CheckCircle2 size={16} className="mt-0.5 shrink-0" /> All words look good.
      </p>
    );
  return (
    <p className={`${base} text-clay-600 dark:text-clay-100`}>
      <AlertCircle size={16} className="mt-0.5 shrink-0" />
      {count} {count === 1 ? 'thing' : 'things'} to look at.
    </p>
  );
}

export default PageEditor;
