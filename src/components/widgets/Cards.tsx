import { Card } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { SubjectTag } from '@/components/ui/SubjectTag';
import { Clock, BookOpen, ArrowRight } from 'lucide-react';
import { type Assignment } from '@/data/mock';
import { deadlineCountdown } from '@/utils/time';
import { Link } from 'react-router-dom';

export function AssignmentCard({ assignment }: { assignment: Assignment }) {
  const d = deadlineCountdown(assignment.dueDate);
  const tone =
    assignment.status === 'overdue'
      ? 'clay'
      : assignment.status === 'graded'
      ? 'leaf'
      : d.tone;

  return (
    <Card hoverable className="flex flex-col gap-3">
      <div className="flex items-center justify-between gap-2">
        <SubjectTag subject={assignment.subject} size="sm" />
        <Badge tone={tone as 'leaf' | 'amber' | 'clay'}>
          <Clock size={12} />
          {d.label}
        </Badge>
      </div>
      <div>
        <h3 className="font-heading font-bold text-ink-600 dark:text-white leading-snug">
          {assignment.title}
        </h3>
        {assignment.description && (
          <p className="text-sm text-ink-400 dark:text-ink-200 mt-1">{assignment.description}</p>
        )}
      </div>
      <Link
        to="/student/assignments"
        className="inline-flex items-center gap-1 text-sm font-semibold text-ink-500 hover:text-ink-600 dark:text-ink-100 mt-auto"
      >
        Open <ArrowRight size={14} />
      </Link>
    </Card>
  );
}

export function NotebookCard({
  subject,
  title,
  pages,
  updated,
  preview,
}: {
  subject: Assignment['subject'];
  title: string;
  pages: number;
  updated: string;
  preview: string;
}) {
  return (
    <Card hoverable padded={false} className="overflow-hidden group cursor-pointer">
      {/* Notebook preview with ruled lines + margin */}
      <div className="relative h-28 notebook-page notebook-margin bg-paper-warm/60 dark:bg-ink-700/40 px-14 py-3 overflow-hidden">
        <p className="font-body text-xs text-ink-400 dark:text-ink-200 leading-relaxed line-clamp-3">
          {preview}
        </p>
        <span className="absolute top-2 right-2 text-[10px] font-semibold text-ink-300 dark:text-ink-200 bg-white/70 dark:bg-ink-800/70 rounded-md px-1.5 py-0.5">
          {pages}p
        </span>
      </div>
      <div className="p-4">
        <SubjectTag subject={subject} size="sm" />
        <h3 className="font-heading font-bold text-ink-600 dark:text-white mt-2 leading-snug">
          {title}
        </h3>
        <p className="text-xs text-ink-300 dark:text-ink-200 mt-1 flex items-center gap-1">
          <BookOpen size={12} /> Updated {updated}
        </p>
      </div>
    </Card>
  );
}

export function ProgressBar({ value, tone = 'ink' }: { value: number; tone?: 'ink' | 'leaf' | 'amber' }) {
  const color = {
    ink: 'bg-ink-500',
    leaf: 'bg-leaf-500',
    amber: 'bg-amber-500',
  }[tone];
  return (
    <div className="h-2 rounded-full bg-ink-100 dark:bg-ink-700 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500`} style={{ width: `${value}%` }} />
    </div>
  );
}
