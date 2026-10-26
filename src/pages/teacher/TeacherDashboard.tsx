import { useState } from 'react';
import { Link } from 'react-router-dom';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SubjectTag } from '@/components/ui/SubjectTag';
import { ProgressBar } from '@/components/widgets/Cards';
import { teacherNav } from '@/data/nav';
import {
  subjects,
  type SubjectKey,
} from '@/data/mock';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTeacherClasses, useTeacherAssignments, useToGrade } from '@/hooks/useTeacher';
import { useTeacherDoubts } from '@/hooks/useCommunity';
import { CreateAssignmentModal } from '@/components/teacher/TeacherModals';
import { Loading, Empty, ErrorState } from '@/components/ui/StateMessage';
import { deadlineCountdown, timeAgo, useNow } from '@/utils/time';
import { Plus, Users, AlertTriangle, ClipboardList, MessageCircleQuestion, ArrowRight, Copy, Check } from 'lucide-react';

function subjectKeyFromName(name: string): SubjectKey {
  for (const s of Object.values(subjects)) {
    if (s.name.toLowerCase() === name.toLowerCase()) return s.key;
  }
  return 'maths';
}

export function TeacherDashboard() {
  const { session, profile } = useAuth();
  const now = useNow(60000);
  const { classes, loading, error } = useTeacherClasses(session?.userId);
  const { assignments, refresh: refreshAssignments } = useTeacherAssignments(session?.userId);
  const toGrade = useToGrade(session?.userId);
  const { doubts: liveDoubts } = useTeacherDoubts(session?.userId);
  const [showCreate, setShowCreate] = useState(false);
  const [copiedId, setCopiedId] = useState<string | null>(null);

  const teacherName = profile?.full_name?.split(' ')[0] ?? 'there';
  const hour = new Date(now).getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';
  const ungraded = toGrade.items.length;

  const copyCode = async (id: string, code: string) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedId(id);
      setTimeout(() => setCopiedId((cur) => (cur === id ? null : cur)), 1500);
    } catch {
      window.prompt('Copy this join code:', code);
    }
  };

  const studentCount = new Map(classes.map((c) => [c.id, c.student_count]));
  const progressList = assignments.slice(0, 4).map((a) => {
    const total = studentCount.get(a.class_id) ?? 0;
    const pct = total > 0 ? Math.min(100, Math.round(((a.submission_count ?? 0) / total) * 100)) : 0;
    return { a, pct, total };
  });
  const unanswered = liveDoubts.filter((d) => d.status === 'open').length;

  return (
    <AppShell role="teacher" nav={teacherNav} name={teacherName} notifications={[]}>
      <div className="space-y-7">
        <section className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-600 dark:text-white">
              {greeting}, {teacherName}
            </h1>
            <p className="text-ink-400 dark:text-ink-200 mt-1">
              {ungraded} submissions need grading · {unanswered} doubts unanswered.
            </p>
          </div>
          <Button size="md" onClick={() => setShowCreate(true)}><Plus size={16} /> Create assignment</Button>
        </section>

        {/* My classes */}
        <section>
          <SectionHeader title="My classes" link="/teacher/classes" />
          {loading ? (
            <Loading label="Loading your classes…" />
          ) : error ? (
            <ErrorState message={`Couldn't load your classes: ${error}`} />
          ) : classes.length === 0 ? (
            <Empty title="No classes yet" hint="Create a class to get a join code to share." />
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {classes.map((c) => (
                <Card key={c.id} hoverable>
                  <div className="flex items-center justify-between mb-3">
                    <SubjectTag subject={subjectKeyFromName(c.subject)} size="sm" />
                    <span className="inline-flex items-center gap-1 text-xs text-ink-300 dark:text-ink-200">
                      <Users size={14} /> {c.student_count}
                    </span>
                  </div>
                  <h3 className="font-heading font-bold text-ink-600 dark:text-white">{c.name}</h3>
                  <div className="mt-4 flex items-center justify-between rounded-xl bg-paper-warm/60 dark:bg-ink-700/40 px-3 py-2">
                    <div>
                      <p className="text-[10px] uppercase tracking-wider text-ink-300 dark:text-ink-300">Join code</p>
                      <p className="font-heading font-bold text-ink-600 dark:text-white tracking-wider">{c.join_code}</p>
                    </div>
                    <button
                      onClick={() => copyCode(c.id, c.join_code)}
                      aria-label="Copy join code"
                      className="w-9 h-9 grid place-items-center rounded-lg text-ink-400 hover:bg-white dark:hover:bg-ink-800 dark:text-ink-200 min-h-[44px]"
                    >
                      {copiedId === c.id ? <Check size={16} /> : <Copy size={16} />}
                    </button>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Assignment progress */}
        <section>
          <SectionHeader title="Assignment progress" link="/teacher/assignments" />
          {progressList.length === 0 ? (
            <Empty title="No assignments yet" hint="Create an assignment and watch submissions come in here." />
          ) : (
            <div className="space-y-3">
              {progressList.map(({ a, pct, total }) => (
                <Card key={a.id} hoverable>
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <div className="flex items-center gap-2">
                      <SubjectTag subject={subjectKeyFromName(a.subject ?? a.class_name ?? '')} size="sm" />
                      <span className="text-xs text-ink-300 dark:text-ink-200">{a.class_name}</span>
                    </div>
                    <Badge tone={deadlineCountdown(a.deadline, now).tone}>
                      {deadlineCountdown(a.deadline, now).label}
                    </Badge>
                  </div>
                  <h3 className="font-heading font-bold text-ink-600 dark:text-white mb-2">{a.title}</h3>
                  <div className="flex items-center gap-3">
                    <ProgressBar value={pct} tone={pct >= 75 ? 'leaf' : pct >= 40 ? 'amber' : 'ink'} />
                    <span className="text-sm font-semibold text-ink-500 dark:text-ink-100 shrink-0 w-24 text-right">
                      {a.submission_count ?? 0}/{total} done
                    </span>
                  </div>
                </Card>
              ))}
            </div>
          )}
        </section>

        {/* Needs attention */}
        <section>
          <SectionHeader title="Needs attention" />
          <div className="grid sm:grid-cols-2 gap-4">
            {/* Ungraded */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-9 h-9 rounded-lg bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100 grid place-items-center">
                  <ClipboardList size={18} />
                </span>
                <h3 className="font-heading font-bold text-ink-600 dark:text-white">Ungraded submissions</h3>
                <Badge tone="amber" className="ml-auto">{ungraded}</Badge>
              </div>
              {toGrade.items.length === 0 ? (
                <p className="text-sm text-ink-400 dark:text-ink-200">Nothing waiting. You're all caught up.</p>
              ) : (
                <ul className="space-y-2">
                  {toGrade.items.slice(0, 3).map((s) => (
                    <li key={s.id} className="flex items-center justify-between gap-2 rounded-lg bg-paper-warm/50 dark:bg-ink-700/30 px-3 py-2">
                      <div className="min-w-0">
                        <p className="text-sm font-semibold text-ink-600 dark:text-white truncate">{s.student_name}</p>
                        <p className="text-xs text-ink-300 dark:text-ink-200 truncate">{s.title}</p>
                      </div>
                      <span className="text-xs text-ink-300 dark:text-ink-300 shrink-0">{timeAgo(s.submitted_at, now)}</span>
                    </li>
                  ))}
                </ul>
              )}
              <Link to="/teacher/assignments" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-500 dark:text-ink-100">
                Review submissions <ArrowRight size={14} />
              </Link>
            </Card>

            {/* Unanswered doubts */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <span className="w-9 h-9 rounded-lg bg-clay-50 text-clay-600 dark:bg-clay-500/20 dark:text-clay-100 grid place-items-center">
                  <MessageCircleQuestion size={18} />
                </span>
                <h3 className="font-heading font-bold text-ink-600 dark:text-white">Unanswered doubts</h3>
                <Badge tone="clay" className="ml-auto">{unanswered}</Badge>
              </div>
              <ul className="space-y-2">
                {liveDoubts.filter((d) => d.status === 'open').slice(0, 3).map((d) => (
                  <li key={d.id} className="rounded-lg bg-paper-warm/50 dark:bg-ink-700/30 px-3 py-2">
                    <p className="text-sm font-semibold text-ink-600 dark:text-white line-clamp-1">“{d.question}”</p>
                    <p className="text-xs text-ink-300 dark:text-ink-200">{d.author_label} · {d.class_name}</p>
                  </li>
                ))}
              </ul>
              <Link to="/teacher/doubts" className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-ink-500 dark:text-ink-100">
                Answer doubts <ArrowRight size={14} />
              </Link>
            </Card>
          </div>
        </section>

        <p className="text-center text-xs text-ink-300 dark:text-ink-300 pt-2 flex items-center justify-center gap-1">
          <AlertTriangle size={12} /> Doubts and submissions update as students work.
        </p>
      </div>

      {showCreate && session && (
        <CreateAssignmentModal
          teacherId={session.userId}
          onClose={() => setShowCreate(false)}
          onCreated={() => {
            setShowCreate(false);
            refreshAssignments();
          }}
        />
      )}
    </AppShell>
  );
}

function SectionHeader({ title, link }: { title: string; link?: string }) {
  return (
    <div className="flex items-center justify-between mb-3">
      <h2 className="font-heading font-bold text-lg text-ink-600 dark:text-white">{title}</h2>
      {link && (
        <Link to={link} className="text-sm font-semibold text-ink-500 hover:text-ink-600 dark:text-ink-100 inline-flex items-center gap-1">
          View all <ArrowRight size={14} />
        </Link>
      )}
    </div>
  );
}

export default TeacherDashboard;
