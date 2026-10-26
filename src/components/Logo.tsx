import { type ReactNode } from 'react';
import { Link } from 'react-router-dom';
import { BookOpenText } from 'lucide-react';

export function Logo({ size = 'md' }: { size?: 'sm' | 'md' | 'lg' }) {
  const dims = {
    sm: { box: 'w-8 h-8', icon: 18, text: 'text-lg' },
    md: { box: 'w-10 h-10', icon: 22, text: 'text-xl' },
    lg: { box: 'w-14 h-14', icon: 30, text: 'text-2xl' },
  }[size];

  return (
    <Link to="/" className="inline-flex items-center gap-2.5 group">
      <span
        className={`${dims.box} rounded-xl bg-ink-500 text-white grid place-items-center shadow-soft transition-transform group-hover:-rotate-3`}
      >
        <BookOpenText size={dims.icon} />
      </span>
      <span className={`font-heading font-extrabold text-ink-600 dark:text-white ${dims.text}`}>
        OFS<span className="text-leaf-500 dark:text-leaf-100"> Pad</span>
      </span>
    </Link>
  );
}

export default Logo;

export function LogoMark({ children }: { children?: ReactNode }) {
  return <span>{children}</span>;
}
