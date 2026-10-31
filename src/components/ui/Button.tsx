import { type ButtonHTMLAttributes, type ReactNode } from 'react';

type Variant = 'primary' | 'secondary' | 'ghost' | 'outline' | 'danger';
type Size = 'sm' | 'md' | 'lg';

type ButtonProps = ButtonHTMLAttributes<HTMLButtonElement> & {
  variant?: Variant;
  size?: Size;
  children: ReactNode;
  fullWidth?: boolean;
};

const variants: Record<Variant, string> = {
  primary:
    'bg-ink-500 text-white hover:bg-ink-600 active:bg-ink-700 shadow-sm',
  secondary:
    'bg-ink-50 text-ink-600 hover:bg-ink-100 dark:bg-ink-700 dark:text-ink-100 dark:hover:bg-ink-600',
  outline:
    'border border-ink-200 text-ink-600 hover:bg-ink-50 dark:border-ink-600 dark:text-ink-100 dark:hover:bg-ink-700',
  ghost:
    'text-ink-600 hover:bg-ink-50 dark:text-ink-100 dark:hover:bg-ink-700',
  danger:
    'bg-clay-500 text-white hover:bg-clay-600 shadow-sm',
};

const sizes: Record<Size, string> = {
  sm: 'h-9 px-3 text-sm rounded-lg gap-1.5',
  md: 'h-11 px-4 text-sm rounded-xl gap-2',
  lg: 'h-12 px-6 text-base rounded-xl gap-2',
};

export function Button({
  variant = 'primary',
  size = 'md',
  children,
  fullWidth,
  className = '',
  ...rest
}: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center font-heading font-semibold transition-all duration-150 focus:outline-none focus-visible:ring-2 focus-visible:ring-ink-300 focus-visible:ring-offset-2 focus-visible:ring-offset-paper dark:focus-visible:ring-offset-ink-900 disabled:opacity-50 disabled:cursor-not-allowed ${variants[variant]} ${sizes[size]} ${fullWidth ? 'w-full' : ''} ${className}`}
      {...rest}
    >
      {children}
    </button>
  );
}

export default Button;
