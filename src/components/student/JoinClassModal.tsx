import { useState, type FormEvent } from 'react';
import { X, KeyRound, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { joinClassByCode } from '@/hooks/useStudent';

export function JoinClassModal({
  onClose,
  onJoined,
}: {
  onClose: () => void;
  onJoined: () => void;
}) {
  const [code, setCode] = useState('');
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [joinedName, setJoinedName] = useState<string | null>(null);

  const submit = async (e: FormEvent) => {
    e.preventDefault();
    setBusy(true);
    setError(null);
    const res = await joinClassByCode(code);
    setBusy(false);
    if (!res.ok) {
      setError(res.message);
      return;
    }
    setJoinedName(res.className);
    onJoined();
  };

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-center p-4 bg-ink-900/40 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="w-full max-w-md rounded-2xl bg-white dark:bg-ink-800 shadow-pop p-6"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-heading font-extrabold text-xl text-ink-600 dark:text-white">Join a class</h2>
          <button
            onClick={onClose}
            aria-label="Close"
            className="w-9 h-9 grid place-items-center rounded-lg text-ink-400 hover:bg-ink-50 dark:hover:bg-ink-700 min-h-[44px]"
          >
            <X size={18} />
          </button>
        </div>

        {joinedName ? (
          <div className="text-center space-y-4 py-2">
            <span className="mx-auto w-14 h-14 rounded-full bg-leaf-50 text-leaf-600 dark:bg-leaf-700/30 dark:text-leaf-100 grid place-items-center">
              <CheckCircle2 size={30} />
            </span>
            <div>
              <p className="font-heading font-bold text-lg text-ink-600 dark:text-white">You joined {joinedName}</p>
              <p className="text-sm text-ink-400 dark:text-ink-200 mt-1">
                Your teacher's assignments will show up on your dashboard.
              </p>
            </div>
            <Button size="md" fullWidth onClick={onClose}>Done</Button>
          </div>
        ) : (
          <form className="space-y-4" onSubmit={submit}>
            <label className="block">
              <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1.5">
                Join code from your teacher
              </span>
              <input
                autoFocus
                value={code}
                onChange={(e) => setCode(e.target.value.toUpperCase())}
                maxLength={8}
                placeholder="e.g. A1B2C3"
                className="w-full h-12 px-3 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-ink-600 dark:text-white text-center text-lg font-heading font-bold tracking-widest focus:outline-none focus:border-ink-400 min-h-[44px]"
              />
            </label>
            {error && (
              <p className="text-sm text-clay-600 dark:text-clay-100 bg-clay-50 dark:bg-clay-500/20 rounded-lg px-3 py-2">
                {error}
              </p>
            )}
            <div className="flex justify-end gap-2 pt-1">
              <Button variant="ghost" size="md" type="button" onClick={onClose}>Cancel</Button>
              <Button size="md" type="submit" disabled={busy || !code.trim()}>
                <KeyRound size={16} /> {busy ? 'Joining…' : 'Join class'}
              </Button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}

export default JoinClassModal;
