import { NavLink } from 'react-router-dom';
import { Logo } from '@/components/Logo';
import { type NavItem } from '@/data/nav';

export function Sidebar({ items, role }: { items: NavItem[]; role: 'student' | 'teacher' }) {
  return (
    <aside className="hidden md:flex flex-col w-60 shrink-0 border-r border-ink-100/70 dark:border-ink-700/60 bg-paper-card dark:bg-ink-900 px-4 py-6">
      <div className="px-2 mb-8">
        <Logo />
      </div>

      <nav className="flex flex-col gap-1">
        <p className="px-3 mb-1 text-xs font-semibold uppercase tracking-wider text-ink-300 dark:text-ink-200">
          {role === 'student' ? 'Student' : 'Teacher'}
        </p>
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.to}
              to={item.to}
              end={item.to === '/student' || item.to === '/teacher'}
              className={({ isActive }) =>
                `flex items-center gap-3 px-3 h-11 rounded-xl text-sm font-heading font-semibold transition-colors min-h-[44px] ${
                  isActive
                    ? 'bg-ink-50 text-ink-600 dark:bg-ink-700 dark:text-white'
                    : 'text-ink-400 hover:bg-ink-50/60 hover:text-ink-600 dark:text-ink-200 dark:hover:bg-ink-800 dark:hover:text-white'
                }`
              }
            >
              <Icon size={20} />
              {item.label}
            </NavLink>
          );
        })}
      </nav>

      <div className="mt-auto px-3 pt-6">
        <div className="rounded-xl bg-leaf-50 dark:bg-ink-800 p-3 text-xs text-leaf-700 dark:text-leaf-100">
          <p className="font-heading font-bold mb-0.5">Need a hand?</p>
          <p className="opacity-80">Tap a subject notebook to review your notes.</p>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;
