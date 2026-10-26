import { type ReactNode, type HTMLAttributes } from 'react';

type CardProps = HTMLAttributes<HTMLDivElement> & {
  children: ReactNode;
  padded?: boolean;
  hoverable?: boolean;
};

export function Card({ children, padded = true, hoverable = false, className = '', ...rest }: CardProps) {
  return (
    <div
      className={`bg-white dark:bg-ink-800 rounded-xl shadow-soft border border-ink-100/60 dark:border-ink-700/60 ${
        hoverable ? 'transition-all duration-200 hover:shadow-card hover:-translate-y-0.5' : ''
      } ${padded ? 'p-5' : ''} ${className}`}
      {...rest}
    >
      {children}
    </div>
  );
}

export default Card;
