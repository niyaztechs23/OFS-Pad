import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { SubjectTag } from '@/components/ui/SubjectTag';
import { Loading, Empty, ErrorState } from '@/components/ui/StateMessage';
import { studentNav } from '@/data/nav';
import { useAuth } from '@/components/auth/AuthProvider';
import { useStudentDoubts } from '@/hooks/useCommunity';
import { ThumbsUp, Send, Eye, EyeOff } from 'lucide-react';

const subjects = [
  ['maths', 'Mathematics'], ['science', 'Science'], ['english', 'English'], ['history', 'History'], ['computer', 'Computer Science'],
];
const readableTime = (value: string) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export function StudentDoubts() {
  const { session } = useAuth();
  const { doubts, classes, loading, error, createDoubt, upvote } = useStudentDoubts(session?.userId);
  const [question, setQuestion] = useState('');
  const [classId, setClassId] = useState('');
  const [subject, setSubject] = useState('maths');
  const [anonymous, setAnonymous] = useState(true);
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault(); setNotice(null);
    if (!classId) return setNotice('Join a class before asking a doubt.');
    if (question.trim().length < 5) return setNotice('Write at least five characters so your teacher can help.');
    setSaving(true);
    const result = await createDoubt(classId, subject, question, anonymous);
    setSaving(false);
    if (!result.ok) return setNotice(result.message);
    setQuestion(''); setNotice('Your doubt is live for the class.');
  };

  return (
    <AppShell role="student" nav={studentNav} name="Student" notifications={[]}>
      <div className="space-y-6">
        <div><h1 className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white">Doubt Wall</h1><p className="text-ink-400 dark:text-ink-200 mt-1">Ask anonymously. Help a classmate. Stay curious.</p></div>
        <Card>
          <form onSubmit={submit} className="space-y-3">
            <label className="block"><span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1.5">Your question</span><textarea value={question} onChange={(e) => setQuestion(e.target.value)} rows={3} placeholder="What's confusing you?" className="w-full rounded-xl bg-paper-warm/40 dark:bg-ink-700/40 border border-ink-100 dark:border-ink-700 p-3 text-ink-600 dark:text-white placeholder:text-ink-300 focus:outline-none focus:border-ink-400 resize-none" /></label>
            <div className="grid sm:grid-cols-3 gap-2">
              <select value={classId} onChange={(e) => setClassId(e.target.value)} className="h-11 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-3 text-sm font-semibold text-ink-600 dark:text-white"><option value="">Choose class</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select>
              <select value={subject} onChange={(e) => setSubject(e.target.value)} className="h-11 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-3 text-sm font-semibold text-ink-600 dark:text-white">{subjects.map(([value, label]) => <option key={value} value={value}>{label}</option>)}</select>
              <button type="button" onClick={() => setAnonymous((value) => !value)} className={`h-11 px-3 rounded-xl text-sm font-semibold inline-flex items-center justify-center gap-1.5 ${anonymous ? 'bg-ink-50 text-ink-600 dark:bg-ink-700 dark:text-ink-100' : 'bg-leaf-50 text-leaf-700 dark:bg-leaf-700/30 dark:text-leaf-100'}`}>{anonymous ? <EyeOff size={16} /> : <Eye size={16} />}{anonymous ? 'Anonymous' : 'As me'}</button>
            </div>
            {notice && <p className="text-sm text-ink-400 dark:text-ink-200">{notice}</p>}
            <div className="flex justify-end"><Button type="submit" size="md" disabled={saving}><Send size={16} /> {saving ? 'Asking…' : 'Ask'}</Button></div>
          </form>
        </Card>
        {loading ? <Loading label="Loading class doubts…" /> : error ? <ErrorState message={error} /> : doubts.length === 0 ? <Empty title="No doubts yet" hint="Be the first person to ask a question in your class." /> : <div className="space-y-3">{doubts.map((doubt) => <Card key={doubt.id}><div className="flex items-center justify-between gap-2 mb-2"><SubjectTag subject={doubt.subject as never} size="sm" /><Badge tone={doubt.status === 'answered' ? 'leaf' : 'amber'}>{doubt.status === 'answered' ? 'Answered' : 'Open'}</Badge></div><p className="text-xs text-ink-300 dark:text-ink-200 mb-2">{doubt.class_name} · {doubt.author_label} · {readableTime(doubt.created_at)}</p><p className="font-heading font-semibold text-ink-600 dark:text-white text-lg leading-snug">{doubt.question}</p>{doubt.answer && <div className="mt-3 rounded-xl bg-leaf-50 dark:bg-leaf-700/20 p-3 border border-leaf-100 dark:border-leaf-700/40"><p className="text-sm text-leaf-700 dark:text-leaf-100"><span className="font-heading font-bold">Teacher: </span>{doubt.answer}</p></div>}<div className="flex justify-end mt-4"><button onClick={() => void upvote(doubt.id)} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-lg text-sm font-semibold text-ink-500 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-700 min-h-[44px]"><ThumbsUp size={14} /> {doubt.upvotes}</button></div></Card>)}</div>}
      </div>
    </AppShell>
  );
}
export default StudentDoubts;
