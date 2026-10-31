// Marks are out of 100. The teacher can type marks or tap a grade to fill them in.
export const GRADE_PRESETS: { letter: string; marks: number }[] = [
  { letter: 'A+', marks: 95 },
  { letter: 'A', marks: 85 },
  { letter: 'B', marks: 75 },
  { letter: 'C', marks: 65 },
  { letter: 'D', marks: 55 },
  { letter: 'Needs work', marks: 40 },
];

export function gradeLetter(marks: number): string {
  if (marks >= 90) return 'A+';
  if (marks >= 80) return 'A';
  if (marks >= 70) return 'B';
  if (marks >= 60) return 'C';
  if (marks >= 50) return 'D';
  return 'Needs work';
}

export function gradeLabel(marks: number): string {
  return `${gradeLetter(marks)} (${marks}/100)`;
}
