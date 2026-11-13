import { subjectList, type SubjectKey } from '@/data/mock';

export type Tool = 'pen' | 'pencil' | 'highlighter' | 'eraser';
export type Pt = [number, number, number];
export type Stroke = { id: string; tool: Exclude<Tool, 'eraser'>; color: string; size: number; points: Pt[] };
export type NotebookPage = { id: string; strokes: Stroke[]; text: string };
export type NotebookData = {
  id: string; title: string; subject: SubjectKey; isRough: boolean;
  createdAt: number; updatedAt: number; revision: number; pages: NotebookPage[];
};
export type CloudNotebookRow = {
  id: string; user_id: string; title: string; subject: SubjectKey; is_rough: boolean;
  content: { pages?: NotebookPage[] } | null; revision: number; created_at: string; updated_at: string;
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);
const uuid = () => globalThis.crypto?.randomUUID?.() ?? `${Math.random().toString(36).slice(2)}-${Date.now().toString(36)}-0000-0000-000000000000`;
export const newPage = (): NotebookPage => ({ id: uid(), strokes: [], text: '' });
export function newNotebook(title: string, subject: SubjectKey, isRough = false): NotebookData {
  const now = Date.now();
  return { id: uuid(), title, subject, isRough, revision: 0, createdAt: now, updatedAt: now, pages: [newPage()] };
}
const storageKey = (userId: string) => `ofs:notebooks:v1:${userId}`;
function seed(): NotebookData[] {
  return [...subjectList.map((s) => newNotebook(`${s.name} Notebook`, s.key)), newNotebook('Rough Notebook', 'maths', true)];
}
function normaliseNotebook(value: Partial<NotebookData>): NotebookData | null {
  if (!value.id || !value.title || !value.subject) return null;
  return {
    id: /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(value.id) ? value.id : uuid(), title: value.title, subject: value.subject, isRough: Boolean(value.isRough),
    createdAt: Number(value.createdAt) || Date.now(), updatedAt: Number(value.updatedAt) || Date.now(),
    revision: Number(value.revision) || 0,
    pages: Array.isArray(value.pages) && value.pages.length > 0 ? value.pages : [newPage()],
  };
}
export function loadLocalNotebooks(userId: string): NotebookData[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw === null) return seed();
    const parsed = JSON.parse(raw) as unknown;
    if (!Array.isArray(parsed)) return seed();
    const notebooks = parsed.map((item) => normaliseNotebook(item as Partial<NotebookData>)).filter(Boolean) as NotebookData[];
    return notebooks.length > 0 ? notebooks : seed();
  } catch {
    return seed();
  }
}
export function saveLocalNotebooks(userId: string, list: NotebookData[]): boolean {
  try { localStorage.setItem(storageKey(userId), JSON.stringify(list)); return true; } catch { return false; }
}
export function rowToNotebook(row: CloudNotebookRow): NotebookData {
  return {
    id: row.id, title: row.title, subject: row.subject, isRough: row.is_rough,
    createdAt: new Date(row.created_at).getTime(), updatedAt: new Date(row.updated_at).getTime(),
    revision: row.revision ?? 0, pages: row.content?.pages?.length ? row.content.pages : [newPage()],
  };
}
export function notebookToRow(notebook: NotebookData, userId: string) {
  return {
    id: notebook.id, user_id: userId, title: notebook.title, subject: notebook.subject,
    is_rough: notebook.isRough, content: { pages: notebook.pages }, revision: notebook.revision,
    created_at: new Date(notebook.createdAt).toISOString(), updated_at: new Date(notebook.updatedAt).toISOString(),
  };
}
export function previewOf(nb: NotebookData): string {
  for (const p of nb.pages) { const t = p.text.trim(); if (t) return t.slice(0, 160); }
  return nb.pages.some((p) => p.strokes.length > 0) ? 'Handwritten notes' : 'An empty notebook. Open it and start writing.';
}
