import type { NotebookData, NotebookPage, Stroke } from '@/lib/notebookStore';

export type SubmittedPage = { strokes: Stroke[]; text: string };
export type SubmissionContent = {
  v: 1;
  notebookTitle: string;
  subject: string;
  pages: SubmittedPage[];
};

// The submission is stored as text in the database; keep it under this size.
export const MAX_SUBMISSION_CHARS = 3_500_000;

export const pageHasContent = (p: NotebookPage) => p.strokes.length > 0 || p.text.trim().length > 0;

export function buildContent(nb: NotebookData, pages: NotebookPage[]): string {
  const content: SubmissionContent = {
    v: 1,
    notebookTitle: nb.title,
    subject: nb.subject,
    pages: pages.map((p) => ({ strokes: p.strokes, text: p.text })),
  };
  return JSON.stringify(content);
}

export function parseContent(raw: string | null): SubmissionContent | null {
  if (!raw) return null;
  try {
    const data = JSON.parse(raw) as SubmissionContent;
    if (data && data.v === 1 && Array.isArray(data.pages)) return data;
    return null;
  } catch {
    return null;
  }
}
