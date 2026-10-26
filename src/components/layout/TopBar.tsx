import { useState, useRef, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Bell, Moon, Sun, LogOut, ChevronRight } from 'lucide-react';
import { useTheme } from '@/components/theme/ThemeProvider';
import { useAuth } from '@/components/auth/AuthProvider';
import { useStudentNotifications } from '@/hooks/useStudent';
import { useToGrade } from '@/hooks/useTeacher';
import { timeAgo } from '@/utils/time';
import { type Notification } from '@/data/mock';

type Row = {
  id: string;
  title: string;
  body: string;
  time: string;
  read: boolean;
  href: string;
};

export function TopBar({
  name,
  role,
}: {
  name: string;
  role: 'student' | 'teacher';
  notifications: Notification[];
}) {
  const { theme, toggle } = useTheme();
  const { signOut, session } = useAuth();
  const navigate = useNavigate();
  const [bellOpen, setBellOpen] = useState(false);
  const bellRef = useRef<HTMLDivElement>(null);

  // Students see their notifications and grades. Teachers see work waiting to be graded.
  const student = useStudentNotifications(role === 'student' ? session?.userId : undefined);
  const teacher = useToGrade(role === 'teacher' ? session?.userId : undefined);

  const rows: Row[] =
    role === 'teacher'
      ? teacher.items.map((g) => ({
          id: g.id,
          title: 'Needs grading',
          body: `${g.student_name} submitted "${g.title}"`,
          time: timeAgo(g.submitted_at),
          read: false,
          href: `/teacher/assignments?review=${g.assignment_id}&submission=${g.id}`,
        }))
      : student.items.map((n) => ({
          id: n.id,
          title: n.title,
          body: n.body,
          time: n.at ? timeAgo(n.at) : 'Graded',
          read: n.read,
          href: n.href,
        }));
  const unread = rows.filter((n) => !n.read).length;

  useEffect(() => {
    function onClick(e: MouseEvent) {
      if (bellRef.current && !bellRef.current.contains(e.target as Node)) setBellOpen(false);
    }
    document.addEventListener('mousedown', onClick);
    return () => document.removeEventListener('mousedown', onClick);
  }, []);

  const toggleBell = () => {
    if (!bellOpen) {
      if (role === 'student') void student.refresh();
      if (role === 'teacher') void teacher.refresh();
    }
    setBellOpen((v) => !v);
  };

  const openRow = (row: Row) => {
    if (role === 'student') void student.markRead(row.id);
    setBellOpen(false);
    navigate(row.href);
  };

  const hour = new Date().getHours();
  const greeting = hour < 12 ? 'Good morning' : hour < 17 ? 'Good afternoon' : 'Good evening';

  return (
    <header className="sticky top-0 z-30 flex items-center gap-3 h-16 px-4 sm:px-6 bg-paper/80 dark:bg-ink-900/80 backdrop-blur border-b border-ink-100/70 dark:border-ink-700/60">
      <div className="flex-1 min-w-0">
        <p className="text-xs text-ink-300 dark:text-ink-200 hidden sm:block">
          {role === 'teacher' ? 'Teacher account' : 'Student account'}
        </p>
        <p className="font-heading font-bold text-ink-600 dark:text-white truncate">
          {greeting}, {name}
        </p>
      </div>

      <button
        onClick={toggle}
        aria-label="Toggle theme"
        className="w-11 h-11 grid place-items-center rounded-xl text-ink-400 hover:bg-ink-50 hover:text-ink-600 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-white transition-colors min-h-[44px]"
      >
        {theme === 'light' ? <Moon size={20} /> : <Sun size={20} />}
      </button>

      <div className="relative" ref={bellRef}>
        <button
          onClick={toggleBell}
          aria-label="Notifications"
          className="relative w-11 h-11 grid place-items-center rounded-xl text-ink-400 hover:bg-ink-50 hover:text-ink-600 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-white transition-colors min-h-[44px]"
        >
          <Bell size={20} />
          {unread > 0 && (
            <span className="absolute top-1.5 right-1.5 min-w-[18px] h-[18px] px-1 grid place-items-center rounded-full bg-clay-500 text-white text-[10px] font-bold ring-2 ring-paper dark:ring-ink-900">
              {unread}
            </span>
          )}
        </button>

        {bellOpen && (
          <div className="absolute right-0 mt-2 w-80 max-w-[90vw] rounded-xl shadow-pop border border-ink-100 dark:border-ink-700 bg-white dark:bg-ink-800 overflow-hidden">
            <div className="px-4 py-3 border-b border-ink-100 dark:border-ink-700 flex items-center justify-between gap-2">
              <p className="font-heading font-bold text-ink-600 dark:text-white">
                {role === 'teacher' ? 'Waiting for you' : 'Notifications'}
              </p>
              {role === 'student' && unread > 0 ? (
                <button
                  onClick={() => void student.markAllRead()}
                  className="text-xs font-semibold text-ink-500 hover:text-ink-600 dark:text-ink-100"
                >
                  Mark all as read
                </button>
              ) : (
                <span className="text-xs text-ink-300 dark:text-ink-200">{unread} unread</span>
              )}
            </div>
            <ul className="max-h-80 overflow-y-auto no-scrollbar divide-y divide-ink-50 dark:divide-ink-700">
              {rows.length === 0 && (
                <li className="px-4 py-6 text-center text-sm text-ink-300 dark:text-ink-200">
                  You're all caught up.
                </li>
              )}
              {rows.map((n) => (
                <li key={n.id}>
                  <button
                    onClick={() => openRow(n)}
                    className={`w-full text-left px-4 py-3 flex items-start gap-2 min-h-[44px] hover:bg-ink-50 dark:hover:bg-ink-700/50 transition-colors ${
                      n.read ? 'opacity-60' : 'bg-ink-50/40 dark:bg-ink-700/30'
                    }`}
                  >
                    {!n.read && <span className="mt-1.5 w-2 h-2 rounded-full bg-clay-500 shrink-0" />}
                    <div className="min-w-0 flex-1">
                      <p className="font-heading font-semibold text-sm text-ink-600 dark:text-white">{n.title}</p>
                      <p className="text-sm text-ink-400 dark:text-ink-200">{n.body}</p>
                      <p className="text-xs text-ink-300 dark:text-ink-300 mt-1">{n.time}</p>
                    </div>
                    <ChevronRight size={16} className="mt-1 text-ink-300 shrink-0" />
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>

      <button
        onClick={async () => { await signOut(); navigate('/'); }}
        aria-label="Log out"
        className="w-11 h-11 grid place-items-center rounded-xl text-ink-400 hover:bg-clay-50 hover:text-clay-600 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-clay-100 transition-colors min-h-[44px]"
      >
        <LogOut size={20} />
      </button>
    </header>
  );
}

export default TopBar;
