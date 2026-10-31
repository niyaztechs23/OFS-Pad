import { NavLink } from 'react-router-dom';
import { type NavItem } from '@/data/nav';

export function BottomTabBar({ items }: { items: NavItem[] }) {
  return (
    <nav className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-paper-card dark:bg-ink-900 border-t border-ink-100 dark:border-ink-700 px-2 pt-1.5 pb-[max(0.5rem,env(safe-area-inset-bottom))]">
      <ul className="flex items-stretch justify-around">
        {items.map((item) => {
          const Icon = item.icon;
          return (
            <li key={item.to} className="flex-1">
              <NavLink
                to={item.to}
                end={item.to === '/student' || item.to === '/teacher'}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center gap-0.5 h-14 rounded-lg text-[10px] font-heading font-semibold transition-colors min-h-[44px] ${
                    isActive
                      ? 'text-ink-500 dark:text-white'
                      : 'text-ink-300 dark:text-ink-200'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon size={22} strokeWidth={isActive ? 2.4 : 2} />
                    <span>{item.label}</span>
                  </>
                )}
              </NavLink>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}

export default BottomTabBar;
