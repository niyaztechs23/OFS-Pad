import { subjects, type SubjectKey, type Assignment } from '@/data/mock';
import type { StudentAssignment } from '@/hooks/useStudent';

export function subjectKeyFromName(name: string | null): SubjectKey {
  if (!name) return 'maths';
  for (const s of Object.values(subjects)) {
    if (s.name.toLowerCase() === name.toLowerCase()) return s.key;
  }
  return 'maths';
}

// Converts a real database assignment into the shape the existing cards already understand.
export function toCardAssignment(a: StudentAssignment, nowMs: number = Date.now()): Assignment {
  let status: Assignment['status'] = 'upcoming';
  if (a.status === 'graded') status = 'graded';
  else if (a.status === 'submitted') status = 'submitted';
  else if (new Date(a.deadline).getTime() < nowMs) status = 'overdue';

  return {
    id: a.id,
    title: a.title,
    subject: subjectKeyFromName(a.subject),
    dueDate: a.deadline,
    status,
    description: a.description ?? undefined,
  };
}
