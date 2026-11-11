import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  BookOpen,
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  GraduationCap,
  KeyRound,
  LogOut,
  Mail,
  ShieldCheck,
  Sparkles,
  UserRound,
  Users,
} from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { Button } from '@/components/ui/Button';
import { PasswordField } from '@/components/ui/PasswordField';
import { SubjectTag } from '@/components/ui/SubjectTag';
import { LogoMark } from '@/components/Logo';
import { useAuth } from '@/components/auth/AuthProvider';
import { supabase, type Role } from '@/lib/supabase';
import { navForRole } from '@/data/nav';
import { useStudentAssignments, useStudentClasses } from '@/hooks/useStudent';
import { useNotebooks } from '@/hooks/useNotebooks';
import { useTeacherAssignments, useTeacherClasses, useToGrade } from '@/hooks/useTeacher';
import type { SubjectKey } from '@/data/mock';

const roleLabel: Record<Role, string> = {
  student: 'Student',
  teacher: 'Teacher',
  admin: 'Administrator',
};

const roleTone: Record<Role, 'ink' | 'leaf' | 'amber'> = {
  student: 'ink',
  teacher: 'leaf',
  admin: 'amber',
};

const subjectKeys: SubjectKey[] = ['maths', 'science', 'english', 'history', 'computer'];
function subjectKey(value: string): SubjectKey {
  const normalised = value.toLowerCase();
  return subjectKeys.includes(normalised as SubjectKey) ? (normalised as SubjectKey) : 'maths';
}

function formatDate(value?: string | null) {
  if (!value) return '—';
  return new Date(value).toLocaleDateString(undefined, {
    day: 'numeric',
    month: 'long',
    year: 'numeric',
  });
}

function Stat({ icon, label, value }: { icon: ReactNode; label: string; value: string | number }) {
  return (
    <div className="px-4 py-4 sm:px-5">
      <span className="w-9 h-9 grid place-items-center rounded-xl bg-ink-50 dark:bg-ink-700 text-ink-500 dark:text-ink-100">
        {icon}
      </span>
      <p className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white mt-2.5 leading-none">{value}</p>
      <p className="text-xs text-ink-400 dark:text-ink-200 mt-1.5">{label}</p>
    </div>
  );
}

export default function ProfilePage() {
  const { session, profile, signOut, refreshProfile } = useAuth();
  const navigate = useNavigate();
  const role: Role = profile?.role ?? 'student';
  const isStudent = role === 'student';
  const isTeacher = role === 'teacher';

  const { assignments } = useStudentAssignments(isStudent ? session?.userId : undefined);
  const { classes } = useStudentClasses(isStudent ? session?.userId : undefined);
  const { notebooks } = useNotebooks(isStudent ? session?.userId : undefined);
  const { classes: teacherClasses } = useTeacherClasses(isTeacher ? session?.userId : undefined);
  const { assignments: teacherAssignments } = useTeacherAssignments(isTeacher ? session?.userId : undefined);
  const { items: toGrade } = useToGrade(isTeacher ? session?.userId : undefined);

  const [name, setName] = useState(profile?.full_name ?? '');
  const [nameBusy, setNameBusy] = useState(false);
  const [nameNotice, setNameNotice] = useState<string | null>(null);
  const [nameError, setNameError] = useState<string | null>(null);

  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [passwordBusy, setPasswordBusy] = useState(false);
  const [passwordNotice, setPasswordNotice] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);

  const [account, setAccount] = useState<{
    createdAt?: string;
    lastSignIn?: string;
    provider?: string;
  }>({});

  useEffect(() => {
    setName(profile?.full_name ?? '');
  }, [profile?.full_name]);

  useEffect(() => {
    let active = true;
    void supabase.auth.getUser().then(({ data }) => {
      if (!active || !data.user) return;
      setAccount({
        createdAt: data.user.created_at,
        lastSignIn: data.user.last_sign_in_at ?? undefined,
        provider:
          (data.user.app_metadata?.provider as string | undefined) ??
          data.user.identities?.[0]?.provider ??
          'email',
      });
    });
    return () => {
      active = false;
    };
  }, []);

  const stats = useMemo(() => {
    if (isStudent) {
      const pending = assignments.filter((a) => a.status === 'pending').length;
      const submitted = assignments.filter((a) => a.status === 'submitted').length;
      const graded = assignments.filter((a) => a.status === 'graded').length;
      return [
        { icon: <Users size={18} />, label: 'Classes joined', value: classes.length },
        { icon: <ClipboardList size={18} />, label: 'Due now', value: pending },
        { icon: <CheckCircle2 size={18} />, label: 'Submitted', value: submitted },
        { icon: <GraduationCap size={18} />, label: 'Graded', value: graded },
      ];
    }
    if (isTeacher) {
      const students = teacherClasses.reduce((total, c) => total + (c.student_count ?? 0), 0);
      return [
        { icon: <Users size={18} />, label: 'Classes taught', value: teacherClasses.length },
        { icon: <GraduationCap size={18} />, label: 'Students reached', value: students },
        { icon: <ClipboardList size={18} />, label: 'Assignments', value: teacherAssignments.length },
        { icon: <CheckCircle2 size={18} />, label: 'To grade', value: toGrade.length },
      ];
    }
    return [
      { icon: <ShieldCheck size={18} />, label: 'Access level', value: 'Admin' },
      { icon: <UserRound size={18} />, label: 'Account', value: 'Active' },
      { icon: <KeyRound size={18} />, label: 'Approvals', value: 'Manage' },
      { icon: <Sparkles size={18} />, label: 'Session', value: 'Secure' },
    ];
  }, [assignments, classes.length, isStudent, isTeacher, teacherAssignments.length, teacherClasses, toGrade.length]);

  const initials =
    (profile?.full_name ?? 'OFS Pad')
      .split(/\s+/)
      .filter(Boolean)
      .slice(0, 2)
      .map((part) => part[0]?.toUpperCase())
      .join('') || 'OF';

  const quickLinks =
    role === 'teacher'
      ? [
          { label: 'My classes', to: '/teacher/classes', icon: <Users size={18} /> },
          { label: 'Assignments', to: '/teacher/assignments', icon: <ClipboardList size={18} /> },
          { label: 'Exams', to: '/teacher/exams', icon: <CalendarDays size={18} /> },
        ]
      : role === 'admin'
      ? [
          { label: 'Teacher approvals', to: '/admin', icon: <ShieldCheck size={18} /> },
          { label: 'Student home', to: '/student', icon: <BookOpen size={18} /> },
        ]
      : [
          { label: 'My notebooks', to: '/student/notebooks', icon: <BookOpen size={18} /> },
          { label: 'Assignments', to: '/student/assignments', icon: <ClipboardList size={18} /> },
          { label: 'Planner', to: '/student/planner', icon: <CalendarDays size={18} /> },
        ];

  const saveName = async (event: FormEvent) => {
    event.preventDefault();
    if (!session?.userId) return;
    const trimmed = name.trim();
    if (trimmed.length < 2) {
      setNameError('Please enter your full name.');
      return;
    }
    setNameBusy(true);
    setNameError(null);
    setNameNotice(null);
    const { error } = await supabase
      .from('profiles')
      .update({ full_name: trimmed })
      .eq('id', session.userId);
    setNameBusy(false);
    if (error) {
      setNameError(error.message);
      return;
    }
    await refreshProfile();
    setNameNotice('Your name has been updated.');
  };

  const changePassword = async (event: FormEvent) => {
    event.preventDefault();
    setPasswordError(null);
    setPasswordNotice(null);
    if (password.length < 8) {
      setPasswordError('Use at least 8 characters.');
      return;
    }
    if (password !== confirmPassword) {
      setPasswordError('The two passwords do not match.');
      return;
    }
    setPasswordBusy(true);
    const { error } = await supabase.auth.updateUser({ password });
    setPasswordBusy(false);
    if (error) {
      setPasswordError(error.message);
      return;
    }
    setPassword('');
    setConfirmPassword('');
    setPasswordNotice('Your password has been changed. Use it the next time you log in.');
  };

  const logOut = async () => {
    await signOut();
    navigate('/');
  };

  if (!profile) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper dark:bg-ink-900">
        <p className="text-sm text-ink-300 dark:text-ink-200">Loading your profile…</p>
      </div>
    );
  }

  return (
    <AppShell role={role} nav={navForRole(role)} name={profile.full_name.split(' ')[0] ?? 'there'} notifications={[]}>
      <div className="space-y-6">
        {/* Profile hero */}
        <Card className="overflow-hidden p-0">
          <div className="relative bg-gradient-to-br from-ink-700 via-ink-600 to-ink-500 px-5 sm:px-7 py-7 text-white overflow-hidden">
            <span className="absolute -right-10 -top-12 w-52 h-52 rounded-full bg-white/10" aria-hidden="true" />
            <span className="absolute right-24 -bottom-16 w-40 h-40 rounded-full bg-[#F97316]/20" aria-hidden="true" />
            <div className="relative flex flex-col sm:flex-row sm:items-center gap-5">
              <span className="w-20 h-20 shrink-0 rounded-2xl bg-white/15 ring-4 ring-white/20 grid place-items-center font-heading font-extrabold text-2xl tracking-wide">
                {initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-white/70">Your profile dashboard</p>
                <h1 className="font-heading font-extrabold text-2xl sm:text-3xl mt-1 truncate">{profile.full_name}</h1>
                <p className="text-sm text-white/80 mt-1 inline-flex items-center gap-1.5">
                  <Mail size={14} /> {session?.email ?? 'Signed in with Google'}
                </p>
                <div className="flex flex-wrap items-center gap-2 mt-3">
                  <Badge tone={roleTone[role]}>{roleLabel[role]}</Badge>
                  <span className="text-xs text-white/70">Member since {formatDate(account.createdAt)}</span>
                </div>
              </div>
              <div className="hidden sm:block shrink-0 rounded-2xl bg-white/10 p-2 ring-1 ring-white/20">
                <LogoMark className="w-14 h-14" />
              </div>
            </div>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 divide-x divide-y sm:divide-y-0 divide-ink-100 dark:divide-ink-700 bg-white dark:bg-ink-800">
            {stats.map((stat) => (
              <Stat key={stat.label} icon={stat.icon} label={stat.label} value={stat.value} />
            ))}
          </div>
        </Card>

        <div className="grid lg:grid-cols-[1.35fr_1fr] gap-5 items-start">
          <div className="space-y-5">
            {/* Account details */}
            <Card>
              <div className="flex items-center gap-2 mb-4">
                <UserRound size={18} className="text-ink-500 dark:text-ink-100" />
                <h2 className="font-heading font-bold text-lg text-ink-600 dark:text-white">Your details</h2>
              </div>
              <form onSubmit={saveName} className="space-y-4">
                <label className="block">
                  <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1.5">Full name</span>
                  <span className="relative block">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 dark:text-ink-300">
                      <UserRound size={18} />
                    </span>
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      autoComplete="name"
                      required
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-ink-600 dark:text-white placeholder:text-ink-300 focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-100 dark:focus:ring-ink-700 transition-colors"
                    />
                  </span>
                </label>
                <label className="block">
                  <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1.5">Email address</span>
                  <span className="relative block">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 dark:text-ink-300">
                      <Mail size={18} />
                    </span>
                    <input
                      type="email"
                      value={session?.email ?? ''}
                      readOnly
                      className="w-full h-12 pl-11 pr-4 rounded-xl bg-ink-50/70 dark:bg-ink-700/50 border border-ink-100 dark:border-ink-700 text-ink-400 dark:text-ink-200 cursor-not-allowed"
                    />
                  </span>
                  <span className="block text-xs text-ink-300 dark:text-ink-300 mt-1.5">
                    Your school email is your sign-in identity and cannot be changed here.
                  </span>
                </label>
                {nameError && (
                  <p className="text-sm text-clay-600 dark:text-clay-100 bg-clay-50 dark:bg-clay-500/20 rounded-lg px-3 py-2">
                    {nameError}
                  </p>
                )}
                {nameNotice && (
                  <p className="text-sm text-leaf-700 dark:text-leaf-100 bg-leaf-50 dark:bg-leaf-700/30 rounded-lg px-3 py-2">
                    {nameNotice}
                  </p>
                )}
                <Button type="submit" size="md" disabled={nameBusy || name.trim() === profile.full_name}>
                  {nameBusy ? 'Saving…' : 'Save changes'}
                </Button>
              </form>
            </Card>

            {/* Password */}
            <Card>
              <div className="flex items-center gap-2 mb-1">
                <KeyRound size={18} className="text-ink-500 dark:text-ink-100" />
                <h2 className="font-heading font-bold text-lg text-ink-600 dark:text-white">Password &amp; security</h2>
              </div>
              <p className="text-sm text-ink-400 dark:text-ink-200 mb-4">
                Choose a new password. Use the eye button in each field to check what you typed before saving.
              </p>
              <form onSubmit={changePassword} className="space-y-4">
                <PasswordField
                  label="New password"
                  value={password}
                  onChange={setPassword}
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  hint="Mix letters, numbers, and a symbol for a stronger password."
                />
                <PasswordField
                  label="Confirm new password"
                  value={confirmPassword}
                  onChange={setConfirmPassword}
                  placeholder="Type it again"
                  autoComplete="new-password"
                />
                {passwordError && (
                  <p className="text-sm text-clay-600 dark:text-clay-100 bg-clay-50 dark:bg-clay-500/20 rounded-lg px-3 py-2">
                    {passwordError}
                  </p>
                )}
                {passwordNotice && (
                  <p className="text-sm text-leaf-700 dark:text-leaf-100 bg-leaf-50 dark:bg-leaf-700/30 rounded-lg px-3 py-2">
                    {passwordNotice}
                  </p>
                )}
                <div className="flex flex-wrap items-center gap-2">
                  <Button type="submit" size="md" disabled={passwordBusy}>
                    {passwordBusy ? 'Updating…' : 'Update password'}
                  </Button>
                  <Button type="button" variant="ghost" size="md" onClick={() => void logOut()}>
                    <LogOut size={16} /> Log out
                  </Button>
                </div>
                {account.provider === 'google' && (
                  <p className="text-xs text-ink-300 dark:text-ink-300">
                    You signed in with Google. Adding a password here lets you use email and password too, while Google
                    sign-in keeps working.
                  </p>
                )}
              </form>
            </Card>
          </div>

          <div className="space-y-5">
            {/* Classes */}
            <Card>
              <div className="flex items-center gap-2 mb-3">
                <Users size={18} className="text-ink-500 dark:text-ink-100" />
                <h2 className="font-heading font-bold text-lg text-ink-600 dark:text-white">
                  {role === 'teacher' ? 'Classes you teach' : role === 'admin' ? 'Admin access' : 'Your classes'}
                </h2>
              </div>
              {isStudent ? (
                classes.length === 0 ? (
                  <p className="text-sm text-ink-400 dark:text-ink-200">
                    You have not joined a class yet. Use <strong>Join class</strong> on your home page with the code from
                    your teacher.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {classes.map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-3">
                        <span className="text-sm font-heading font-semibold text-ink-600 dark:text-white truncate">
                          {c.name}
                        </span>
                        <SubjectTag subject={subjectKey(c.subject)} size="sm" />
                      </li>
                    ))}
                  </ul>
                )
              ) : isTeacher ? (
                teacherClasses.length === 0 ? (
                  <p className="text-sm text-ink-400 dark:text-ink-200">
                    No classes yet. Create your first class to share a join code with students.
                  </p>
                ) : (
                  <ul className="space-y-2.5">
                    {teacherClasses.map((c) => (
                      <li key={c.id} className="flex items-center justify-between gap-3">
                        <span className="text-sm font-heading font-semibold text-ink-600 dark:text-white truncate">
                          {c.name}
                        </span>
                        <Badge tone="ink">{c.student_count ?? 0} students</Badge>
                      </li>
                    ))}
                  </ul>
                )
              ) : (
                <p className="text-sm text-ink-400 dark:text-ink-200">
                  You can approve teacher emails, set approval windows, copy private signup links, and revoke unused
                  invitations from the admin dashboard.
                </p>
              )}
            </Card>

            {/* Quick links */}
            <Card>
              <h2 className="font-heading font-bold text-lg text-ink-600 dark:text-white mb-3">Quick links</h2>
              <div className="space-y-1.5">
                {quickLinks.map((link) => (
                  <Link
                    key={link.to}
                    to={link.to}
                    className="flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-heading font-semibold text-ink-500 hover:bg-ink-50 hover:text-ink-600 dark:text-ink-100 dark:hover:bg-ink-700 dark:hover:text-white transition-colors"
                  >
                    <span className="text-ink-400 dark:text-ink-200">{link.icon}</span>
                    {link.label}
                  </Link>
                ))}
              </div>
            </Card>

            {/* Account facts */}
            <Card>
              <h2 className="font-heading font-bold text-lg text-ink-600 dark:text-white mb-3">Account information</h2>
              <dl className="space-y-3 text-sm">
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-400 dark:text-ink-200">Role</dt>
                  <dd className="font-semibold text-ink-600 dark:text-white">{roleLabel[role]}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-400 dark:text-ink-200">Sign-in method</dt>
                  <dd className="font-semibold text-ink-600 dark:text-white capitalize">{account.provider ?? 'Email'}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-400 dark:text-ink-200">Last sign-in</dt>
                  <dd className="font-semibold text-ink-600 dark:text-white">{formatDate(account.lastSignIn)}</dd>
                </div>
                <div className="flex items-center justify-between gap-3">
                  <dt className="text-ink-400 dark:text-ink-200">Member since</dt>
                  <dd className="font-semibold text-ink-600 dark:text-white">{formatDate(account.createdAt)}</dd>
                </div>
              </dl>
              <div className="mt-4 rounded-xl bg-leaf-50 dark:bg-ink-700/60 px-3 py-2.5 flex items-start gap-2">
                <ShieldCheck size={16} className="text-leaf-700 dark:text-leaf-100 mt-0.5 shrink-0" />
                <p className="text-xs text-leaf-700 dark:text-leaf-100">
                  Your profile is protected by the school&apos;s database rules. Only you can change your own name.
                </p>
              </div>
            </Card>
          </div>
        </div>

        {isStudent && (
          <p className="text-center text-xs text-ink-300 dark:text-ink-300 flex items-center justify-center gap-1.5 pb-2">
            <BookOpen size={12} /> {notebooks.length} notebook{notebooks.length === 1 ? '' : 's'} saved on this device
          </p>
        )}
      </div>
    </AppShell>
  );
}
