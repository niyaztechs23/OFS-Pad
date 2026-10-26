import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SubjectTag } from '@/components/ui/SubjectTag';
import { Loading, Empty, ErrorState } from '@/components/ui/StateMessage';
import { studentNav } from '@/data/nav';
import { studentNotifications } from '@/data/mock';
import { useAuth } from '@/components/auth/AuthProvider';
import { useStudentAssignments } from '@/hooks/useStudent';
import { toCardAssignment } from '@/utils/subject';
import { deadlineCountdown, useNow } from '@/utils/time';
import { gradeLabel } from '@/utils/grade';
import { CheckCircle2, Clock, AlertCircle, FileText, Send, MessageSquareText, NotebookPen } from 'lucide-react';

type Tab = 'all' | 'upcoming' | 'overdue' | 'graded';

export function StudentAssignments() {
  const { session, profile } = useAuth();
  const now = useNow(30000);
  const { assignments, loading, error } = useStudentAssignments(session?.userId);
  const [tab, setTab] = useState<Tab>('all');

  const name = profile?.full_name?.split(' ')[0] ?? 'there';

  const items = [...assignments]
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline))
    .map((a) => ({ real: a, card: toCardAssignment(a, now) }));

  const filtered = items.filter(({ card }) => {
    if (tab === 'all') return true;
    if (tab === 'upcoming') return card.status === 'upcoming';
    if (tab === 'overdue') return card.status === 'overdue';
    if (tab === 'graded') return card.status === 'graded';
    return true;
  });

  const tabs: { key: Tab; label: string }[] = [
    { key: 'all', label: 'All' },
    { key: 'upcoming', label: 'Upcoming' },
    { key: 'overdue', label: 'Overdue' },
    { key: 'graded', label: 'Graded' },
  ];

  return (
    <AppShell role="student" nav={studentNav} name={name} notifications={studentNotifications}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white">Assignments</h1>
          <p className="text-ink-400 dark:text-ink-200 mt-1">Track everything your teachers have set.</p>
        </div>

        <div className="flex gap-1 p-1 bg-ink-100/70 dark:bg-ink-800 rounded-xl w-full sm:w-auto overflow-x-auto no-scrollbar">
          {tabs.map((t) => (
            <button
              key={t.key}
              onClick={() => setTab(t.key)}
              className={`h-10 px-4 rounded-lg text-sm font-heading font-semibold transition-colors min-h-[44px] ${
                tab === t.key ? 'bg-white dark:bg-ink-700 text-ink-600 dark:text-white shadow-sm' : 'text-ink-400 dark:text-ink-200'
              }`}
            >
              {t.label}
            </button>
          ))}
        </div>

        {loading ? (
          <Loading label="Loading assignments…" />
        ) : error ? (
          <ErrorState message={`Couldn't load assignments: ${error}`} />
        ) : filtered.length === 0 ? (
          <Empty
            title={assignments.length === 0 ? 'No assignments yet' : 'Nothing here'}
            hint={
              assignments.length === 0
                ? 'Join a class from the Home page, and your teacher’s assignments will show up here.'
                : 'Try another tab.'
            }
          />
        ) : (
          <div className="space-y-3">
            {filtered.map(({ real, card }) => {
              const d = deadlineCountdown(card.dueDate, now);
              const StatusIcon =
                card.status === 'graded'
                  ? CheckCircle2
                  : card.status === 'submitted'
                  ? Send
                  : card.status === 'overdue'
                  ? AlertCircle
                  : Clock;
              const badgeLabel =
                card.status === 'graded'
                  ? real.marks !== null ? `Graded: ${gradeLabel(real.marks)}` : 'Graded'
                  : card.status === 'submitted'
                  ? 'Submitted'
                  : d.label;
              const badgeTone =
                card.status === 'graded' || card.status === 'submitted' ? 'leaf' : d.tone;
              return (
                <Card key={real.id} hoverable className="flex items-start gap-4">
                  <span className={`w-11 h-11 shrink-0 rounded-xl grid place-items-center ${
                    card.status === 'graded' || card.status === 'submitted'
                      ? 'bg-leaf-50 text-leaf-600 dark:bg-leaf-700/30 dark:text-leaf-100'
                      : card.status === 'overdue'
                      ? 'bg-clay-50 text-clay-600 dark:bg-clay-500/20 dark:text-clay-100'
                      : 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100'
                  }`}>
                    <StatusIcon size={22} />
                  </span>
                  <div className="flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <SubjectTag subject={card.subject} size="sm" />
                      {real.class_name && (
                        <span className="text-xs text-ink-300 dark:text-ink-200">{real.class_name}</span>
                      )}
                      <Badge tone={badgeTone as 'leaf' | 'amber' | 'clay'}>
                        <Clock size={12} /> {badgeLabel}
                      </Badge>
                    </div>
                    <h3 className="font-heading font-bold text-ink-600 dark:text-white">{real.title}</h3>
                    {real.description && (
                      <p className="text-sm text-ink-400 dark:text-ink-200 mt-0.5">{real.description}</p>
                    )}
                    <p className="text-xs text-ink-300 dark:text-ink-300 mt-2 flex items-center gap-1">
                      <FileText size={12} /> Due{' '}
                      {new Date(real.deadline).toLocaleString('en-GB', {
                        day: 'numeric',
                        month: 'short',
                        year: 'numeric',
                        hour: '2-digit',
                        minute: '2-digit',
                      })}
                    </p>

                    {real.feedback && (
                      <div className="mt-3 rounded-lg bg-leaf-50 dark:bg-leaf-700/20 px-3 py-2.5">
                        <p className="text-xs font-bold text-leaf-700 dark:text-leaf-100 flex items-center gap-1 mb-0.5">
                          <MessageSquareText size={12} /> Teacher feedback
                        </p>
                        <p className="text-sm text-ink-600 dark:text-ink-100 whitespace-pre-wrap">{real.feedback}</p>
                      </div>
                    )}

                    {real.status === 'pending' && (
                      <Link
                        to="/student/notebooks"
                        className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-ink-500 hover:text-ink-600 dark:text-ink-100"
                      >
                        <NotebookPen size={14} /> Open a notebook to submit
                      </Link>
                    )}
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default StudentAssignments;
