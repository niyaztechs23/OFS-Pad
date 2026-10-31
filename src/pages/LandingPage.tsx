import { Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { Bell, MessageCircleQuestion, BookOpen, ArrowRight, Moon, Sun } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';

export function LandingPage() {
  const { theme, toggle } = useTheme();

  const features = [
    {
      icon: Bell,
      title: 'Assignments & Reminders',
      body: 'Never miss a deadline. See what is due soon with calm, colour-coded reminders.',
      tone: 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100',
    },
    {
      icon: MessageCircleQuestion,
      title: 'Ask Doubts Anonymously',
      body: 'No question is too small. Post doubts without your name and get answers from class.',
      tone: 'bg-leaf-50 text-leaf-700 dark:bg-leaf-700/30 dark:text-leaf-100',
    },
    {
      icon: BookOpen,
      title: 'All Your Notebooks in One Pad',
      body: 'Every subject, neatly organised. Open a notebook and your notes are right there.',
      tone: 'bg-ink-50 text-ink-600 dark:bg-ink-700 dark:text-ink-100',
    },
  ];

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-900">
      {/* Top bar */}
      <header className="flex items-center justify-between px-5 sm:px-8 py-5 max-w-6xl mx-auto">
        <Logo />
        <div className="flex items-center gap-2">
          <button
            onClick={toggle}
            aria-label="Toggle theme"
            className="w-11 h-11 grid place-items-center rounded-xl text-ink-400 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800 min-h-[44px]"
          >
            {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
          </button>
          <Link to="/auth">
            <Button variant="ghost" size="md">Log in</Button>
          </Link>
          <Link to="/auth?mode=signup">
            <Button size="md">Sign up</Button>
          </Link>
        </div>
      </header>

      {/* Hero */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 pt-10 sm:pt-16 pb-12 grid md:grid-cols-2 gap-10 items-center">
        <div>
          <span className="inline-flex items-center gap-2 rounded-full bg-leaf-50 dark:bg-leaf-700/30 text-leaf-700 dark:text-leaf-100 px-3 py-1 text-xs font-semibold mb-5">
            <span className="w-2 h-2 rounded-full bg-leaf-500" /> Calm, focused study
          </span>
          <h1 className="font-heading font-extrabold text-4xl sm:text-5xl text-ink-600 dark:text-white leading-[1.1] tracking-tight">
            Carry Knowledge,<br />Not Notebooks.
          </h1>
          <p className="mt-5 text-lg text-ink-400 dark:text-ink-200 max-w-md">
            OFS Pad brings your assignments, doubts and subject notes into one tidy place —
            built for focused school study.
          </p>
          <div className="mt-7 flex flex-wrap gap-3">
            <Link to="/auth?mode=signup">
              <Button size="lg">
                Get started free <ArrowRight size={18} />
              </Button>
            </Link>
            <Link to="/auth">
              <Button variant="outline" size="lg">I already have an account</Button>
            </Link>
          </div>
        </div>

        {/* Notebook-style preview card */}
        <div className="relative">
          <div className="rounded-2xl bg-white dark:bg-ink-800 shadow-card border border-ink-100 dark:border-ink-700 p-5 rotate-1 transition-transform">
            <div className="flex items-center justify-between mb-3">
              <span className="font-heading font-bold text-ink-600 dark:text-white">Your workspace</span>
              <span className="text-xs text-ink-300 dark:text-ink-200">Live class activity</span>
            </div>
            <ul className="space-y-2.5">
              {['Assignments from your classes', 'Classroom updates', 'Notes and answered doubts'].map((row, i) => (
                <li key={row} className="flex items-center gap-3 rounded-xl bg-paper-warm/70 dark:bg-ink-700/40 p-3">
                  <span className={`w-2.5 h-2.5 rounded-full ${['bg-subjInk-maths', 'bg-subjInk-science', 'bg-subjInk-computer'][i]}`} />
                  <span className="text-sm text-ink-600 dark:text-white font-medium flex-1">{row}</span>
                  <span className="text-xs text-leaf-700 dark:text-leaf-100 font-semibold">Connected</span>
                </li>
              ))}
            </ul>
          </div>
          <div className="absolute -bottom-5 -left-5 rounded-xl bg-leaf-50 dark:bg-ink-800 border border-leaf-100 dark:border-ink-700 px-4 py-3 shadow-soft -rotate-3 hidden sm:block">
            <p className="text-xs text-leaf-700 dark:text-leaf-100 font-semibold">Classroom updates</p>
            <p className="text-sm text-ink-600 dark:text-white font-heading font-bold">Stay in sync with your class.</p>
          </div>
        </div>
      </section>

      {/* Features */}
      <section className="max-w-6xl mx-auto px-5 sm:px-8 py-10 sm:py-14">
        <div className="grid sm:grid-cols-3 gap-5">
          {features.map((f) => {
            const Icon = f.icon;
            return (
              <div
                key={f.title}
                className="rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-6 shadow-soft hover:shadow-card transition-shadow"
              >
                <span className={`w-12 h-12 grid place-items-center rounded-xl ${f.tone}`}>
                  <Icon size={24} />
                </span>
                <h3 className="font-heading font-bold text-lg text-ink-600 dark:text-white mt-4">{f.title}</h3>
                <p className="text-sm text-ink-400 dark:text-ink-200 mt-2 leading-relaxed">{f.body}</p>
              </div>
            );
          })}
        </div>
      </section>

      <footer className="max-w-6xl mx-auto px-5 sm:px-8 py-10 border-t border-ink-100/70 dark:border-ink-700/60 mt-6">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <Logo size="sm" />
          <p className="text-xs text-ink-300 dark:text-ink-200">OFS Pad · A calm place to study.</p>
        </div>
      </footer>
    </div>
  );
}

export default LandingPage;
