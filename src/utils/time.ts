import { useEffect, useState } from 'react';

type Tone = 'leaf' | 'amber' | 'clay' | 'neutral';

// Re-renders the component every `ms` milliseconds so countdowns stay live.
export function useNow(ms = 30000): number {
  const [now, setNow] = useState(() => Date.now());
  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), ms);
    return () => clearInterval(t);
  }, [ms]);
  return now;
}

export function deadlineCountdown(
  iso: string,
  nowMs: number = Date.now()
): { label: string; tone: Tone; overdue: boolean } {
  const diffMs = new Date(iso).getTime() - nowMs;

  if (diffMs < 0) {
    const mins = Math.floor(-diffMs / 60000);
    const hours = Math.floor(mins / 60);
    const days = Math.floor(hours / 24);
    let label = 'Overdue';
    if (days >= 1) label = `Overdue by ${days}d`;
    else if (hours >= 1) label = `Overdue by ${hours}h`;
    return { label, tone: 'clay', overdue: true };
  }

  const mins = Math.floor(diffMs / 60000);
  const hours = Math.floor(mins / 60);
  const days = Math.floor(hours / 24);

  if (hours < 1) return { label: `Due in ${Math.max(mins, 1)}m`, tone: 'amber', overdue: false };
  if (hours < 24) return { label: `Due in ${hours}h`, tone: 'amber', overdue: false };
  if (days <= 7) return { label: `In ${days}d`, tone: 'amber', overdue: false };
  return { label: `In ${days}d`, tone: 'leaf', overdue: false };
}

export function formatDate(iso: string): string {
  return new Date(iso).toLocaleDateString('en-GB', {
    day: 'numeric',
    month: 'short',
  });
}

export function timeAgo(value: string | number, nowMs: number = Date.now()): string {
  const timestamp = typeof value === 'number' ? value : new Date(value).getTime();
  const diff = Math.max(0, nowMs - timestamp);
  const mins = Math.floor(diff / 60000);
  if (mins < 1) return 'Just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  return `${days}d ago`;
}
