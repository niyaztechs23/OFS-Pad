import { useMemo, useState } from 'react';
import { X, Send, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { subjects } from '@/data/mock';
import { useStudentAssignments, submitWork } from '@/hooks/useStudent';
import { buildContent, pageHasContent, MAX_SUBMISSION_CHARS } from '@/lib/submission';
import type { NotebookData } from '@/lib/notebookStore';

export function SubmitModal({
  notebook,
  studentId,
  onClose,
}: {
  notebook: NotebookData;
  studentId: string;
  onClose: () => void;
}) {
  const { assignments, loading, error } = useStudentAssignments(studentId);
  const [assignmentId, setAssignmentId] = useState<string>('');
  const filledIdx = useMemo(
    () => notebook.pages.map((p, i) => (pageHasContent(p) ? i : -1)).filter((i) => i >= 0),
    [notebook.pages]
  );
  const [picked, setPicked] = useState<number[]>(filledIdx);
  const [busy, setBusy] = useState(false);
  const [problem, setProblem] = useState<string | null>(null);
  const [done, setDone] = useState(false);

  const subjectName = subjects[notebook.subject]?.name?.toLowerCase();
  const open = assignments
    .filter((a) => a.status !== 'graded')
    .sort((a, b) => {
      const am = a.subject?.toLowerCase() === subjectName ? 0 : 1;
      const bm = b.subject?.toLowerCase() === subjectName ? 0 : 1;
      return am - bm || +new Date(a.deadline) - +new Date(b.deadline);
    });

  const toggle = (i: number) =>
    setPicked((prev) => (prev.includes(i) ? prev.filter((x) => x !== i) : [...prev, i].sort((a, b) => a - b)));

  const submit = async () => {
    setProblem(null);
    const pages = picked.map((i) => notebook.pages[i]);
    const content = buildContent(notebook, pages);
    if (content.length > MAX_SUBMISSION_CHARS) {
      setProblem('This is too big to send. Try submitting fewer pages at a time.');
      return;
    }
    setBusy(true);
    const res = await submitWork(assignmentId, studentId, content);
    setBusy(false);
    if (!res.ok) {
      setProblem(res.message);
      return;
    }
    setDone(true);
  };

  const canSend = !!assignmentId && picked.length > 0 && !busy;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-lg max-h-[90vh] overflow-y-auto rounded-2xl bg-white dark:bg-ink-800 shadow-pop p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-extrabold text-xl text-ink-600 dark:text-white">Submit to your teacher</h2>
          <button onClick={onClose} aria-label="Close" className="w-11 h-11 grid place-items-center rounded-lg text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700">
            <X size={18} />
          </button>
        </div>

        {done ? (
          <div className="text-center space-y-4 py-2">
            <span className="mx-auto w-14 h-14 rounded-full bg-leaf-50 text-leaf-600 dark:bg-leaf-700/30 dark:text-leaf-100 grid place-items-center">
              <CheckCircle2 size={30} />
            </span>
            <div>
              <p className="font-heading font-bold text-lg text-ink-600 dark:text-white">Submitted!</p>
              <p className="text-sm text-ink-400 dark:text-ink-200 mt-1">
                Your teacher can now read it. You can send it again until it is graded.
              </p>
            </div>
            <Button size="md" fullWidth onClick={onClose}>Done</Button>
          </div>
        ) : (
          <div className="space-y-5">
            <section>
              <h3 className="text-sm font-semibold text-ink-500 dark:text-ink-100 mb-2">1. Which assignment is this for?</h3>
              {loading ? (
                <p className="text-sm text-ink-300 dark:text-ink-200">Loading your assignments…</p>
              ) : error ? (
                <p className="text-sm text-clay-600 dark:text-clay-100">Couldn't load assignments: {error}</p>
              ) : open.length === 0 ? (
                <p className="text-sm text-ink-400 dark:text-ink-200">
                  You have no open assignments. Join a class on the Home page to receive some.
                </p>
              ) : (
                <ul className="space-y-2 max-h-52 overflow-y-auto no-scrollbar">
                  {open.map((a) => (
                    <li key={a.id}>
                      <label
                        className={`flex items-start gap-3 rounded-xl border p-3 cursor-pointer min-h-[44px] ${
                          assignmentId === a.id
                            ? 'border-ink-500 bg-ink-50 dark:bg-ink-700/60'
                            : 'border-ink-100 dark:border-ink-700 hover:bg-ink-50/60 dark:hover:bg-ink-700/30'
                        }`}
                      >
                        <input
                          type="radio"
                          name="assignment"
                          checked={assignmentId === a.id}
                          onChange={() => setAssignmentId(a.id)}
                          className="mt-1 accent-[#2B4C7E]"
                        />
                        <span className="min-w-0">
                          <span className="block font-heading font-bold text-sm text-ink-600 dark:text-white">{a.title}</span>
                          <span className="block text-xs text-ink-300 dark:text-ink-200">
                            {a.class_name} · due {new Date(a.deadline).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                            {a.status === 'submitted' ? ' · already submitted (this will replace it)' : ''}
                          </span>
                        </span>
                      </label>
                    </li>
                  ))}
                </ul>
              )}
            </section>

            <section>
              <h3 className="text-sm font-semibold text-ink-500 dark:text-ink-100 mb-2">2. Which pages should we send?</h3>
              {filledIdx.length === 0 ? (
                <p className="text-sm text-ink-400 dark:text-ink-200">Write or type something on a page first.</p>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {filledIdx.map((i) => (
                    <label
                      key={i}
                      className={`h-11 px-4 inline-flex items-center gap-2 rounded-xl border cursor-pointer text-sm font-semibold ${
                        picked.includes(i)
                          ? 'border-ink-500 bg-ink-50 text-ink-600 dark:bg-ink-700/60 dark:text-white'
                          : 'border-ink-100 dark:border-ink-700 text-ink-400 dark:text-ink-200'
                      }`}
                    >
                      <input type="checkbox" checked={picked.includes(i)} onChange={() => toggle(i)} className="accent-[#2B4C7E]" />
                      Page {i + 1}
                    </label>
                  ))}
                </div>
              )}
            </section>

            {problem && (
              <p className="text-sm text-clay-600 dark:text-clay-100 bg-clay-50 dark:bg-clay-500/20 rounded-lg px-3 py-2">{problem}</p>
            )}

            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="md" onClick={onClose}>Cancel</Button>
              <Button size="md" onClick={submit} disabled={!canSend}>
                <Send size={16} /> {busy ? 'Sending…' : 'Submit'}
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default SubmitModal;
