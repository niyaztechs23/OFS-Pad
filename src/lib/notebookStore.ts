import { subjectList, type SubjectKey } from '@/data/mock';

export type Tool = 'pen' | 'pencil' | 'highlighter' | 'eraser';
export type Pt = [number, number, number]; // x, y, pressure
export type Stroke = {
  id: string;
  tool: Exclude<Tool, 'eraser'>;
  color: string;
  size: number;
  points: Pt[];
};
export type NotebookPage = { id: string; strokes: Stroke[]; text: string };
export type NotebookData = {
  id: string;
  title: string;
  subject: SubjectKey;
  isRough: boolean;
  createdAt: number;
  updatedAt: number;
  pages: NotebookPage[];
};

export const uid = () => Math.random().toString(36).slice(2, 10) + Date.now().toString(36);

export const newPage = (): NotebookPage => ({ id: uid(), strokes: [], text: '' });

export function newNotebook(title: string, subject: SubjectKey, isRough = false): NotebookData {
  const now = Date.now();
  return { id: uid(), title, subject, isRough, createdAt: now, updatedAt: now, pages: [newPage()] };
}

const storageKey = (userId: string) => `ofs:notebooks:v1:${userId}`;

function seed(): NotebookData[] {
  const list = subjectList.map((s) => newNotebook(`${s.name} Notebook`, s.key));
  list.push(newNotebook('Rough Notebook', 'maths', true));
  return list;
}

export function loadNotebooks(userId: string): NotebookData[] {
  try {
    const raw = localStorage.getItem(storageKey(userId));
    if (raw === null) {
      const fresh = seed();
      saveNotebooks(userId, fresh);
      return fresh;
    }
    const parsed = JSON.parse(raw) as NotebookData[];
    return Array.isArray(parsed) ? parsed : seed();
  } catch {
    return seed();
  }
}

export function saveNotebooks(userId: string, list: NotebookData[]): boolean {
  try {
    localStorage.setItem(storageKey(userId), JSON.stringify(list));
    return true;
  } catch {
    return false; // storage full or blocked
  }
}

export function previewOf(nb: NotebookData): string {
  for (const p of nb.pages) {
    const t = p.text.trim();
    if (t) return t.slice(0, 160);
  }
  const hasInk = nb.pages.some((p) => p.strokes.length > 0);
  return hasInk ? 'Handwritten notes' : 'An empty notebook. Open it and start writing.';
}
