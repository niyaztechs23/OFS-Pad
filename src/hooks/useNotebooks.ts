import { useCallback, useEffect, useRef, useState } from 'react';
import {
  loadNotebooks,
  saveNotebooks,
  newNotebook,
  type NotebookData,
} from '@/lib/notebookStore';
import type { SubjectKey } from '@/data/mock';

export function useNotebooks(userId: string | undefined) {
  const [notebooks, setNotebooks] = useState<NotebookData[]>([]);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const dirty = useRef(false);
  const latest = useRef<NotebookData[]>([]);
  latest.current = notebooks;

  useEffect(() => {
    if (!userId) {
      setNotebooks([]);
      setReady(false);
      return;
    }
    setNotebooks(loadNotebooks(userId));
    setReady(true);
    dirty.current = false;
  }, [userId]);

  // Autosave shortly after every change.
  useEffect(() => {
    if (!userId || !ready || !dirty.current) return;
    const t = setTimeout(() => {
      const ok = saveNotebooks(userId, notebooks);
      setSaveError(!ok);
      if (ok) setSavedAt(Date.now());
      dirty.current = false;
    }, 500);
    return () => clearTimeout(t);
  }, [notebooks, userId, ready]);

  // Save immediately when leaving the page so the last strokes are never lost.
  useEffect(() => {
    return () => {
      if (dirty.current && userId) saveNotebooks(userId, latest.current);
    };
  }, [userId]);

  useEffect(() => {
    const onHide = () => {
      if (dirty.current && userId) saveNotebooks(userId, latest.current);
    };
    window.addEventListener('beforeunload', onHide);
    return () => window.removeEventListener('beforeunload', onHide);
  }, [userId]);

  const update = useCallback((id: string, fn: (nb: NotebookData) => NotebookData) => {
    dirty.current = true;
    setNotebooks((prev) =>
      prev.map((nb) => (nb.id === id ? { ...fn(nb), updatedAt: Date.now() } : nb))
    );
  }, []);

  const add = useCallback((title: string, subject: SubjectKey, isRough = false) => {
    const nb = newNotebook(title, subject, isRough);
    dirty.current = true;
    setNotebooks((prev) => [...prev, nb]);
    return nb.id;
  }, []);

  const remove = useCallback((id: string) => {
    dirty.current = true;
    setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
  }, []);

  return { notebooks, ready, saveError, savedAt, update, add, remove };
}
