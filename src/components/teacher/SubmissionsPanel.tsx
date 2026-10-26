import { useState } from 'react';
import { X, CheckCircle2, Clock, Users } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageView } from '@/components/notebook/PageView';
import { parseContent } from '@/lib/submission';
import { GRADE_PRESETS, gradeLetter, gradeLabel } from '@/utils/grade';
import {
  useAssignmentSubmissions, gradeSubmission, type AssignmentRow, type SubmissionRow,
} from '@/hooks/useTeacher';

export function SubmissionsPanel({
  assignment,
  initialSubmissionId,
  onClose,
  onChanged,
}: {
  assignment: AssignmentRow;
  initialSubmissionId?: string;
  onClose: () => void;
  onChanged: () => void;
}) {
  const { submissions, notSubmitted, loading, error, refresh } = useAssignmentSubmissions(
    assignment.id,
    assignment.class_id
  );
  const [selectedId, setSelectedId] = useState<string | null>(initialSubmissionId ?? null);
  const selected = submissions.find((s) => s.id === selectedId) ?? submissions[0] ?? null;

  const isLate = (s: SubmissionRow) =>
    !!s.submitted_at && new Date(s.submitted_at).getTime() > new Date(assignment.deadline).getTime();

  return (
    <div className="fixed inset-0 z-50 grid place-items-center p-3 bg-ink-900/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full max-w-5xl max-h-[92vh] overflow-y-auto rounded-2xl bg-paper dark:bg-ink-900 shadow-pop p-5"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="min-w-0">
            <h2 className="font-heading font-extrabold text-xl text-ink-600 dark:text-white">{assignment.title}</h2>
            <p className="text-sm text-ink-400 dark:text-ink-200">
              {assignment.class_name} · due{' '}
              {new Date(assignment.deadline).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
            </p>
          </div>
          <button onClick={onClose} aria-label="Close" className="w-11 h-11 grid place-items-center rounded-lg text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700 shrink-0">
            <X size={18} />
          </button>
        </div>

        {loading ? (
          <p className="text-sm text-ink-300 dark:text-ink-200">Loading submissions…</p>
        ) : error ? (
          <p className="text-sm text-clay-600 dark:text-clay-100">Couldn't load submissions: {error}</p>
        ) : (
          <div className="grid lg:grid-cols-[16rem_minmax(0,1fr)] gap-5 items-start">
            {/* Students */}
            <div className="space-y-3">
              <h3 className="text-sm font-semibold text-ink-500 dark:text-ink-100">
                Submitted ({submissions.length})
              </h3>
              {submissions.length === 0 && (
                <p className="text-sm text-ink-400 dark:text-ink-200">Nobody has submitted yet.</p>
              )}
              <ul className="space-y-2">
                {submissions.map((s) => (
                  <li key={s.id}>
                    <button
                      onClick={() => setSelectedId(s.id)}
                      className={`w-full text-left rounded-xl border p-3 min-h-[44px] ${
                        selected?.id === s.id
                          ? 'border-ink-500 bg-white dark:bg-ink-800'
                          : 'border-ink-100 dark:border-ink-700 bg-white/60 dark:bg-ink-800/60 hover:bg-white dark:hover:bg-ink-800'
                      }`}
                    >
                      <p className="font-heading font-bold text-sm text-ink-600 dark:text-white">{s.student_name}</p>
                      <div className="flex flex-wrap gap-1.5 mt-1.5">
                        {s.status === 'graded' ? (
                          <Badge tone="leaf"><CheckCircle2 size={12} /> {s.marks !== null ? gradeLabel(s.marks) : 'Graded'}</Badge>
                        ) : (
                          <Badge tone="amber"><Clock size={12} /> Needs grading</Badge>
                        )}
                        {isLate(s) && <Badge tone="clay">Late</Badge>}
                      </div>
                    </button>
                  </li>
                ))}
              </ul>

              {notSubmitted.length > 0 && (
                <div className="pt-1">
                  <h3 className="text-sm font-semibold text-ink-500 dark:text-ink-100 flex items-center gap-1.5 mb-1.5">
                    <Users size={14} /> Not submitted ({notSubmitted.length})
                  </h3>
                  <p className="text-sm text-ink-400 dark:text-ink-200">{notSubmitted.join(', ')}</p>
                </div>
              )}
            </div>

            {/* Work + grading */}
            <div className="min-w-0">
              {selected ? (
                <SubmissionDetail
                  key={selected.id}
                  submission={selected}
                  late={isLate(selected)}
                  onSaved={() => {
                    void refresh();
                    onChanged();
                  }}
                />
              ) : (
                <p className="text-sm text-ink-400 dark:text-ink-200">Pick a student to read their work.</p>
              )}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

function SubmissionDetail({
  submission,
  late,
  onSaved,
}: {
  submission: SubmissionRow;
  late: boolean;
  onSaved: () => void;
}) {
  const content = parseContent(submission.content);
  const [marks, setMarks] = useState(submission.marks !== null ? String(submission.marks) : '');
  const [feedback, setFeedback] = useState(submission.feedback ?? '');
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState<{ ok: boolean; text: string } | null>(null);

  const save = async () => {
    const n = Number(marks);
    if (marks.trim() === '' || Number.isNaN(n) || n < 0 || n > 100) {
      setMsg({ ok: false, text: 'Enter marks between 0 and 100.' });
      return;
    }
    setBusy(true);
    setMsg(null);
    const res = await gradeSubmission(submission.id, Math.round(n), feedback.trim());
    setBusy(false);
    if (!res.ok) {
      setMsg({ ok: false, text: res.message });
      return;
    }
    setMsg({ ok: true, text: 'Saved. The student can see this now.' });
    onSaved();
  };

  const fieldClass =
    'w-full px-3 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-ink-600 dark:text-white focus:outline-none focus:border-ink-400';

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-2">
        <h3 className="font-heading font-bold text-lg text-ink-600 dark:text-white">{submission.student_name}</h3>
        {late && <Badge tone="clay">Submitted late</Badge>}
        {submission.submitted_at && (
          <span className="text-xs text-ink-300 dark:text-ink-200">
            {new Date(submission.submitted_at).toLocaleString('en-GB', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
          </span>
        )}
      </div>

      {content ? (
        <div className="space-y-4">
          <p className="text-sm text-ink-400 dark:text-ink-200">
            From notebook: <span className="font-semibold">{content.notebookTitle}</span> · {content.pages.length}{' '}
            {content.pages.length === 1 ? 'page' : 'pages'}
          </p>
          <div className="space-y-4 max-w-[640px]">
            {content.pages.map((p, i) => (
              <div key={i}>
                <p className="text-xs text-ink-300 dark:text-ink-200 mb-1">Page {i + 1}</p>
                <PageView page={p} />
              </div>
            ))}
          </div>
        </div>
      ) : (
        <p className="text-sm text-ink-400 dark:text-ink-200 whitespace-pre-wrap">
          {submission.content || 'No content was sent.'}
        </p>
      )}

      <div className="rounded-xl bg-white dark:bg-ink-800 border border-ink-100/60 dark:border-ink-700/60 shadow-soft p-4 space-y-3 max-w-[640px]">
        <h4 className="font-heading font-bold text-ink-600 dark:text-white">Set the grade</h4>
        <div>
          <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1.5">Tap a grade, or type exact marks</span>
          <div className="flex flex-wrap gap-2">
            {GRADE_PRESETS.map((g) => (
              <button
                key={g.letter}
                type="button"
                onClick={() => setMarks(String(g.marks))}
                className={`h-11 px-4 rounded-xl border text-sm font-heading font-bold transition-colors ${
                  marks.trim() !== '' && !Number.isNaN(Number(marks)) && gradeLetter(Number(marks)) === g.letter
                    ? 'bg-ink-500 text-white border-ink-500'
                    : 'border-ink-100 dark:border-ink-700 text-ink-500 dark:text-ink-100 hover:bg-ink-50 dark:hover:bg-ink-700'
                }`}
              >
                {g.letter}
              </button>
            ))}
          </div>
        </div>
        <label className="block">
          <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1">Marks (out of 100)</span>
          <div className="flex items-center gap-3">
            <input
              type="number"
              min={0}
              max={100}
              value={marks}
              onChange={(e) => setMarks(e.target.value)}
              className={`${fieldClass} h-12 w-32 min-h-[44px]`}
            />
            {marks.trim() !== '' && !Number.isNaN(Number(marks)) && Number(marks) >= 0 && Number(marks) <= 100 && (
              <span className="font-heading font-bold text-ink-600 dark:text-white">= {gradeLetter(Number(marks))}</span>
            )}
          </div>
        </label>
        <label className="block">
          <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1">Feedback for the student</span>
          <textarea
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            rows={3}
            placeholder="What went well? What should they work on?"
            className={`${fieldClass} py-2`}
          />
        </label>
        {msg && (
          <p className={`text-sm rounded-lg px-3 py-2 ${msg.ok ? 'text-leaf-700 bg-leaf-50 dark:bg-leaf-700/20 dark:text-leaf-100' : 'text-clay-600 bg-clay-50 dark:bg-clay-500/20 dark:text-clay-100'}`}>
            {msg.text}
          </p>
        )}
        <Button size="md" onClick={save} disabled={busy}>
          {busy ? 'Saving…' : submission.status === 'graded' ? 'Update grade' : 'Save grade'}
        </Button>
      </div>
    </div>
  );
}

export default SubmissionsPanel;
