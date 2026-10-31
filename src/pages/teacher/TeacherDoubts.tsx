import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { SubjectTag } from '@/components/ui/SubjectTag';
import { Loading, Empty, ErrorState } from '@/components/ui/StateMessage';
import { teacherNav } from '@/data/nav';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTeacherDoubts } from '@/hooks/useCommunity';
import { ThumbsUp, Send } from 'lucide-react';

const readableTime = (value: string) => new Date(value).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' });

export function TeacherDoubts() {
  const { session } = useAuth();
  const { doubts, loading, error, answer } = useTeacherDoubts(session?.userId);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const submitAnswer = async (id: string) => {
    const text = answers[id]?.trim();
    if (!text) return;
    setSaving(id); setNotice(null);
    const result = await answer(id, text);
    setSaving(null);
    if (!result.ok) return setNotice(result.message);
    setAnswers((previous) => ({ ...previous, [id]: '' }));
    setNotice('Answer published and the student was notified.');
  };

  return (
    <AppShell role="teacher" nav={teacherNav} name="Teacher" notifications={[]}>
      <div className="space-y-6">
        <div><h1 className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white">Doubts from students</h1><p className="text-ink-400 dark:text-ink-200 mt-1">Answer openly so the whole class learns.</p></div>
        {notice && <p className="text-sm text-ink-400 dark:text-ink-200">{notice}</p>}
        {loading ? <Loading label="Loading student doubts…" /> : error ? <ErrorState message={error} /> : doubts.length === 0 ? <Empty title="No class doubts" hint="New questions from your classes will appear here." /> : <div className="space-y-3">{doubts.map((doubt) => <Card key={doubt.id}><div className="flex items-center justify-between gap-2 mb-2"><SubjectTag subject={doubt.subject as never} size="sm" /><Badge tone={doubt.status === 'answered' ? 'leaf' : 'amber'}>{doubt.status === 'answered' ? 'Answered' : 'Open'}</Badge></div><p className="text-xs text-ink-300 dark:text-ink-200 mt-1">{doubt.class_name} · {doubt.author_label} · {readableTime(doubt.created_at)} · {doubt.upvotes} upvotes</p><p className="font-heading font-semibold text-ink-600 dark:text-white text-lg leading-snug mt-2">{doubt.question}</p>{doubt.answer ? <div className="mt-3 rounded-xl bg-leaf-50 dark:bg-leaf-700/20 p-3 border border-leaf-100 dark:border-leaf-700/40"><p className="text-sm text-leaf-700 dark:text-leaf-100"><span className="font-heading font-bold">Published answer: </span>{doubt.answer}</p></div> : <div className="mt-3 flex flex-col sm:flex-row gap-2 sm:items-start"><textarea value={answers[doubt.id] ?? ''} onChange={(e) => setAnswers((previous) => ({ ...previous, [doubt.id]: e.target.value }))} rows={2} placeholder="Write an answer…" className="flex-1 rounded-xl bg-paper-warm/40 dark:bg-ink-700/40 border border-ink-100 dark:border-ink-700 p-3 text-sm text-ink-600 dark:text-white focus:outline-none focus:border-ink-400 resize-none" /><Button size="md" onClick={() => void submitAnswer(doubt.id)} disabled={saving === doubt.id}><Send size={16} /> {saving === doubt.id ? 'Publishing…' : 'Answer'}</Button></div>}</Card>)}</div>}
        <p className="text-center text-xs text-ink-300 dark:text-ink-300 flex items-center justify-center gap-1"><ThumbsUp size={12} /> Upvotes show how many students shared the same doubt.</p>
      </div>
    </AppShell>
  );
}
export default TeacherDoubts;
