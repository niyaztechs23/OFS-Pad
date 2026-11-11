import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, BookOpen, CalendarDays, CheckCircle2, GraduationCap, MessageCircleQuestion, X } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { type Role } from '@/lib/supabase';

const TOUR_KEY = 'ofs-pad-intro-seen-v1';

type Step = {
  title: string;
  body: string;
  icon: typeof BookOpen;
  tone: string;
};

const stepsByRole: Record<Role, Step[]> = {
  student: [
    { title: 'Start from Home', body: 'Your dashboard brings together due work, classes, announcements, and the next useful action.', icon: GraduationCap, tone: 'bg-ink-50 text-ink-600 dark:bg-ink-700 dark:text-white' },
    { title: 'Learn and organise', body: 'Use Notebooks for subject notes, Assignments for submissions, and Planner for exams and deadlines.', icon: BookOpen, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100' },
    { title: 'Connect with your class', body: 'Use Doubts for questions and Announcements for teacher updates. Your class rules protect what you can see.', icon: MessageCircleQuestion, tone: 'bg-leaf-50 text-leaf-700 dark:bg-leaf-700/30 dark:text-leaf-100' },
    { title: 'You are ready', body: 'Open Profile any time to see your registered details and study summary. Your registered identity stays read-only after signup.', icon: CheckCircle2, tone: 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100' },
  ],
  teacher: [
    { title: 'Start from Home', body: 'Your dashboard highlights classes, assignment activity, and work waiting for your attention.', icon: GraduationCap, tone: 'bg-ink-50 text-ink-600 dark:bg-ink-700 dark:text-white' },
    { title: 'Run your classes', body: 'Use Classes to create spaces and share join codes. Assignments keeps coursework and grading together.', icon: BookOpen, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100' },
    { title: 'Communicate clearly', body: 'Use Doubts for answers, Announcements for class updates, and Exams for planned assessments.', icon: MessageCircleQuestion, tone: 'bg-leaf-50 text-leaf-700 dark:bg-leaf-700/30 dark:text-leaf-100' },
    { title: 'You are ready', body: 'Open Profile for your teaching summary and quick links. Registered identity details are read-only after signup.', icon: CheckCircle2, tone: 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100' },
  ],
  admin: [
    { title: 'Start with approvals', body: 'Teacher approvals is your main workspace for controlling approved teacher access.', icon: GraduationCap, tone: 'bg-ink-50 text-ink-600 dark:bg-ink-700 dark:text-white' },
    { title: 'Keep access organised', body: 'Review approved emails, invitation status, and school-level access from the admin dashboard.', icon: CalendarDays, tone: 'bg-amber-50 text-amber-700 dark:bg-amber-500/20 dark:text-amber-100' },
    { title: 'Use Profile for overview', body: 'Profile shows your registered account details, access level, and admin quick links.', icon: BookOpen, tone: 'bg-leaf-50 text-leaf-700 dark:bg-leaf-700/30 dark:text-leaf-100' },
    { title: 'You are ready', body: 'The database enforces roles and class boundaries behind the interface, so the browser is not the only security check.', icon: CheckCircle2, tone: 'bg-blue-50 text-blue-700 dark:bg-blue-500/20 dark:text-blue-100' },
  ],
};

export function WelcomeTour({ role }: { role: Role }) {
  const [open, setOpen] = useState(false);
  const [step, setStep] = useState(0);
  const steps = stepsByRole[role];

  useEffect(() => {
    try {
      setOpen(window.localStorage.getItem(TOUR_KEY) !== '1');
    } catch {
      setOpen(true);
    }
  }, []);

  const close = () => {
    try {
      window.localStorage.setItem(TOUR_KEY, '1');
    } catch {
      // Continue even if storage is unavailable.
    }
    setOpen(false);
  };

  if (!open) return null;

  const current = steps[step];
  const Icon = current.icon;
  const isLast = step === steps.length - 1;

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-ink-900/50 backdrop-blur-sm px-4 py-6" role="dialog" aria-modal="true" aria-labelledby="intro-title">
      <div className="w-full max-w-lg rounded-3xl bg-paper-card dark:bg-ink-800 shadow-pop border border-ink-100 dark:border-ink-700 overflow-hidden">
        <div className="flex items-center justify-between px-5 sm:px-7 pt-5">
          <p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-300 dark:text-ink-200">Quick introduction · {step + 1} of {steps.length}</p>
          <button onClick={close} aria-label="Close introduction" className="w-10 h-10 grid place-items-center rounded-xl text-ink-300 hover:bg-ink-50 hover:text-ink-600 dark:hover:bg-ink-700 dark:hover:text-white">
            <X size={18} />
          </button>
        </div>
        <div className="px-5 sm:px-7 py-6">
          <span className={`w-14 h-14 grid place-items-center rounded-2xl ${current.tone}`}><Icon size={28} /></span>
          <h2 id="intro-title" className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white mt-5">{current.title}</h2>
          <p className="text-base leading-relaxed text-ink-400 dark:text-ink-200 mt-3">{current.body}</p>
          <div className="flex gap-1.5 mt-6" aria-label="Introduction progress">
            {steps.map((item, index) => <span key={item.title} className={`h-1.5 flex-1 rounded-full ${index <= step ? 'bg-ink-500' : 'bg-ink-100 dark:bg-ink-700'}`} />)}
          </div>
        </div>
        <div className="px-5 sm:px-7 pb-6 flex flex-wrap items-center justify-between gap-3">
          <Link to="/intro" onClick={close} className="text-sm font-semibold text-ink-400 hover:text-ink-600 dark:text-ink-200 dark:hover:text-white">View full guide</Link>
          <div className="flex items-center gap-2">
            {step > 0 && <Button variant="ghost" size="md" onClick={() => setStep((value) => value - 1)}>Back</Button>}
            <Button size="md" onClick={() => isLast ? close() : setStep((value) => value + 1)}>
              {isLast ? 'Start using OFS Pad' : 'Next'} <ArrowRight size={16} />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default WelcomeTour;
