import { Home, BookOpen, ClipboardList, MessageCircleQuestion, CalendarDays, Users, Megaphone, ShieldCheck, UserRound } from 'lucide-react';
import { type LucideIcon } from 'lucide-react';

export type NavSection = 'workspace' | 'connect' | 'account';

export type NavItem = {
  label: string;
  to: string;
  icon: LucideIcon;
  section: NavSection;
  mobile: boolean;
};

export const studentNav: NavItem[] = [
  { label: 'Home', to: '/student', icon: Home, section: 'workspace', mobile: true },
  { label: 'Notebooks', to: '/student/notebooks', icon: BookOpen, section: 'workspace', mobile: false },
  { label: 'Assignments', to: '/student/assignments', icon: ClipboardList, section: 'workspace', mobile: true },
  { label: 'Planner', to: '/student/planner', icon: CalendarDays, section: 'workspace', mobile: false },
  { label: 'Doubts', to: '/student/doubts', icon: MessageCircleQuestion, section: 'connect', mobile: true },
  { label: 'Announcements', to: '/student/announcements', icon: Megaphone, section: 'connect', mobile: false },
  { label: 'Profile', to: '/profile', icon: UserRound, section: 'account', mobile: true },
];

export const teacherNav: NavItem[] = [
  { label: 'Home', to: '/teacher', icon: Home, section: 'workspace', mobile: true },
  { label: 'Classes', to: '/teacher/classes', icon: Users, section: 'workspace', mobile: false },
  { label: 'Assignments', to: '/teacher/assignments', icon: ClipboardList, section: 'workspace', mobile: true },
  { label: 'Exams', to: '/teacher/exams', icon: CalendarDays, section: 'workspace', mobile: false },
  { label: 'Doubts', to: '/teacher/doubts', icon: MessageCircleQuestion, section: 'connect', mobile: true },
  { label: 'Announcements', to: '/teacher/announcements', icon: Megaphone, section: 'connect', mobile: false },
  { label: 'Profile', to: '/profile', icon: UserRound, section: 'account', mobile: true },
];

export const adminNav: NavItem[] = [
  { label: 'Teacher approvals', to: '/admin', icon: ShieldCheck, section: 'workspace', mobile: true },
  { label: 'Profile', to: '/profile', icon: UserRound, section: 'account', mobile: true },
];

export type Role = 'student' | 'teacher' | 'admin';

export function navForRole(role: Role): NavItem[] {
  return role === 'teacher' ? teacherNav : role === 'admin' ? adminNav : studentNav;
}
