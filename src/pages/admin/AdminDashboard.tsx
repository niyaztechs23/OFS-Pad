import { useEffect, useState } from 'react';
import { Clock3, Link2, Mail, MailPlus, RefreshCw, ShieldCheck, Trash2, UserCheck } from 'lucide-react';
import { AppShell } from '@/components/layout/AppShell';
import { Card } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ErrorState, Loading } from '@/components/ui/StateMessage';
import { adminNav } from '@/data/nav';
import { supabase } from '@/lib/supabase';
import { useAuth } from '@/components/auth/AuthProvider';

type Approval = {
  id: string;
  email: string;
  expires_at: string;
  used_at: string | null;
  created_at: string;
};

const durationOptions = [
  { value: '7', label: '7 days' },
  { value: '30', label: '30 days' },
  { value: '90', label: '90 days' },
];

export default function AdminDashboard() {
  const { profile } = useAuth();
  const [email, setEmail] = useState('');
  const [duration, setDuration] = useState('7');
  const [approvals, setApprovals] = useState<Approval[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [revokingId, setRevokingId] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const loadApprovals = async () => {
    setLoading(true);
    const { data, error: rpcError } = await supabase.rpc('admin_list_teacher_approvals');
    if (rpcError) {
      setError(rpcError.message);
    } else {
      setApprovals((data ?? []) as Approval[]);
      setError(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    void loadApprovals();
  }, []);

  const approveEmail = async (event: React.FormEvent) => {
    event.preventDefault();
    const normalizedEmail = email.trim().toLowerCase();
    if (!normalizedEmail) return;

    setBusy(true);
    setError(null);
    setNotice(null);
    const expiresAt = new Date(Date.now() + Number(duration) * 24 * 60 * 60 * 1000).toISOString();
    const { error: rpcError } = await supabase.rpc('admin_approve_teacher', {
      p_email: normalizedEmail,
      p_expires_at: expiresAt,
    });

    if (rpcError) {
      setError(rpcError.message);
    } else {
      setEmail('');
      setNotice(`${normalizedEmail} is approved for teacher signup.`);
      await loadApprovals();
    }
    setBusy(false);
  };

  const revokeApproval = async (id: string) => {
    setRevokingId(id);
    setError(null);
    setNotice(null);
    const { error: rpcError } = await supabase.rpc('admin_revoke_teacher_approval', { p_id: id });
    if (rpcError) {
      setError(rpcError.message);
    } else {
      setNotice('Teacher approval revoked.');
      await loadApprovals();
    }
    setRevokingId(null);
  };

  const signupLink = `${window.location.origin}/auth?mode=signup&role=teacher`;

  const copySignupLink = async (teacherEmail: string) => {
    try {
      await navigator.clipboard.writeText(signupLink);
      setNotice(`Private signup link copied for ${teacherEmail}.`);
    } catch {
      window.prompt('Copy this private teacher signup link:', signupLink);
    }
  };

  const emailSignupLink = (teacherEmail: string) => {
    const subject = encodeURIComponent('Your OFS Pad teacher signup link');
    const body = encodeURIComponent(`Your school has approved your OFS Pad teacher account. Open this private link to continue with Google or email signup:\n\n${signupLink}`);
    window.location.href = `mailto:${teacherEmail}?subject=${subject}&body=${body}`;
  };

  const adminName = profile?.full_name?.split(' ')[0] ?? 'Admin';

  return (
    <AppShell role="admin" nav={adminNav} name={adminName} notifications={[]}>
      <div className="space-y-7">
        <section>
          <div className="flex items-start gap-3">
            <span className="w-11 h-11 rounded-xl bg-leaf-50 text-leaf-700 dark:bg-leaf-700/30 dark:text-leaf-100 grid place-items-center shrink-0">
              <ShieldCheck size={22} />
            </span>
            <div>
              <h1 className="font-heading font-extrabold text-2xl sm:text-3xl text-ink-600 dark:text-white">Teacher approvals</h1>
              <p className="text-ink-400 dark:text-ink-200 mt-1">Approve staff by email. No SQL editor needed for day-to-day access management.</p>
            </div>
          </div>
        </section>

        <Card>
          <div className="flex items-center gap-2 mb-4">
            <MailPlus size={19} className="text-ink-500 dark:text-ink-100" />
            <h2 className="font-heading font-bold text-lg text-ink-600 dark:text-white">Approve a teacher email</h2>
          </div>
          <form onSubmit={approveEmail} className="grid sm:grid-cols-[1fr_auto_auto] gap-3 items-end">
            <label className="block">
              <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1.5">Teacher email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="teacher@school.edu"
                required
                className="w-full h-11 px-4 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-ink-600 dark:text-white placeholder:text-ink-300 focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-100 dark:focus:ring-ink-700"
              />
            </label>
            <label className="block">
              <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1.5">Approval lasts</span>
              <select
                value={duration}
                onChange={(event) => setDuration(event.target.value)}
                className="h-11 w-full sm:w-32 px-3 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-ink-600 dark:text-white focus:outline-none focus:border-ink-400"
              >
                {durationOptions.map((option) => <option key={option.value} value={option.value}>{option.label}</option>)}
              </select>
            </label>
            <Button type="submit" disabled={busy} className="min-w-32">
              <UserCheck size={16} /> {busy ? 'Saving…' : 'Approve email'}
            </Button>
          </form>
          <p className="text-xs text-ink-300 dark:text-ink-200 mt-3">The teacher must use this exact email at the private signup link. Email confirmation should be enabled for production.</p>
        </Card>

        {notice && <p className="rounded-xl bg-leaf-50 text-leaf-700 dark:bg-leaf-700/30 dark:text-leaf-100 px-4 py-3 text-sm">{notice}</p>}
        {error && <ErrorState message={error} />}

        <section>
          <div className="flex items-center justify-between gap-3 mb-3">
            <div>
              <h2 className="font-heading font-bold text-lg text-ink-600 dark:text-white">Pending approvals</h2>
              <p className="text-sm text-ink-400 dark:text-ink-200">Unused email approvals waiting for signup.</p>
            </div>
            <button onClick={() => void loadApprovals()} aria-label="Refresh approvals" className="w-11 h-11 grid place-items-center rounded-xl text-ink-400 hover:bg-ink-50 dark:text-ink-200 dark:hover:bg-ink-800 min-h-[44px]"><RefreshCw size={18} /></button>
          </div>

          {loading ? <Loading label="Loading approvals…" /> : approvals.length === 0 ? (
            <Card><div className="text-center py-6 text-ink-300 dark:text-ink-200"><ShieldCheck size={28} className="mx-auto mb-2 opacity-70" /><p className="font-heading font-semibold">No pending approvals</p><p className="text-sm mt-1">Approved teachers will appear here until they finish signup.</p></div></Card>
          ) : (
            <div className="space-y-3">
              {approvals.map((approval) => {
                const expired = new Date(approval.expires_at).getTime() <= Date.now();
                return (
                  <Card key={approval.id} className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div className="min-w-0">
                      <p className="font-heading font-bold text-ink-600 dark:text-white truncate">{approval.email}</p>
                      <p className="text-sm text-ink-400 dark:text-ink-200 flex items-center gap-1 mt-1"><Clock3 size={14} /> {expired ? 'Expired' : `Expires ${new Date(approval.expires_at).toLocaleDateString()}`}</p>
                    </div>
                    <div className="flex items-center gap-3 shrink-0">
                      <Badge tone={expired ? 'clay' : 'leaf'}>{expired ? 'Expired' : 'Pending'}</Badge>
                      {!expired && <>
                        <Button variant="ghost" size="sm" onClick={() => void copySignupLink(approval.email)}><Link2 size={15} /> Copy link</Button>
                        <Button variant="ghost" size="sm" onClick={() => emailSignupLink(approval.email)}><Mail size={15} /> Email link</Button>
                      </>}
                      <Button variant="outline" size="sm" onClick={() => void revokeApproval(approval.id)} disabled={revokingId === approval.id}><Trash2 size={15} /> {revokingId === approval.id ? 'Revoking…' : 'Revoke'}</Button>
                    </div>
                  </Card>
                );
              })}
            </div>
          )}
        </section>
      </div>
    </AppShell>
  );
}
