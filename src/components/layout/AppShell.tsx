import { type ReactNode } from 'react';
import { Sidebar } from './Sidebar';
import { TopBar } from './TopBar';
import { BottomTabBar } from './BottomTabBar';
import { type NavItem, type Role } from '@/data/nav';
import { type Notification } from '@/data/mock';
import { useAuth } from '@/components/auth/AuthProvider';

export function AppShell({
  role,
  nav,
  name,
  notifications,
  children,
}: {
  role: Role;
  nav: NavItem[];
  name: string;
  notifications: Notification[];
  children: ReactNode;
}) {
  const { profile } = useAuth();
  const displayName = profile?.full_name?.split(' ')[0] ?? name;

  return (
    <div className="flex min-h-screen bg-paper dark:bg-ink-900">
      <Sidebar items={nav} role={role} />
      <div className="flex-1 flex flex-col min-w-0">
        <TopBar name={displayName} role={role} notifications={notifications} />
        <main className="flex-1 px-4 sm:px-6 py-6 pb-24 md:pb-8 max-w-5xl w-full mx-auto">
          {children}
        </main>
      </div>
      <BottomTabBar items={nav} />
    </div>
  );
}

export default AppShell;
