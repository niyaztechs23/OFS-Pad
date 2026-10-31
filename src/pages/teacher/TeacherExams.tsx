import { FormEvent, useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SubjectTag } from '@/components/ui/SubjectTag';
import { Loading, Empty, ErrorState } from '@/components/ui/StateMessage';
import { teacherNav } from '@/data/nav';
import { subjectList, subjects, type SubjectKey } from '@/data/mock';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTeacherExams } from '@/hooks/useExams';
import { CalendarDays, GraduationCap, Plus, Trash2 } from 'lucide-react';

function subjectKeyFromName(name: string): SubjectKey {
  const found = Object.values(subjects).find((subject) => subject.key === name || subject.name.toLowerCase() === name.toLowerCase());
  return found?.key ?? 'maths';
}

export function TeacherExams() {
  const { session, profile } = useAuth();
  const { exams, classes, loading, error, createExam, deleteExam } = useTeacherExams(session?.userId);
  const [classId, setClassId] = useState('');
  const [title, setTitle] = useState('');
  const [subject, setSubject] = useState('maths');
  const [startsAt, setStartsAt] = useState('');
  const [endsAt, setEndsAt] = useState('');
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    setMessage(null);
    if (!classId || !title.trim() || !startsAt) { setMessage('Choose a class, title and start time.'); return; }
    setSaving(true);
    const result = await createExam(classId, title, subject, new Date(startsAt).toISOString(), endsAt ? new Date(endsAt).toISOString() : null);
    setSaving(false);
    if (!result.ok) { setMessage(result.message); return; }
    setTitle(''); setStartsAt(''); setEndsAt(''); setMessage('Exam created and students notified.');
  };

  return (
    <AppShell role="teacher" nav={teacherNav} name={profile?.full_name?.split(' ')[0] ?? 'there'} notifications={[]}>
      <div className="space-y-6">
        <div><h1 className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white">Exams</h1><p className="text-ink-400 dark:text-ink-200 mt-1">Create and manage real exams for your classes.</p></div>
        <Card>
          <form onSubmit={submit} className="grid md:grid-cols-2 gap-4">
            <label className="text-sm font-semibold text-ink-500 dark:text-ink-100">Class<select value={classId} onChange={(e) => setClassId(e.target.value)} className="mt-1 w-full rounded-xl border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 px-3 py-2.5 font-normal"><option value="">Choose class</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select></label>
            <label className="text-sm font-semibold text-ink-500 dark:text-ink-100">Subject<select value={subject} onChange={(e) => setSubject(e.target.value)} className="mt-1 w-full rounded-xl border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 px-3 py-2.5 font-normal">{subjectList.map((s) => <option key={s.key} value={s.key}>{s.name}</option>)}</select></label>
            <label className="text-sm font-semibold text-ink-500 dark:text-ink-100 md:col-span-2">Exam title<input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="e.g. Mathematics Unit Test" className="mt-1 w-full rounded-xl border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 px-3 py-2.5 font-normal" /></label>
            <label className="text-sm font-semibold text-ink-500 dark:text-ink-100">Starts<input type="datetime-local" value={startsAt} onChange={(e) => setStartsAt(e.target.value)} className="mt-1 w-full rounded-xl border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 px-3 py-2.5 font-normal" /></label>
            <label className="text-sm font-semibold text-ink-500 dark:text-ink-100">Ends (optional)<input type="datetime-local" value={endsAt} onChange={(e) => setEndsAt(e.target.value)} className="mt-1 w-full rounded-xl border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 px-3 py-2.5 font-normal" /></label>
            <div className="md:col-span-2 flex items-center gap-3"><Button type="submit" disabled={saving}><Plus size={16} /> {saving ? 'Creating…' : 'Create exam'}</Button>{message && <p className="text-sm text-ink-400 dark:text-ink-200">{message}</p>}</div>
          </form>
        </Card>
        {loading ? <Loading label="Loading exams…" /> : error ? <ErrorState message={`Couldn't load exams: ${error}`} /> : exams.length === 0 ? <Empty title="No exams yet" hint="Create the first exam for one of your classes above." /> : <div className="grid md:grid-cols-2 gap-4">{exams.map((exam) => <Card key={exam.id}><div className="flex items-start gap-3"><span className="w-10 h-10 rounded-xl bg-ink-50 text-ink-600 dark:bg-ink-700 dark:text-ink-100 grid place-items-center"><GraduationCap size={20} /></span><div className="flex-1 min-w-0"><div className="flex flex-wrap gap-2"><SubjectTag subject={subjectKeyFromName(exam.subject)} size="sm" /><Badge tone="ink"><CalendarDays size={12} /> {new Date(exam.starts_at).toLocaleString()}</Badge></div><h3 className="font-heading font-bold text-ink-600 dark:text-white mt-2">{exam.title}</h3><p className="text-sm text-ink-400 dark:text-ink-200">{exam.class_name}</p>{exam.ends_at && <p className="text-xs text-ink-300 dark:text-ink-300 mt-1">Ends {new Date(exam.ends_at).toLocaleString()}</p>}</div><button aria-label={`Delete ${exam.title}`} onClick={() => { if (window.confirm('Delete this exam?')) void deleteExam(exam.id); }} className="w-9 h-9 grid place-items-center rounded-lg text-ink-300 hover:text-clay-600 hover:bg-clay-50"><Trash2 size={16} /></button></div></Card>)}</div>}
      </div>
    </AppShell>
  );
}

export default TeacherExams;
