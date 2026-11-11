import { Link } from 'react-router-dom';
import { ArrowLeft, ArrowRight, BookOpen, CalendarDays, ClipboardList, GraduationCap, Megaphone, MessageCircleQuestion, ShieldCheck, Users } from 'lucide-react';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';

const sections = [
  { icon: GraduationCap, title: 'Home', body: 'Your starting point. See the most useful next action, recent activity, classes, and reminders.' },
  { icon: BookOpen, title: 'Notebooks', body: 'Keep subject notes organised in one place. Students can open notebooks, add pages, and review saved work.' },
  { icon: ClipboardList, title: 'Assignments', body: 'Teachers create work and deadlines. Students open the brief, submit their work, and see grading status.' },
  { icon: MessageCircleQuestion, title: 'Doubts', body: 'Ask questions, learn from answers, and use the class discussion space without needing a separate messaging app.' },
  { icon: Megaphone, title: 'Announcements', body: 'Read important class updates from teachers in one feed.' },
  { icon: CalendarDays, title: 'Planner and Exams', body: 'Keep deadlines, exam dates, and upcoming study tasks visible together.' },
  { icon: Users, title: 'Classes', body: 'Students join with a teacher-provided code. Teachers manage the classes they own.' },
  { icon: ShieldCheck, title: 'Profile and privacy', body: 'Review registered account details, role, sign-in method, and useful statistics. Profile identity details are read-only after signup.' },
];

export default function IntroPage() {
  return (
    <div className="min-h-screen bg-paper dark:bg-ink-900">
      <header className="max-w-6xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between">
        <Logo />
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-400 hover:text-ink-600 dark:text-ink-200 dark:hover:text-white"><ArrowLeft size={16} /> Back home</Link>
      </header>
      <main className="max-w-6xl mx-auto px-5 sm:px-8 pb-16">
        <section className="pt-12 sm:pt-20 max-w-3xl">
          <span className="inline-flex items-center gap-2 rounded-full bg-leaf-50 dark:bg-leaf-700/30 text-leaf-700 dark:text-leaf-100 px-3 py-1 text-xs font-semibold">A quick OFS Pad guide</span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-ink-600 dark:text-white leading-tight mt-5">Everything you need for a calmer school day.</h1>
          <p className="text-lg text-ink-400 dark:text-ink-200 leading-relaxed mt-5 max-w-2xl">OFS Pad connects classes, notes, assignments, questions, announcements, and planning in one secure workspace. Use this page as a quick map when you are new.</p>
          <div className="flex flex-wrap gap-3 mt-7"><Link to="/auth?mode=signup"><Button size="lg">Create an account <ArrowRight size={18} /></Button></Link><Link to="/auth"><Button variant="outline" size="lg">Log in</Button></Link></div>
        </section>
        <section className="grid sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-14">
          {sections.map(({ icon: Icon, title, body }) => <article key={title} className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-5 shadow-soft"><span className="w-11 h-11 grid place-items-center rounded-xl bg-ink-50 text-ink-500 dark:bg-ink-700 dark:text-white"><Icon size={22} /></span><h2 className="font-heading font-bold text-lg text-ink-600 dark:text-white mt-4">{title}</h2><p className="text-sm leading-relaxed text-ink-400 dark:text-ink-200 mt-2">{body}</p></article>)}
        </section>
        <section className="grid md:grid-cols-3 gap-4 mt-14">
          <div className="rounded-2xl bg-ink-500 text-white p-6"><p className="text-xs uppercase tracking-wider text-white/70 font-semibold">Students</p><h2 className="font-heading font-bold text-xl mt-2">Learn and stay organised</h2><p className="text-sm text-white/80 leading-relaxed mt-2">Join classes, follow due work, use notebooks, submit assignments, ask doubts, and check the planner.</p></div>
          <div className="rounded-2xl bg-leaf-50 dark:bg-ink-800 border border-leaf-100 dark:border-ink-700 p-6"><p className="text-xs uppercase tracking-wider text-leaf-700 dark:text-leaf-100 font-semibold">Teachers</p><h2 className="font-heading font-bold text-xl text-ink-600 dark:text-white mt-2">Run the class in one place</h2><p className="text-sm text-ink-400 dark:text-ink-200 leading-relaxed mt-2">Create classes, share assignments, grade work, answer doubts, publish updates, and schedule exams.</p></div>
          <div className="rounded-2xl bg-amber-50 dark:bg-ink-800 border border-amber-100 dark:border-ink-700 p-6"><p className="text-xs uppercase tracking-wider text-amber-700 dark:text-amber-100 font-semibold">Administrators</p><h2 className="font-heading font-bold text-xl text-ink-600 dark:text-white mt-2">Keep access controlled</h2><p className="text-sm text-ink-400 dark:text-ink-200 leading-relaxed mt-2">Approve teacher access and rely on database rules to protect role and class boundaries.</p></div>
        </section>
      </main>
      <footer className="border-t border-ink-100/70 dark:border-ink-700/60"><div className="max-w-6xl mx-auto px-5 sm:px-8 py-7 flex flex-wrap items-center justify-between gap-3"><Logo size="sm" /><div className="flex items-center gap-4 text-xs text-ink-400 dark:text-ink-200"><Link to="/privacy" className="hover:text-ink-600 dark:hover:text-white">Privacy Policy</Link><Link to="/terms" className="hover:text-ink-600 dark:hover:text-white">Terms &amp; Conditions</Link></div></div></footer>
    </div>
  );
}
