import { useEffect, useMemo, useRef, useState } from 'react';

export type IssueKind = 'spelling' | 'grammar' | 'style';
export type Issue = {
  offset: number;
  length: number;
  message: string;
  replacements: string[];
  kind: IssueKind;
  word: string;
};
export type SpellStatus = 'idle' | 'checking' | 'ok' | 'offline' | 'busy' | 'private';

export const LANGS = [
  { code: 'en-GB', label: 'English (UK)' },
  { code: 'en-US', label: 'English (US)' },
];

export const KIND_COLOR: Record<IssueKind, string> = {
  spelling: '#D1495B',
  grammar: '#2B6CB0',
  style: '#C98A1B',
};
export const KIND_LABEL: Record<IssueKind, string> = {
  spelling: 'Spelling',
  grammar: 'Grammar',
  style: 'Style',
};

type LTMatch = {
  offset: number;
  length: number;
  message: string;
  replacements?: { value: string }[];
  rule?: { issueType?: string };
};

// `online = false` means the text must never leave this device (private notebooks).
export function useSpellCheck(text: string, online: boolean) {
  const [lang, setLang] = useState('en-GB');
  const [issues, setIssues] = useState<Issue[]>([]);
  const [status, setStatus] = useState<SpellStatus>('idle');
  const [ignored, setIgnored] = useState<string[]>([]);
  const checkedFor = useRef('');

  useEffect(() => {
    if (!online) {
      setIssues([]);
      setStatus('private');
      checkedFor.current = '';
      return;
    }
    if (!text.trim()) {
      setIssues([]);
      setStatus('idle');
      checkedFor.current = '';
      return;
    }
    setStatus('checking');
    const ctrl = new AbortController();
    const timer = setTimeout(async () => {
      try {
        const body = new URLSearchParams({ text, language: lang });
        const res = await fetch('https://api.languagetool.org/v2/check', {
          method: 'POST',
          headers: { 'Content-Type': 'application/x-www-form-urlencoded', Accept: 'application/json' },
          body,
          signal: ctrl.signal,
        });
        if (res.status === 429) {
          setStatus('busy');
          return;
        }
        if (!res.ok) throw new Error(String(res.status));
        const data = (await res.json()) as { matches?: LTMatch[] };
        const found: Issue[] = (data.matches ?? []).map((m) => {
          const t = m.rule?.issueType ?? '';
          const kind: IssueKind =
            t === 'misspelling' ? 'spelling' : t === 'style' || t === 'typographical' ? 'style' : 'grammar';
          return {
            offset: m.offset,
            length: m.length,
            message: m.message,
            replacements: (m.replacements ?? []).slice(0, 4).map((r) => r.value),
            kind,
            word: text.slice(m.offset, m.offset + m.length),
          };
        });
        checkedFor.current = text;
        setIssues(found);
        setStatus('ok');
      } catch (err) {
        if ((err as Error).name === 'AbortError') return;
        setStatus('offline');
      }
    }, 900);
    return () => {
      clearTimeout(timer);
      ctrl.abort();
    };
  }, [text, lang, online]);

  const fresh = checkedFor.current === text && status === 'ok';

  const visible = useMemo(
    () => (fresh ? issues.filter((i) => !ignored.includes(i.word.toLowerCase())) : []),
    [fresh, issues, ignored]
  );

  const ignore = (word: string) => setIgnored((prev) => [...prev, word.toLowerCase()]);

  return { lang, setLang, status, fresh, issues: visible, ignore };
}
