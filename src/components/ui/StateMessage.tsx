import { Loader2, Inbox, AlertCircle } from 'lucide-react';

export function Loading({ label = 'Loading…' }: { label?: string }) {
  return (
    <div className="grid place-items-center py-12 text-ink-300 dark:text-ink-200">
      <Loader2 className="animate-spin mb-2" size={24} />
      <p className="text-sm">{label}</p>
    </div>
  );
}

export function Empty({ title, hint }: { title: string; hint?: string }) {
  return (
    <div className="grid place-items-center py-12 text-ink-300 dark:text-ink-200 text-center">
      <Inbox size={28} className="mb-2 opacity-70" />
      <p className="font-heading font-semibold text-ink-400 dark:text-ink-100">{title}</p>
      {hint && <p className="text-sm mt-1">{hint}</p>}
    </div>
  );
}

export function ErrorState({ message }: { message: string }) {
  return (
    <div className="grid place-items-center py-12 text-clay-600 dark:text-clay-100 text-center">
      <AlertCircle size={28} className="mb-2" />
      <p className="text-sm max-w-sm">{message}</p>
    </div>
  );
}
