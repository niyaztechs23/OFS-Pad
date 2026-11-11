import { Home, BookOpen, ClipboardList, MessageCircleQuestion, CalendarDays, Users, Megaphone, ShieldCheck, UserRound } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
};

export const studentNav: NavItem[] = [
  { label: 'Home', to: '/student', icon: Home },
  { label: 'Notebooks', to: '/student/notebooks', icon: BookOpen },
  { label: 'Assignments', to: '/student/assignments', icon: ClipboardList },
  { label: 'Doubts', to: '/student/doubts', icon: MessageCircleQuestion },
  { label: 'Announcements', to: '/student/announcements', icon: Megaphone },
  { label: 'Planner', to: '/student/planner', icon: CalendarDays },
  { label: 'Profile', to: '/profile', icon: UserRound },
];

export const teacherNav: NavItem[] = [
  { label: 'Home', to: '/teacher', icon: Home },
  { label: 'Classes', to: '/teacher/classes', icon: Users },
  { label: 'Assignments', to: '/teacher/assignments', icon: ClipboardList },
  { label: 'Exams', to: '/teacher/exams', icon: CalendarDays },
  { label: 'Doubts', to: '/teacher/doubts', icon: MessageCircleQuestion },
  { label: 'Announcements', to: '/teacher/announcements', icon: Megaphone },
  { label: 'Profile', to: '/profile', icon: UserRound },
];

export const adminNav: NavItem[] = [
  { label: 'Teacher approvals', to: '/admin', icon: ShieldCheck },
  { label: 'Profile', to: '/profile', icon: UserRound },
];

export type Role = 'student' | 'teacher' | 'admin';

export function navForRole(role: Role): NavItem[] {
  return role === 'teacher' ? teacherNav : role === 'admin' ? adminNav : studentNav;
}
