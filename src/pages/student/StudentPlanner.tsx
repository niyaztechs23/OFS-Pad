import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SubjectTag } from '@/components/ui/SubjectTag';
import { Loading, Empty, ErrorState } from '@/components/ui/StateMessage';
import { studentNav } from '@/data/nav';
import { subjects, type SubjectKey } from '@/data/mock';
import { useAuth } from '@/components/auth/AuthProvider';
import { useStudentAssignments } from '@/hooks/useStudent';
import { useStudentExams } from '@/hooks/useExams';
import { deadlineCountdown, useNow } from '@/utils/time';
import { CalendarDays, ClipboardList, GraduationCap } from 'lucide-react';

function subjectKeyFromName(name: string | null | undefined): SubjectKey {
  const found = Object.values(subjects).find((subject) => subject.key === name || subject.name.toLowerCase() === name?.toLowerCase());
  return found?.key ?? 'maths';
}

export function StudentPlanner() {
  const { session, profile } = useAuth();
  const now = useNow(30000);
  const { assignments, loading: assignmentsLoading, error: assignmentsError } = useStudentAssignments(session?.userId);
  const { exams, loading: examsLoading, error: examsError } = useStudentExams(session?.userId);
  const items = [
    ...assignments.map((assignment) => ({ id: assignment.id, type: 'assignment' as const, title: assignment.title, subject: subjectKeyFromName(assignment.subject), date: assignment.deadline, tone: assignment.status === 'graded' ? 'leaf' as const : 'amber' as const, label: assignment.status === 'graded' ? 'Graded' : deadlineCountdown(assignment.deadline, now).label })),
    ...exams.map((exam) => ({ id: exam.id, type: 'exam' as const, title: exam.title, subject: subjectKeyFromName(exam.subject), date: exam.starts_at, tone: 'ink' as const, label: deadlineCountdown(exam.starts_at, now).label })),
  ].sort((a, b) => +new Date(a.date) - +new Date(b.date));
  const loading = assignmentsLoading || examsLoading;
  const error = assignmentsError || examsError;

  return (
    <AppShell role="student" nav={studentNav} name={profile?.full_name?.split(' ')[0] ?? 'there'} notifications={[]}>
      <div className="space-y-6">
        <div>
          <h1 className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white">Planner</h1>
          <p className="text-ink-400 dark:text-ink-200 mt-1">Your live assignments and exams in chronological order.</p>
        </div>
        {loading ? <Loading label="Loading your planner…" /> : error ? <ErrorState message={`Couldn't load your planner: ${error}`} /> : items.length === 0 ? <Empty title="Your planner is clear" hint="Assignments and exams from your joined classes will appear here." /> : (
          <div className="relative pl-6">
            <span className="absolute left-2 top-1 bottom-1 w-px bg-ink-100 dark:bg-ink-700" />
            <ul className="space-y-4">
              {items.map((item) => {
                const Icon = item.type === 'exam' ? GraduationCap : ClipboardList;
                return <li key={`${item.type}-${item.id}`} className="relative">
                  <span className="absolute -left-[18px] top-4 w-3 h-3 rounded-full bg-white dark:bg-ink-800 border-2 border-ink-400 dark:border-ink-300" />
                  <Card hoverable>
                    <div className="flex items-start gap-3">
                      <span className={`w-10 h-10 shrink-0 rounded-xl grid place-items-center ${item.type === 'exam' ? 'bg-ink-50 text-ink-600 dark:bg-ink-700 dark:text-ink-100' : 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100'}`}><Icon size={20} /></span>
                      <div className="flex-1 min-w-0">
                        <div className="flex flex-wrap items-center gap-2 mb-1"><SubjectTag subject={item.subject} size="sm" /><Badge tone={item.tone}><CalendarDays size={12} /> {item.label}</Badge>{item.type === 'exam' && <Badge tone="ink">Exam</Badge>}</div>
                        <h3 className="font-heading font-bold text-ink-600 dark:text-white">{item.title}</h3>
                        <p className="text-xs text-ink-300 dark:text-ink-300 mt-1">{new Date(item.date).toLocaleDateString('en-GB', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</p>
                      </div>
                    </div>
                  </Card>
                </li>;
              })}
            </ul>
          </div>
        )}
      </div>
    </AppShell>
  );
}

export default StudentPlanner;
