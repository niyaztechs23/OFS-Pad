import { useState } from 'react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Loading, Empty, ErrorState } from '@/components/ui/StateMessage';
import { teacherNav } from '@/data/nav';
import { useAuth } from '@/components/auth/AuthProvider';
import { useTeacherAnnouncements } from '@/hooks/useCommunity';
import { Megaphone, Send } from 'lucide-react';

export function TeacherAnnouncements() {
  const { session } = useAuth();
  const { announcements, classes, loading, error, createAnnouncement } = useTeacherAnnouncements(session?.userId);
  const [classId, setClassId] = useState('');
  const [title, setTitle] = useState('');
  const [body, setBody] = useState('');
  const [saving, setSaving] = useState(false);
  const [notice, setNotice] = useState<string | null>(null);
  const submit = async (event: React.FormEvent) => { event.preventDefault(); setNotice(null); if (!classId || title.trim().length < 3 || !body.trim()) return setNotice('Choose a class and add a title and message.'); setSaving(true); const result = await createAnnouncement(classId, title, body); setSaving(false); if (!result.ok) return setNotice(result.message); setTitle(''); setBody(''); setNotice('Announcement published. Students in the class were notified.'); };
  return <AppShell role="teacher" nav={teacherNav} name="Teacher" notifications={[]}><div className="space-y-6"><div><h1 className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white">Announcements</h1><p className="text-ink-400 dark:text-ink-200 mt-1">Keep each class aligned with clear, timely updates.</p></div><Card><form onSubmit={submit} className="space-y-3"><div className="grid sm:grid-cols-2 gap-2"><select value={classId} onChange={(e) => setClassId(e.target.value)} className="h-11 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-3 text-sm font-semibold text-ink-600 dark:text-white"><option value="">Choose class</option>{classes.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}</select><input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Announcement title" className="h-11 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 px-3 text-sm text-ink-600 dark:text-white" /></div><textarea value={body} onChange={(e) => setBody(e.target.value)} rows={4} placeholder="Write the update for students…" className="w-full rounded-xl bg-paper-warm/40 dark:bg-ink-700/40 border border-ink-100 dark:border-ink-700 p-3 text-sm text-ink-600 dark:text-white resize-none" />{notice && <p className="text-sm text-ink-400 dark:text-ink-200">{notice}</p>}<div className="flex justify-end"><Button type="submit" disabled={saving}><Send size={16} /> {saving ? 'Publishing…' : 'Publish announcement'}</Button></div></form></Card>{loading ? <Loading label="Loading announcements…" /> : error ? <ErrorState message={error} /> : announcements.length === 0 ? <Empty title="No announcements yet" hint="Publish the first update for one of your classes." /> : <div className="space-y-3">{announcements.map((item) => <Card key={item.id}><div className="flex items-start gap-3"><div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-700/20 text-amber-700 dark:text-amber-100 grid place-items-center shrink-0"><Megaphone size={18} /></div><div><div className="flex flex-wrap items-center gap-2"><h2 className="font-heading font-bold text-ink-600 dark:text-white">{item.title}</h2><span className="text-xs text-ink-300 dark:text-ink-200">{item.class_name}</span></div><p className="text-xs text-ink-300 dark:text-ink-200 mt-1">{new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p><p className="text-sm text-ink-500 dark:text-ink-100 mt-3 whitespace-pre-wrap">{item.body}</p></div></div></Card>)}</div>}</div></AppShell>;
}
export default TeacherAnnouncements;
