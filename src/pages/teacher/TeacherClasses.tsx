import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { SubjectTag } from '@/components/ui/SubjectTag';
import { teacherNav } from '@/data/nav';
import { teacherName, teacherNotifications, subjects, type SubjectKey } from '@/data/mock';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTeacherClasses } from '@/hooks/useTeacher';
import { CreateClassModal } from '@/components/teacher/TeacherModals';
import { Loading, Empty, ErrorState } from '@/components/ui/StateMessage';
import { Users, Copy, Plus, Check } from 'lucide-react';

function subjectKeyFromName(name: string): SubjectKey {
  for (const s of Object.values(subjects)) {
    if (s.name.toLowerCase() === name.toLowerCase()) return s.key;
  }
  return 'maths';
}

export function TeacherClasses() {
  const { session } = useAuth();
  const { classes, loading, error, refresh } = useTeacherClasses(session?.userId);
  const [showCreate, setShowCreate] = useState(false);
  const [copied, setCopied] = useState<string | null>(null);

  const copy = (code: string) => {
    navigator.clipboard?.writeText(code).catch(() => {});
    setCopied(code);
    setTimeout(() => setCopied(null), 1500);
  };

  return (
    <AppShell role="teacher" nav={teacherNav} name={teacherName} notifications={teacherNotifications}>
      <div className="space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-3">
          <div>
            <h1 className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white">My Classes</h1>
            <p className="text-ink-400 dark:text-ink-200 mt-1">Share a join code to add students.</p>
          </div>
          <Button size="md" onClick={() => setShowCreate(true)}><Plus size={16} /> New class</Button>
        </div>

        {loading ? (
          <Loading label="Loading your classes…" />
        ) : error ? (
          <ErrorState message={`Couldn't load your classes: ${error}`} />
        ) : classes.length === 0 ? (
          <Empty title="No classes yet" hint="Create your first class to get a join code." />
        ) : (
          <div className="grid sm:grid-cols-2 gap-4">
            {classes.map((c) => (
              <Card key={c.id} hoverable>
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <SubjectTag subject={subjectKeyFromName(c.subject)} size="sm" />
                    <h3 className="font-heading font-bold text-lg text-ink-600 dark:text-white mt-2">{c.name}</h3>
                    <p className="text-sm text-ink-400 dark:text-ink-200 flex items-center gap-1 mt-1">
                      <Users size={14} /> {c.student_count} students
                    </p>
                  </div>
                </div>
                <div className="mt-4 flex items-center justify-between rounded-xl bg-paper-warm/60 dark:bg-ink-700/40 px-3 py-2.5">
                  <div>
                    <p className="text-[10px] uppercase tracking-wider text-ink-300 dark:text-ink-300">Join code</p>
                    <p className="font-heading font-bold text-ink-600 dark:text-white tracking-wider text-lg">{c.join_code}</p>
                  </div>
                  <Button variant="secondary" size="sm" onClick={() => copy(c.join_code)}>
                    {copied === c.join_code ? <><Check size={14} /> Copied</> : <><Copy size={14} /> Copy</>}
                  </Button>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>

      {showCreate && session && (
        <CreateClassModal
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

export default TeacherClasses;
