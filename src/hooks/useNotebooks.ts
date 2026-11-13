import { useCallback, useEffect, useRef, useState } from 'react';
import { supabase } from '@/lib/supabase';
import {
  loadLocalNotebooks, saveLocalNotebooks, notebookToRow, newNotebook, rowToNotebook,
  type NotebookData,
} from '@/lib/notebookStore';
import type { SubjectKey } from '@/data/mock';

type SyncState = 'loading' | 'synced' | 'offline' | 'syncing' | 'error';

export function useNotebooks(userId: string | undefined) {
  const [notebooks, setNotebooks] = useState<NotebookData[]>([]);
  const [ready, setReady] = useState(false);
  const [saveError, setSaveError] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);
  const [syncState, setSyncState] = useState<SyncState>('loading');
  const dirty = useRef(false);
  const latest = useRef<NotebookData[]>([]);
  latest.current = notebooks;

  useEffect(() => {
    let active = true;
    if (!userId) { setNotebooks([]); setReady(false); setSyncState('loading'); return () => { active = false; }; }
    const local = loadLocalNotebooks(userId);
    setNotebooks(local);
    latest.current = local;
    setReady(false);
    setSyncState('loading');
    void (async () => {
      const { data, error } = await supabase.from('notebooks').select('id,user_id,title,subject,is_rough,content,revision,created_at,updated_at').eq('user_id', userId).order('updated_at', { ascending: false });
      if (!active) return;
      if (error) { setReady(true); setSyncState('offline'); return; }
      const cloud = (data ?? []).map((row) => rowToNotebook(row as never));
      if (cloud.length === 0 && local.length > 0) {
        const { error: migrateError } = await supabase.from('notebooks').upsert(local.map((notebook) => notebookToRow(notebook, userId)), { onConflict: 'id' });
        if (!active) return;
        if (migrateError) { setReady(true); setSyncState('offline'); return; }
        setNotebooks(local); latest.current = local; setReady(true); setSyncState('synced'); setSavedAt(Date.now()); return;
      }
      const missingLocal = local.filter((item) => !cloud.some((remote) => remote.id === item.id));
      if (missingLocal.length > 0) {
        await supabase.from('notebooks').upsert(missingLocal.map((notebook) => notebookToRow(notebook, userId)), { onConflict: 'id' });
      }
      const merged = [...cloud, ...missingLocal].sort((a, b) => b.updatedAt - a.updatedAt);
      if (!active) return;
      setNotebooks(merged); latest.current = merged; saveLocalNotebooks(userId, merged); setReady(true); setSyncState('synced');
    })();
    return () => { active = false; };
  }, [userId]);

  const persistCloud = useCallback(async (list: NotebookData[]) => {
    if (!userId) return false;
    setSyncState('syncing');
    const { error } = await supabase.from('notebooks').upsert(list.map((notebook) => notebookToRow(notebook, userId)), { onConflict: 'id' });
    if (error) { setSaveError(true); setSyncState('offline'); return false; }
    setSaveError(false); setSyncState('synced'); setSavedAt(Date.now()); return true;
  }, [userId]);

  useEffect(() => {
    if (!userId || !ready || !dirty.current) return;
    const t = setTimeout(() => {
      const list = latest.current;
      saveLocalNotebooks(userId, list);
      dirty.current = false;
      void persistCloud(list);
    }, 600);
    return () => clearTimeout(t);
  }, [notebooks, userId, ready, persistCloud]);

  useEffect(() => () => {
    if (dirty.current && userId) saveLocalNotebooks(userId, latest.current);
  }, [userId]);
  useEffect(() => {
    const onHide = () => { if (dirty.current && userId) saveLocalNotebooks(userId, latest.current); };
    window.addEventListener('beforeunload', onHide);
    return () => window.removeEventListener('beforeunload', onHide);
  }, [userId]);

  const update = useCallback((id: string, fn: (nb: NotebookData) => NotebookData) => {
    dirty.current = true;
    setNotebooks((prev) => prev.map((nb) => nb.id === id ? { ...fn(nb), revision: nb.revision + 1, updatedAt: Date.now() } : nb));
  }, []);
  const add = useCallback((title: string, subject: SubjectKey, isRough = false) => {
    const nb = newNotebook(title, subject, isRough);
    dirty.current = true; setNotebooks((prev) => [...prev, nb]); return nb.id;
  }, []);
  const remove = useCallback((id: string) => {
    dirty.current = true; setNotebooks((prev) => prev.filter((nb) => nb.id !== id));
    if (userId) void supabase.from('notebooks').delete().eq('id', id).eq('user_id', userId);
  }, [userId]);
  return { notebooks, ready, saveError, savedAt, syncState, update, add, remove };
}
