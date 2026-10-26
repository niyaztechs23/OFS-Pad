import { useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { Button } from '@/components/ui/Button';
import { GraduationCap, Briefcase, ArrowLeft, Mail, Lock, User, KeyRound } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

type Role = 'student' | 'teacher';

export function AuthPage() {
  const [params] = useSearchParams();
  const { session } = useAuth();
  const [mode, setMode] = useState<'login' | 'signup'>(params.get('mode') === 'signup' ? 'signup' : 'login');
  const [role, setRole] = useState<Role>('student');
  const [fullName, setFullName] = useState('');
  const [teacherInviteCode, setTeacherInviteCode] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  // If already signed in, redirect to the right dashboard
  if (session) {
    // role is resolved async via profile; defer redirect to App route guard
  }

  const friendlyError = (msg: string) => {
    if (/already.*registered|already.*in use/i.test(msg)) return 'An account with this email already exists. Try logging in.';
    if (/invalid.*credentials|invalid.*login/i.test(msg)) return 'Email or password is incorrect.';
    if (/rate limit|over.*request/i.test(msg)) return 'Too many attempts. Please wait a moment and try again.';
    if (/teacher invitation/i.test(msg)) return 'Teacher accounts require a valid invitation issued to this email address.';
    if (role === 'teacher' && /database error saving new user/i.test(msg)) return 'Teacher accounts require a valid invitation issued to this email address.';
    return msg;
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setBusy(true);
    try {
      if (mode === 'signup') {
        if (!fullName.trim()) {
          setError('Please enter your full name.');
          setBusy(false);
          return;
        }
        if (role === 'teacher' && !teacherInviteCode.trim()) {
          setError('Teacher accounts require an invitation code from your school administrator.');
          setBusy(false);
          return;
        }
        const { error: err } = await supabase.auth.signUp({
          email,
          password,
          options: { data: { full_name: fullName.trim(), role, teacher_invite_code: role === 'teacher' ? teacherInviteCode.trim() : null } },
        });
        if (err) throw err;
        // Email confirmation is off; onAuthStateChange will fire and trigger redirect
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({ email, password });
        if (err) throw err;
      }
    } catch (err) {
      setError(friendlyError(err instanceof Error ? err.message : 'Something went wrong. Please try again.'));
      setBusy(false);
    }
  };

  return (
    <div className="min-h-screen bg-paper dark:bg-ink-900 flex flex-col">
      <div className="px-5 sm:px-8 py-5 max-w-6xl mx-auto w-full flex items-center justify-between">
        <Logo />
        <Link to="/" className="inline-flex items-center gap-1 text-sm font-semibold text-ink-400 hover:text-ink-600 dark:text-ink-200 dark:hover:text-white">
          <ArrowLeft size={16} /> Back
        </Link>
      </div>

      <div className="flex-1 grid place-items-center px-5 py-8">
        <div className="w-full max-w-md">
          <div className="text-center mb-7">
            <h1 className="font-heading font-extrabold text-2xl text-ink-600 dark:text-white">
              {mode === 'login' ? 'Welcome back' : 'Create your account'}
            </h1>
            <p className="text-sm text-ink-400 dark:text-ink-200 mt-1">
              {mode === 'login' ? 'Log in to your OFS Pad' : 'Join OFS Pad in a minute'}
            </p>
          </div>

          {/* Mode tabs */}
          <div className="grid grid-cols-2 gap-1 p-1 bg-ink-100/70 dark:bg-ink-800 rounded-xl mb-6">
            {(['login', 'signup'] as const).map((m) => (
              <button
                key={m}
                onClick={() => { setMode(m); setError(null); }}
                className={`h-11 rounded-lg font-heading font-semibold text-sm transition-colors ${
                  mode === m
                    ? 'bg-white dark:bg-ink-700 text-ink-600 dark:text-white shadow-sm'
                    : 'text-ink-400 dark:text-ink-200'
                }`}
              >
                {m === 'login' ? 'Log in' : 'Sign up'}
              </button>
            ))}
          </div>

          {/* Role selector */}
          <div className="grid grid-cols-2 gap-3 mb-6">
            {([
              { key: 'student', label: 'Student', icon: GraduationCap, desc: 'I study here' },
                  { key: 'teacher', label: 'Teacher', icon: Briefcase, desc: 'Invitation required' },
            ] as const).map((r) => {
              const Icon = r.icon;
              const active = role === r.key;
              return (
                <button
                  key={r.key}
                  onClick={() => setRole(r.key as Role)}
                  className={`rounded-xl border-2 p-4 text-left transition-all min-h-[44px] ${
                    active
                      ? 'border-ink-500 bg-ink-50 dark:bg-ink-700 dark:border-ink-300'
                      : 'border-ink-100 dark:border-ink-700 hover:border-ink-200 dark:hover:border-ink-600'
                  }`}
                >
                  <span className={`w-9 h-9 grid place-items-center rounded-lg mb-2 ${active ? 'bg-ink-500 text-white' : 'bg-ink-100 text-ink-400 dark:bg-ink-700 dark:text-ink-200'}`}>
                    <Icon size={18} />
                  </span>
                  <p className={`font-heading font-bold text-sm ${active ? 'text-ink-600 dark:text-white' : 'text-ink-400 dark:text-ink-200'}`}>{r.label}</p>
                  <p className="text-xs text-ink-300 dark:text-ink-300">{r.desc}</p>
                </button>
              );
            })}
          </div>

          <form onSubmit={submit} className="space-y-4">
            {mode === 'signup' && (
              <Field
                icon={<User size={18} />}
                label="Full name"
                placeholder="Aarav Sharma"
                type="text"
                value={fullName}
                onChange={setFullName}
                required
              />
            )}
            {mode === 'signup' && role === 'teacher' && (
              <Field
                icon={<KeyRound size={18} />}
                label="Teacher invitation code"
                placeholder="Code from your school administrator"
                type="text"
                value={teacherInviteCode}
                onChange={setTeacherInviteCode}
                required
              />
            )}
            <Field
              icon={<Mail size={18} />}
              label="Email"
              placeholder="you@school.edu"
              type="email"
              value={email}
              onChange={setEmail}
              required
            />
            <Field
              icon={<Lock size={18} />}
              label="Password"
              placeholder="••••••••"
              type="password"
              value={password}
              onChange={setPassword}
              required
            />

            {error && (
              <p className="text-sm text-clay-600 dark:text-clay-100 bg-clay-50 dark:bg-clay-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}

            <Button type="submit" size="lg" fullWidth disabled={busy}>
              {busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}
            </Button>
          </form>

          <p className="text-center text-xs text-ink-300 dark:text-ink-300 mt-5">
            {mode === 'login'
              ? 'New here? Switch to Sign up to create an account.'
              : 'Already have an account? Switch to Log in.'}
          </p>
        </div>
      </div>
    </div>
  );
}

function Field({
  icon,
  label,
  type,
  placeholder,
  value,
  onChange,
  required,
}: {
  icon: React.ReactNode;
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (v: string) => void;
  required?: boolean;
}) {
  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1.5">{label}</span>
      <span className="relative block">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 dark:text-ink-300">{icon}</span>
        <input
          type={type}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          className="w-full h-12 pl-11 pr-4 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-ink-600 dark:text-white placeholder:text-ink-300 focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-100 dark:focus:ring-ink-700 transition-colors"
        />
      </span>
    </label>
  );
}

export default AuthPage;
