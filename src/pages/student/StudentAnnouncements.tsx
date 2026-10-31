import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Loading, Empty, ErrorState } from '@/components/ui/StateMessage';
import { studentNav } from '@/data/nav';
import { useAuth } from '@/components/auth/AuthProvider';
import { useStudentAnnouncements } from '@/hooks/useCommunity';
import { Megaphone } from 'lucide-react';

export function StudentAnnouncements() {
  const { session } = useAuth();
  const { announcements, loading, error } = useStudentAnnouncements(session?.userId);
  return <AppShell role="student" nav={studentNav} name="Student" notifications={[]}><div className="space-y-6"><div><h1 className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white">Announcements</h1><p className="text-ink-400 dark:text-ink-200 mt-1">Important notes from your teachers, all in one place.</p></div>{loading ? <Loading label="Loading announcements…" /> : error ? <ErrorState message={error} /> : announcements.length === 0 ? <Empty title="No announcements yet" hint="Your teachers will post class updates here." /> : <div className="space-y-3">{announcements.map((item) => <Card key={item.id}><div className="flex items-start gap-3"><div className="h-10 w-10 rounded-xl bg-amber-50 dark:bg-amber-700/20 text-amber-700 dark:text-amber-100 grid place-items-center shrink-0"><Megaphone size={18} /></div><div className="min-w-0"><div className="flex flex-wrap items-center gap-2"><h2 className="font-heading font-bold text-ink-600 dark:text-white">{item.title}</h2><span className="text-xs text-ink-300 dark:text-ink-200">{item.class_name}</span></div><p className="text-xs text-ink-300 dark:text-ink-200 mt-1">{new Date(item.created_at).toLocaleString([], { dateStyle: 'medium', timeStyle: 'short' })}</p><p className="text-sm text-ink-500 dark:text-ink-100 mt-3 whitespace-pre-wrap">{item.body}</p></div></div></Card>)}</div>}</div></AppShell>;
}
export default StudentAnnouncements;
