import { Link } from 'react-router-dom';
import { ArrowLeft, ShieldCheck, FileText } from 'lucide-react';
import { Logo } from '@/components/Logo';

type LegalKind = 'privacy' | 'terms';

const content: Record<LegalKind, { title: string; intro: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: 'Privacy Policy',
    intro: 'This policy explains what OFS Pad uses account and learning information for, how access is controlled, and what users should know when using the service.',
    sections: [
      { heading: 'Information we use', body: 'OFS Pad uses account details such as your registered name, email address, role, sign-in provider, and session information. The app also stores learning records needed for the service, such as classes, assignments, submissions, notebooks, doubts, announcements, exams, notifications, and teacher approvals.' },
      { heading: 'Why we use it', body: 'Information is used to sign users in, show the correct student, teacher, or administrator workspace, connect students to their classes, deliver coursework and updates, record submissions and grading, and protect school data.' },
      { heading: 'Who can see it', body: 'Access is limited by account role, ownership, and class membership. Students see their own permitted records and joined classes. Teachers manage classes they own. Administrators manage protected school-level approval operations. Database security policies remain the main access control.' },
      { heading: 'Passwords and authentication', body: 'Passwords are handled by Supabase Authentication and are not stored in the OFS Pad interface. Password fields are hidden by default. The show-password button on sign-in and sign-up only changes the local field display so a user can check typing. The profile page does not change registered identity details or passwords.' },
      { heading: 'Data security', body: 'OFS Pad uses Supabase Row Level Security, protected database functions, role checks, and class-scoped policies. Publishable browser configuration may be present in the frontend, but service-role keys, OAuth secrets, database passwords, and personal passwords must not be exposed in the application.' },
      { heading: 'Realtime and browser storage', body: 'Selected class features may use realtime updates for doubts, announcements, notifications, and submissions. Some notebook state is stored in the user’s browser according to the current product design. Users should use trusted devices and keep their sign-in session private.' },
      { heading: 'Contact and changes', body: 'The policy may be updated when the product changes. The current version is published inside the app so users can review it before using the service.' },
    ],
  },
  terms: {
    title: 'Terms & Conditions',
    intro: 'These terms describe the expected use of OFS Pad as a school learning workspace. By using the app, you agree to use it responsibly and follow your school’s instructions.',
    sections: [
      { heading: 'Using OFS Pad', body: 'Use OFS Pad for legitimate learning, teaching, classroom communication, administration, and related school activities. Keep your account credentials private and do not use another person’s account.' },
      { heading: 'Accurate registration', body: 'Provide accurate registration information. The registered name and email identify the account inside the school workspace. The profile page displays these details and does not provide identity-editing or password-changing controls after registration.' },
      { heading: 'Respectful content', body: 'Do not upload, post, or send content that is abusive, threatening, discriminatory, unlawful, deliberately misleading, or unrelated to the class. Anonymous doubt features must not be used to target or harass another person.' },
      { heading: 'School roles and access', body: 'Students, teachers, and administrators receive different capabilities. Do not attempt to bypass a class code, approval process, role check, database policy, or other access control. Teacher access is subject to the school approval workflow.' },
      { heading: 'Submissions and ownership', body: 'Students are responsible for submitting their own work and following teacher deadlines. Teachers are responsible for using grading, feedback, announcements, and exam tools appropriately for their classes.' },
      { heading: 'Availability and changes', body: 'The app may be updated, temporarily unavailable, or changed to improve reliability and safety. Features may depend on school configuration, Supabase services, browser support, and the production deployment.' },
      { heading: 'Suspension and misuse', body: 'Access may be restricted or suspended when an account is used to compromise privacy, misuse school data, impersonate another user, attack the service, or violate school rules.' },
      { heading: 'Questions', body: 'For account, school policy, or access questions, contact the responsible school administrator or the person who provided your OFS Pad access.' },
    ],
  },
};

export default function LegalPage({ kind }: { kind: LegalKind }) {
  const page = content[kind];
  const Icon = kind === 'privacy' ? ShieldCheck : FileText;
  return (
    <div className="min-h-screen bg-paper dark:bg-ink-900">
      <header className="max-w-5xl mx-auto px-5 sm:px-8 py-5 flex items-center justify-between"><Logo /><Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-400 hover:text-ink-600 dark:text-ink-200 dark:hover:text-white"><ArrowLeft size={16} /> Back home</Link></header>
      <main className="max-w-4xl mx-auto px-5 sm:px-8 py-10 sm:py-16">
        <div className="flex items-start gap-4"><span className="w-12 h-12 shrink-0 grid place-items-center rounded-2xl bg-ink-50 text-ink-500 dark:bg-ink-700 dark:text-white"><Icon size={24} /></span><div><p className="text-xs font-semibold uppercase tracking-[0.18em] text-ink-300 dark:text-ink-200">OFS Pad</p><h1 className="font-heading font-extrabold text-4xl text-ink-600 dark:text-white mt-2">{page.title}</h1><p className="text-base text-ink-400 dark:text-ink-200 leading-relaxed mt-4 max-w-2xl">{page.intro}</p></div></div>
        <div className="mt-10 space-y-7">{page.sections.map((section, index) => <section key={section.heading} className="rounded-2xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 p-5 sm:p-7"><p className="text-xs font-semibold text-ink-300 dark:text-ink-200">{String(index + 1).padStart(2, '0')}</p><h2 className="font-heading font-bold text-xl text-ink-600 dark:text-white mt-1">{section.heading}</h2><p className="text-sm sm:text-base text-ink-400 dark:text-ink-200 leading-relaxed mt-3">{section.body}</p></section>)}</div>
        <p className="text-xs text-ink-300 dark:text-ink-300 mt-8">This in-app information is a product policy guide and does not replace any school-specific policy or professional legal advice.</p>
      </main>
      <footer className="border-t border-ink-100/70 dark:border-ink-700/60"><div className="max-w-5xl mx-auto px-5 sm:px-8 py-7 flex flex-wrap items-center justify-between gap-3"><Logo size="sm" /><div className="flex items-center gap-4 text-xs text-ink-400 dark:text-ink-200"><Link to="/intro" className="hover:text-ink-600 dark:hover:text-white">How OFS Pad works</Link><Link to={kind === 'privacy' ? '/terms' : '/privacy'} className="hover:text-ink-600 dark:hover:text-white">{kind === 'privacy' ? 'Terms & Conditions' : 'Privacy Policy'}</Link></div></div></footer>
    </div>
  );
}
