import { useEffect, useState, type ReactNode } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Button } from '@/components/ui/Button';
import { SubjectTag } from '@/components/ui/SubjectTag';
import { PageEditor } from '@/components/notebook/PageEditor';
import { SubmitModal } from '@/components/notebook/SubmitModal';
import { studentNav } from '@/data/nav';
import { studentNotifications } from '@/data/mock';
import { useAuth } from '@/components/auth/AuthProvider';
import { useNotebooks } from '@/hooks/useNotebooks';
import { newPage, type Stroke } from '@/lib/notebookStore';
import {
  ArrowLeft, ChevronLeft, ChevronRight, Plus, Trash2, Lock, Check, AlertCircle, Send,
} from 'lucide-react';

export function NotebookEditor() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { session, profile } = useAuth();
  const { notebooks, ready, saveError, savedAt, update, remove } = useNotebooks(session?.userId);
  const [pageIndex, setPageIndex] = useState(0);
  const [showSubmit, setShowSubmit] = useState(false);

  const name = profile?.full_name?.split(' ')[0] ?? 'there';
  const nb = notebooks.find((n) => n.id === id);

  useEffect(() => {
    if (nb && pageIndex > nb.pages.length - 1) setPageIndex(nb.pages.length - 1);
  }, [nb, pageIndex]);

  const shell = (children: ReactNode) => (
    <AppShell role="student" nav={studentNav} name={name} notifications={studentNotifications}>
      {children}
    </AppShell>
  );

  if (!ready) return shell(<p className="text-sm text-ink-300 dark:text-ink-200">Opening your notebook…</p>);

  if (!nb) {
    return shell(
      <div className="text-center py-16 space-y-4">
        <h1 className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white">Notebook not found</h1>
        <p className="text-ink-400 dark:text-ink-200">It may have been deleted, or it lives on another device.</p>
        <Link to="/student/notebooks"><Button>Back to notebooks</Button></Link>
      </div>
    );
  }

  const page = nb.pages[Math.min(pageIndex, nb.pages.length - 1)];
  const total = nb.pages.length;

  const setStrokes = (strokes: Stroke[]) =>
    update(nb.id, (n) => ({ ...n, pages: n.pages.map((p) => (p.id === page.id ? { ...p, strokes } : p)) }));
  const setText = (text: string) =>
    update(nb.id, (n) => ({ ...n, pages: n.pages.map((p) => (p.id === page.id ? { ...p, text } : p)) }));

  const addPage = () => {
    update(nb.id, (n) => ({ ...n, pages: [...n.pages, newPage()] }));
    setPageIndex(total);
  };

  const deletePage = () => {
    const hasContent = page.strokes.length > 0 || page.text.trim().length > 0;
    if (hasContent && !window.confirm('Delete this page and everything on it?')) return;
    if (total === 1) {
      update(nb.id, (n) => ({ ...n, pages: [newPage()] }));
    } else {
      update(nb.id, (n) => ({ ...n, pages: n.pages.filter((p) => p.id !== page.id) }));
      setPageIndex(Math.max(0, pageIndex - 1));
    }
  };

  const deleteNotebook = () => {
    if (!window.confirm(`Delete "${nb.title}" and all its pages? This cannot be undone.`)) return;
    remove(nb.id);
    navigate('/student/notebooks');
  };

  return shell(
    <div className="space-y-5">
      <div className="space-y-3">
        <Link
          to="/student/notebooks"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-600 dark:text-ink-100"
        >
          <ArrowLeft size={16} /> All notebooks
        </Link>
        <div className="flex flex-wrap items-center gap-3 justify-between">
          <div className="min-w-0">
            <div className="flex flex-wrap items-center gap-2 mb-1">
              <SubjectTag subject={nb.subject} size="sm" />
              {nb.isRough && (
                <span className="inline-flex items-center gap-1 text-xs font-semibold text-ink-500 bg-ink-50 dark:bg-ink-700 dark:text-ink-100 rounded-full px-2 py-0.5">
                  <Lock size={12} /> Private. Only you can open this.
                </span>
              )}
            </div>
            <input
              defaultValue={nb.title}
              key={nb.id + nb.title}
              onBlur={(e) => {
                const t = e.target.value.trim();
                if (t && t !== nb.title) update(nb.id, (n) => ({ ...n, title: t }));
              }}
              aria-label="Notebook title"
              className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white bg-transparent outline-none border-b border-transparent focus:border-ink-300 w-full max-w-md"
            />
          </div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xs flex items-center gap-1 text-ink-300 dark:text-ink-200">
              {saveError ? (
                <><AlertCircle size={14} className="text-clay-500" /> Couldn't save (storage full?)</>
              ) : (
                <><Check size={14} className="text-leaf-500" /> {savedAt ? 'Saved on this device' : 'Autosaves on this device'}</>
              )}
            </span>
            {!nb.isRough && (
              <Button size="md" onClick={() => setShowSubmit(true)}>
                <Send size={16} /> Submit to teacher
              </Button>
            )}
            <Button variant="ghost" size="sm" onClick={deleteNotebook} aria-label="Delete notebook">
              <Trash2 size={16} />
            </Button>
          </div>
        </div>
      </div>

      {/* Page controls */}
      <div className="flex items-center gap-1.5 flex-wrap">
        <button
          onClick={() => setPageIndex(Math.max(0, pageIndex - 1))}
          disabled={pageIndex === 0}
          aria-label="Previous page"
          className="w-11 h-11 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-700 disabled:opacity-30"
        >
          <ChevronLeft size={20} />
        </button>
        <span className="text-sm font-heading font-semibold text-ink-600 dark:text-white min-w-[5.5rem] text-center">
          Page {Math.min(pageIndex, total - 1) + 1} of {total}
        </span>
        <button
          onClick={() => setPageIndex(Math.min(total - 1, pageIndex + 1))}
          disabled={pageIndex >= total - 1}
          aria-label="Next page"
          className="w-11 h-11 grid place-items-center rounded-lg text-ink-500 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-700 disabled:opacity-30"
        >
          <ChevronRight size={20} />
        </button>
        <Button variant="secondary" size="sm" onClick={addPage}><Plus size={16} /> Add page</Button>
        <Button variant="ghost" size="sm" onClick={deletePage} aria-label="Delete page"><Trash2 size={16} /></Button>
      </div>

      <div className="max-w-6xl">
        <PageEditor
          key={page.id}
          page={page}
          onStrokes={setStrokes}
          onText={setText}
          privateMode={nb.isRough}
        />
      </div>

      {showSubmit && session && (
        <SubmitModal notebook={nb} studentId={session.userId} onClose={() => setShowSubmit(false)} />
      )}
    </div>
  );
}

export default NotebookEditor;
