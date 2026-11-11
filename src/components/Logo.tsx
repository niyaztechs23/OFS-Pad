import { Link } from 'react-router-dom';

const sizes = {
  sm: { mark: 'w-9 h-9', text: 'text-lg', gap: 'gap-2' },
  md: { mark: 'w-11 h-11', text: 'text-xl', gap: 'gap-2.5' },
  lg: { mark: 'w-16 h-16', text: 'text-3xl', gap: 'gap-3' },
} as const;

/**
 * The compact in-app brand lockup: the crest from the supplied OFS Pad logo,
 * paired with a crisp wordmark so it stays readable at navigation sizes.
 */
export function Logo({
  size = 'md',
  to = '/',
}: {
  size?: 'sm' | 'md' | 'lg';
  to?: string;
}) {
  const dims = sizes[size];
  return (
    <Link to={to} aria-label="OFS Pad home" className={`inline-flex items-center ${dims.gap} group`}>
      <img
        src="/ofs-pad-logo.png"
        alt=""
        className={`${dims.mark} rounded-xl object-cover shadow-soft ring-1 ring-ink-100/80 dark:ring-ink-600 transition-transform group-hover:-rotate-2`}
      />
      <span className={`font-heading font-extrabold tracking-tight text-ink-600 dark:text-white ${dims.text}`}>
        OFS<span className="text-[#F97316]"> Pad</span>
      </span>
    </Link>
  );
}

/** The complete supplied logo tile, for hero and sign-in placements. */
export function LogoFull({ className = 'w-24 h-24' }: { className?: string }) {
  return (
    <img
      src="/ofs-pad-logo.png"
      alt="OFS Pad — Innovate, Transform, Inspire"
      className={`${className} rounded-2xl object-contain shadow-soft ring-1 ring-ink-100/70 dark:ring-ink-600`}
    />
  );
}

/** Crest-only mark for avatars and compact chrome. */
export function LogoMark({ className = 'w-10 h-10' }: { className?: string }) {
  return <img src="/ofs-pad-logo.png" alt="OFS Pad" className={`${className} rounded-xl object-cover`} />;
}

export default Logo;
