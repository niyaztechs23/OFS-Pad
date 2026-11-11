import { useState, type ReactNode } from 'react';
import { Eye, EyeOff, Lock } from 'lucide-react';

export function PasswordField({
  label = 'Password',
  value,
  onChange,
  placeholder = '••••••••',
  autoComplete = 'current-password',
  icon,
  hint,
  required = true,
}: {
  label?: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  autoComplete?: string;
  icon?: ReactNode;
  hint?: string;
  required?: boolean;
}) {
  const [visible, setVisible] = useState(false);

  return (
    <label className="block">
      <span className="block text-sm font-semibold text-ink-500 dark:text-ink-100 mb-1.5">{label}</span>
      <span className="relative block">
        <span className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-300 dark:text-ink-300">
          {icon ?? <Lock size={18} />}
        </span>
        <input
          type={visible ? 'text' : 'password'}
          placeholder={placeholder}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          required={required}
          autoComplete={autoComplete}
          className="w-full h-12 pl-11 pr-12 rounded-xl bg-white dark:bg-ink-800 border border-ink-100 dark:border-ink-700 text-ink-600 dark:text-white placeholder:text-ink-300 focus:outline-none focus:border-ink-400 focus:ring-2 focus:ring-ink-100 dark:focus:ring-ink-700 transition-colors"
        />
        <button
          type="button"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? 'Hide password' : 'Show password'}
          aria-pressed={visible}
          title={visible ? 'Hide password' : 'Show password'}
          className="absolute right-1 top-1/2 -translate-y-1/2 w-10 h-10 grid place-items-center rounded-lg text-ink-300 hover:text-ink-600 hover:bg-ink-50 dark:text-ink-200 dark:hover:text-white dark:hover:bg-ink-700 transition-colors"
        >
          {visible ? <EyeOff size={18} /> : <Eye size={18} />}
        </button>
      </span>
      {hint && <span className="block text-xs text-ink-300 dark:text-ink-300 mt-1.5">{hint}</span>}
    </label>
  );
}

export default PasswordField;
