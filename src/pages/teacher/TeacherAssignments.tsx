import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SubjectTag } from '@/components/ui/SubjectTag';
import { teacherNav } from '@/data/nav';
import { teacherNotifications, subjects, type SubjectKey } from '@/data/mock';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTeacherAssignments, type AssignmentRow } from '@/hooks/useTeacher';
import { SubmissionsPanel } from '@/components/teacher/SubmissionsPanel';
import { CreateAssignmentModal } from '@/components/teacher/TeacherModals';
import { Loading, Empty, ErrorState } from '@/components/ui/StateMessage';
import { deadlineCountdown } from '@/utils/time';
import { Plus, Inbox } from 'lucide-react';

function subjectKeyFromName(name: string | null): SubjectKey {
  if (!name) return 'maths';
  for (const s of Object.values(subjects)) {
    if (s.name.toLowerCase() === name.toLowerCase()) return s.key;
  }
  return 'maths';
}

export function TeacherAssignments() {
  const { session, profile } = useAuth();
  const { assignments, loading, error, refresh } = useTeacherAssignments(session?.userId);
  const [showCreate, setShowCreate] = useState(false);
  const [reviewing, setReviewing] = useState<AssignmentRow | null>(null);
  const [focusSubmission, setFocusSubmission] = useState<string | undefined>(undefined);
  const [params, setParams] = useSearchParams();

  // Arriving from a notification: open that assignment's submissions straight away.
  useEffect(() => {
    const target = params.get('review');
    if (!target || loading) return;
    const found = assignments.find((a) => a.id === target);
    if (found) {
      setFocusSubmission(params.get('submission') ?? undefined);
      setReviewing(found);
    }
    setParams({}, { replace: true });
  }, [params, assignments, loading, setParams]);
  const teacherName = profile?.full_name?.split(' ')[0] ?? 'there';

  return (
    <AppShell role="teacher" nav={teacherNav} name={teacherName} notifications={teacherNotifications}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white">Assignments</h1>
            <p className="text-ink-400 dark:text-ink-200 mt-1">Set work and track submissions.</p>
          </div>
          <Button size="md" onClick={() => setShowCreate(true)}><Plus size={16} /> Create assignment</Button>
        </div>

        {loading ? (
          <Loading label="Loading assignments…" />
        ) : error ? (
          <ErrorState message={`Couldn't load assignments: ${error}`} />
        ) : assignments.length === 0 ? (
          <Empty title="No assignments yet" hint="Create an assignment for one of your classes." />
        ) : (
          <div className="space-y-3">
            {assignments.map((a) => {
              const d = deadlineCountdown(a.deadline);
              return (
                <Card key={a.id} hoverable>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <SubjectTag subject={subjectKeyFromName(a.subject)} size="sm" />
                      <span className="text-xs text-ink-300 dark:text-ink-200">{a.class_name}</span>
                    </div>
                    <Badge tone={d.tone as 'leaf' | 'amber' | 'clay'}>
                      {d.label}
                    </Badge>
                  </div>
                  <h3 className="font-heading font-bold text-ink-600 dark:text-white">{a.title}</h3>
                  {a.description && (
                    <p className="text-sm text-ink-400 dark:text-ink-200 mt-1">{a.description}</p>
                  )}
                  <div className="flex flex-wrap items-center justify-between gap-2 mt-3 pt-3 border-t border-ink-50 dark:border-ink-700/60">
                    <p className="text-xs text-ink-300 dark:text-ink-200">
                      Due {new Date(a.deadline).toLocaleString('en-GB', {
                        day: 'numeric', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit',
                      })}
                    </p>
                    <Button variant="secondary" size="sm" onClick={() => setReviewing(a)}>
                      <Inbox size={16} /> Review {a.submission_count ?? 0} submission{(a.submission_count ?? 0) === 1 ? '' : 's'}
                    </Button>
                  </div>
                </Card>
              );
            })}
          </div>
        )}
      </div>

      {reviewing && (
        <SubmissionsPanel
          assignment={reviewing}
          initialSubmissionId={focusSubmission}
          onClose={() => {
            setReviewing(null);
            setFocusSubmission(undefined);
          }}
          onChanged={refresh}
        />
      )}

      {showCreate && session && (
        <CreateAssignmentModal
          teacherId={session.userId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refresh();
          }}
        />
      )}
    </AppShell>
  );
}

export default TeacherAssignments;
