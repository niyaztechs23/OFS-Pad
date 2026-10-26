import { type ReactNode } from 'react';

type Tone = 'ink' | 'leaf' | 'amber' | 'clay' | 'neutral';

const tones: Record<Tone, string> = {
  ink: 'bg-ink-50 text-ink-600 dark:bg-ink-700 dark:text-ink-100',
  leaf: 'bg-leaf-50 text-leaf-700 dark:bg-leaf-700/30 dark:text-leaf-100',
  amber: 'bg-amber-50 text-amber-600 dark:bg-amber-500/20 dark:text-amber-100',
  clay: 'bg-clay-50 text-clay-600 dark:bg-clay-500/20 dark:text-clay-100',
  neutral: 'bg-ink-100/70 text-ink-600 dark:bg-ink-700 dark:text-ink-100',
};

export function Badge({
  children,
  tone = 'neutral',
  className = '',
}: {
  children: ReactNode;
  tone?: Tone;
  className?: string;
}) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${tones[tone]} ${className}`}
    >
      {children}
    </span>
  );
}

export default Badge;
