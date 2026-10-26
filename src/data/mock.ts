export type SubjectKey = 'maths' | 'science' | 'english' | 'history' | 'computer';

export type Subject = {
  key: SubjectKey;
  name: string;
  color: SubjectKey; // maps to subj/subjInk classes
};

export const subjects: Record<SubjectKey, Subject> = {
  maths: { key: 'maths', name: 'Mathematics', color: 'maths' },
  science: { key: 'science', name: 'Science', color: 'science' },
  english: { key: 'english', name: 'English', color: 'english' },
  history: { key: 'history', name: 'History', color: 'history' },
  computer: { key: 'computer', name: 'Computer Science', color: 'computer' },
};

export const subjectList: Subject[] = Object.values(subjects);

export type Assignment = {
  id: string;
  title: string;
  subject: SubjectKey;
  dueDate: string; // ISO
  status: 'upcoming' | 'submitted' | 'graded' | 'overdue';
  progress?: number; // for teacher: submission completion %
  description?: string;
};

export type Notebook = {
  id: string;
  subject: SubjectKey;
  title: string;
  pages: number;
  updated: string; // relative label
  preview: string; // short snippet
};

export type Doubt = {
  id: string;
  subject: SubjectKey;
  question: string;
  author: string; // anonymous label like "Anonymous Owl"
  askedAt: string;
  status: 'open' | 'answered';
  answer?: string;
  upvotes: number;
};

export type SchoolClass = {
  id: string;
  name: string;
  subject: SubjectKey;
  joinCode: string;
  students: number;
};

export type Submission = {
  id: string;
  assignmentTitle: string;
  studentName: string;
  subject: SubjectKey;
  submittedAt: string;
  status: 'ungraded' | 'graded';
};

export type Notification = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  kind: 'assignment' | 'doubt' | 'grade' | 'exam';
};

// Helper: produce an ISO date `days` days from now
const fromNow = (days: number, hour = 9, minute = 0) => {
  const d = new Date('2026-10-19T09:00:00');
  d.setDate(d.getDate() + days);
  d.setHours(hour, minute, 0, 0);
  return d.toISOString();
};

export const studentAssignments: Assignment[] = [
  {
    id: 'a1',
    title: 'Quadratic Equations — Problem Set 4',
    subject: 'maths',
    dueDate: fromNow(1, 23, 59),
    status: 'upcoming',
    description: 'Complete questions 1–10. Show all working.',
  },
  {
    id: 'a2',
    title: 'Plant Cell Diagram Labelling',
    subject: 'science',
    dueDate: fromNow(3, 23, 59),
    status: 'upcoming',
    description: 'Label the parts of a plant cell on the worksheet.',
  },
  {
    id: 'a3',
    title: 'Essay: A Letter to My Future Self',
    subject: 'english',
    dueDate: fromNow(-1, 23, 59),
    status: 'overdue',
    description: '300-word reflective letter.',
  },
  {
    id: 'a4',
    title: 'Mughal Empire Timeline',
    subject: 'history',
    dueDate: fromNow(7, 23, 59),
    status: 'upcoming',
    description: 'Build a timeline of key Mughal rulers.',
  },
  {
    id: 'a5',
    title: 'Python Loops Worksheet',
    subject: 'computer',
    dueDate: fromNow(0, 23, 59),
    status: 'upcoming',
    description: 'Solve the 8 loop exercises.',
  },
  {
    id: 'a6',
    title: 'Fractions Quiz',
    subject: 'maths',
    dueDate: fromNow(-4, 23, 59),
    status: 'graded',
    description: 'Scored 9/10 — well done!',
  },
];

export const studentNotebooks: Notebook[] = [
  { id: 'n1', subject: 'maths', title: 'Algebra & Equations', pages: 24, updated: '2h ago', preview: 'Quadratic formula: x = (-b ± √(b²-4ac)) / 2a' },
  { id: 'n2', subject: 'science', title: 'Life Processes', pages: 18, updated: 'yesterday', preview: 'Photosynthesis: 6CO₂ + 6H₂O → C₆H₁₂O₆ + 6O₂' },
  { id: 'n3', subject: 'english', title: 'Poetry & Prose', pages: 31, updated: '3d ago', preview: 'A metaphor compares two unlike things without "like"…' },
  { id: 'n4', subject: 'history', title: 'The Mughal Era', pages: 15, updated: '4d ago', preview: 'Babur founded the Mughal Empire after Panipat, 1526.' },
  { id: 'n5', subject: 'computer', title: 'Python Basics', pages: 22, updated: 'today', preview: 'A for loop repeats a block: for i in range(5):' },
  { id: 'n6', subject: 'maths', title: 'Geometry Notes', pages: 12, updated: 'last week', preview: 'Sum of angles in a triangle = 180°.' },
];

export const studentDoubts: Doubt[] = [
  {
    id: 'd1',
    subject: 'maths',
    question: 'How do I know when to use the quadratic formula vs factoring?',
    author: 'Anonymous Owl',
    askedAt: '1h ago',
    status: 'answered',
    answer: 'Try factoring first if the coefficients are small integers. If the discriminant is not a perfect square, the quadratic formula is more reliable.',
    upvotes: 12,
  },
  {
    id: 'd2',
    subject: 'science',
    question: 'Why is the mitochondria called the powerhouse of the cell?',
    author: 'Quiet Fox',
    askedAt: '5h ago',
    status: 'open',
    upvotes: 7,
  },
  {
    id: 'd3',
    subject: 'history',
    question: 'What was the main cause of the decline of the Mughal Empire?',
    author: 'Curious Raven',
    askedAt: '1d ago',
    status: 'open',
    upvotes: 4,
  },
];

export const studentNotifications: Notification[] = [
  { id: 'nt1', title: 'Assignment graded', body: 'Fractions Quiz: 9/10. Great work!', time: '10m ago', read: false, kind: 'grade' },
  { id: 'nt2', title: 'New doubt answer', body: 'Your Maths doubt was answered.', time: '1h ago', read: false, kind: 'doubt' },
  { id: 'nt3', title: 'Deadline approaching', body: 'Python Loops Worksheet due today.', time: '3h ago', read: false, kind: 'assignment' },
];

// ===== Teacher data =====
export const teacherClasses: SchoolClass[] = [
  { id: 'c1', name: 'Class 8-A Mathematics', subject: 'maths', joinCode: 'MATH8A42', students: 32 },
  { id: 'c2', name: 'Class 9-B Science', subject: 'science', joinCode: 'SCI9B17', students: 28 },
  { id: 'c3', name: 'Class 10-C Computer Science', subject: 'computer', joinCode: 'CS10C88', students: 24 },
];

export const teacherAssignments: Assignment[] = [
  {
    id: 'ta1',
    title: 'Quadratic Equations — Problem Set 4',
    subject: 'maths',
    dueDate: fromNow(1, 23, 59),
    status: 'upcoming',
    progress: 64,
    description: 'Class 8-A • Due tomorrow',
  },
  {
    id: 'ta2',
    title: 'Plant Cell Diagram Labelling',
    subject: 'science',
    dueDate: fromNow(3, 23, 59),
    status: 'upcoming',
    progress: 31,
    description: 'Class 9-B • Due in 3 days',
  },
  {
    id: 'ta3',
    title: 'Python Loops Worksheet',
    subject: 'computer',
    dueDate: fromNow(0, 23, 59),
    status: 'upcoming',
    progress: 82,
    description: 'Class 10-C • Due today',
  },
];

export const teacherSubmissions: Submission[] = [
  { id: 's1', assignmentTitle: 'Python Loops Worksheet', studentName: 'Aarav Sharma', subject: 'computer', submittedAt: '12m ago', status: 'ungraded' },
  { id: 's2', assignmentTitle: 'Quadratic Equations — Problem Set 4', studentName: 'Meera Iyer', subject: 'maths', submittedAt: '40m ago', status: 'ungraded' },
  { id: 's3', assignmentTitle: 'Plant Cell Diagram Labelling', studentName: 'Kabir Singh', subject: 'science', submittedAt: '2h ago', status: 'ungraded' },
  { id: 's4', assignmentTitle: 'Quadratic Equations — Problem Set 4', studentName: 'Ananya Rao', subject: 'maths', submittedAt: '3h ago', status: 'ungraded' },
];

export const teacherDoubts: Doubt[] = [
  {
    id: 'td1',
    subject: 'science',
    question: 'Why is the mitochondria called the powerhouse of the cell?',
    author: 'Quiet Fox',
    askedAt: '5h ago',
    status: 'open',
    upvotes: 7,
  },
  {
    id: 'td2',
    subject: 'history',
    question: 'What was the main cause of the decline of the Mughal Empire?',
    author: 'Curious Raven',
    askedAt: '1d ago',
    status: 'open',
    upvotes: 4,
  },
  {
    id: 'td3',
    subject: 'maths',
    question: 'Can the discriminant be negative? What happens then?',
    author: 'Sleepy Bear',
    askedAt: '2d ago',
    status: 'open',
    upvotes: 2,
  },
];

export const teacherNotifications: Notification[] = [
  { id: 'tn1', title: 'New submission', body: 'Aarav submitted Python Loops Worksheet.', time: '12m ago', read: false, kind: 'assignment' },
  { id: 'tn2', title: 'Unanswered doubt', body: 'A Science doubt has been open for 5h.', time: '5h ago', read: false, kind: 'doubt' },
  { id: 'tn3', title: 'Assignment due soon', body: 'Quadratic Equations due tomorrow.', time: '6h ago', read: true, kind: 'assignment' },
];

export const studentName = 'Aarav';
export const teacherName = 'Ms. Kavita';
