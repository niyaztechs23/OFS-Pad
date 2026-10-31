import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { AssignmentCard, NotebookCard } from '@/components/widgets/Cards';
import { SubjectTag } from '@/components/ui/SubjectTag';
import { Loading, Empty, ErrorState } from '@/components/ui/StateMessage';
import { JoinClassModal } from '@/components/student/JoinClassModal';
import { studentNav } from '@/data/nav';
import { useAuth } from '@/components/auth/AuthProvider';
import { useStudentAssignments, useStudentClasses } from '@/hooks/useStudent';
import { useStudentDoubts } from '@/hooks/useCommunity';
import { useStudentExams } from '@/hooks/useExams';
import { useNotebooks } from '@/hooks/useNotebooks';
import { previewOf } from '@/lib/notebookStore';
import { toCardAssignment } from '@/utils/subject';
import { deadlineCountdown, timeAgo, useNow } from '@/utils/time';
import { MessageCircleQuestion, ArrowRight, CalendarDays, Sparkles, KeyRound, Users } from 'lucide-react';

export function StudentDashboard() {
  const { session, profile } = useAuth();
  const now = useNow(30000);
  const { assignments, loading, error, refresh } = useStudentAssignments(session?.userId);
  const { classes, refresh: refreshClasses } = useStudentClasses(session?.userId);
  const { doubts: liveDoubts } = useStudentDoubts(session?.userId);
  const { exams } = useStudentExams(session?.userId);
  const [showJoin, setShowJoin] = useState(false);
  const { notebooks } = useNotebooks(session?.userId);
  const recentNotebooks = notebooks
    .filter((n) => !n.isRough)
    .sort((a, b) => b.updatedAt - a.updatedAt)
    .slice(0, 6);

  const name = profile?.full_name?.split(' ')[0] ?? 'there';
  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  const dueSoon = assignments
    .filter((a) => a.status === 'pending')
    .sort((a, b) => +new Date(a.deadline) - +new Date(b.deadline))
    .slice(0, 3)
    .map((a) => toCardAssignment(a, now));

  const pendingCount = assignments.filter((a) => a.status === 'pending').length;

  const recentDoubts = liveDoubts.slice(0, 1);
  const openDoubtCount = liveDoubts.filter((d) => d.status === 'open').length;

  const onJoined = () => {
    void refresh();
    void refreshClasses();
  };

  return (
    <AppShell role="student" nav={studentNav} name={name} notifications={[]}>
      <div className="space-y-7">
        {/* Greeting */}
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-600 dark:text-white">
              {greeting}, {name}
            </h1>
            <p className="text-ink-400 dark:text-ink-200 mt-1">
              {loading
                ? 'Checking your assignments…'
                : pendingCount === 0
                ? "You're all caught up. Nothing is waiting for you."
                : `You have ${pendingCount} ${pendingCount === 1 ? 'assignment' : 'assignments'} waiting.`}
            </p>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button size="md" onClick={() => setShowJoin(true)}>
              <KeyRound size={16} /> Join class
            </Button>
            <Link to="/student/planner">
              <Button variant="secondary" size="md">
                <CalendarDays size={16} /> Open planner
              </Button>
            </Link>
          </div>
        </section>

        {/* My classes */}
        {classes.length > 0 && (
          <section className="flex flex-wrap items-center gap-2">
            <span className="text-sm font-semibold text-ink-400 dark:text-ink-200 inline-flex items-center gap-1">
              <Users size={14} /> My classes
            </span>
            {classes.map((c) => (
              <Badge key={c.id} tone="ink">{c.name}</Badge>
            ))}
          </section>
        )}

        {/* Due soon */}
        <section>
          <SectionHeader title="Due soon" link="/student/assignments" />
          {loading ? (
            <Loading label="Loading assignments…" />
          ) : error ? (
            <ErrorState message={`Couldn't load assignments: ${error}`} />
          ) : classes.length === 0 && assignments.length === 0 ? (
            <Empty
              title="You haven't joined a class yet"
              hint="Tap Join class and enter the code your teacher gave you."
            />
          ) : dueSoon.length === 0 ? (
            <Empty title="Nothing due soon" hint="New assignments from your teachers will appear here." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {dueSoon.map((a) => (
                <AssignmentCard key={a.id} assignment={a} />
              ))}
            </div>
          )}
        </section>

        {/* Upcoming exams strip */}
        <section>
          <SectionHeader title="Upcoming exams" link="/student/planner" />
          {exams.length === 0 ? <Empty title="No exams scheduled" hint="Your teachers will publish exams for joined classes here." /> : <div className="flex gap-3 overflow-x-auto no-scrollbar pb-1 -mx-1 px-1">
            {exams.slice(0, 6).map((e) => (
              <div
                key={e.id}
                className="shrink-0 w-60 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-4 shadow-soft"
              >
                <div className="flex items-center justify-between">
                  <SubjectTag subject={e.subject as 'maths' | 'science' | 'english' | 'history' | 'computer'} size="sm" />
                  <Badge tone="amber"><CalendarDays size={12} /> {new Date(e.starts_at).toLocaleDateString()}</Badge>
                </div>
                <h3 className="font-heading font-bold text-ink-600 dark:text-white mt-3">{e.title}</h3>
                <p className="text-xs text-ink-300 dark:text-ink-200 mt-1">
                  {deadlineCountdown(e.starts_at, now).label} · {e.class_name}
                </p>
              </div>
            ))}
          </div>}
        </section>

        {/* My notebooks */}
        <section>
          <SectionHeader title="My notebooks" link="/student/notebooks" />
          <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {recentNotebooks.map((n) => (
              <Link key={n.id} to={`/student/notebooks/${n.id}`} className="block">
                <NotebookCard
                  subject={n.subject}
                  title={n.title}
                  pages={n.pages.length}
                  updated={timeAgo(n.updatedAt)}
                  preview={previewOf(n)}
                />
              </Link>
            ))}
          </div>
        </section>

        {/* Live Doubt Wall shortcut */}
        <section>
          <Card className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-gradient-to-br from-ink-50 to-leaf-50 dark:from-ink-800 dark:to-ink-800 border-ink-100/60 dark:border-ink-700/60">
            <div className="flex items-start gap-4">
              <span className="w-12 h-12 shrink-0 rounded-xl bg-ink-500 text-white grid place-items-center">
                <MessageCircleQuestion size={24} />
              </span>
              <div>
                <h3 className="font-heading font-bold text-lg text-ink-600 dark:text-white">Doubt Wall</h3>
                <p className="text-sm text-ink-400 dark:text-ink-200">
                  Ask anonymously and help classmates. {openDoubtCount} doubts waiting for an answer.
                </p>
                {recentDoubts[0] && (
                  <p className="text-xs text-ink-400 dark:text-ink-200 mt-2 italic">
                    “{recentDoubts[0].question}”
                  </p>
                )}
              </div>
            </div>
            <Link to="/student/doubts">
              <Button size="md">Open Doubt Wall <ArrowRight size={16} /></Button>
            </Link>
          </Card>
        </section>

        <p className="text-center text-xs text-ink-300 dark:text-ink-300 pt-2 flex items-center justify-center gap-1">
          <Sparkles size={12} /> The Doubt Wall is live; exam scheduling will connect here next.
        </p>
      </div>

      {showJoin && <JoinClassModal onClose={() => setShowJoin(false)} onJoined={onJoined} />}
    </AppShell>
  );
}

function SectionHeader({ title, link }: { title: string; link: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-heading font-bold text-lg text-ink-600 dark:text-white">{title}</h2>
      <Link to={link} className="text-sm font-semibold text-ink-500 hover:text-ink-600 dark:text-ink-100 inline-flex items-center gap-1">
        View all <ArrowRight size={14} />
      </Link>
    </div>
  );
}

export default StudentDashboard;
