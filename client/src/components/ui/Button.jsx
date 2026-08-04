/**
 * Button — the single button primitive used everywhere in the app.
 *
 * VARIANTS: primary, secondary, outline, ghost, danger
 * SIZES: sm, md, lg
 *
 * Implements the micro-interaction spec exactly:
 *   - Hover: background darkens ~10% via a CSS filter (brightness), plus
 *     a slightly deeper shadow.
 *   - Active/pressed: scale(0.98) for tactile feedback.
 * Both are plain Tailwind utility classes — no animation library needed.
 *
 * Supports a `loading` prop that swaps in a spinner and disables the
 * button, so every async action button in the app (Confirm Payment,
 * Save Settings, etc.) has one consistent loading treatment.
 */

import { Loader2 } from 'lucide-react';

const VARIANT_CLASSES = {
  primary: 'bg-primary text-white shadow-sm hover:shadow-md hover:brightness-110 focus-visible:ring-primary',
  secondary: 'bg-secondary text-white shadow-sm hover:shadow-md hover:brightness-110 focus-visible:ring-secondary',
  outline:
    'bg-transparent border border-border/80 text-text-primary hover:bg-surface hover:border-primary/40 focus-visible:ring-primary',
  ghost: 'bg-transparent text-text-primary hover:bg-surface focus-visible:ring-primary',
  danger: 'bg-error text-white shadow-sm hover:shadow-md hover:brightness-110 focus-visible:ring-error',
};

const SIZE_CLASSES = {
  sm: 'px-3.5 py-1.5 text-xs font-semibold rounded-lg',
  md: 'px-5 py-2.5 text-sm font-semibold rounded-xl',
  lg: 'px-7 py-3 text-base font-semibold rounded-xl',
};

export function Button({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  disabled = false,
  fullWidth = false,
  icon: Icon,
  iconPosition = 'left',
  className = '',
  type = 'button',
  ...rest
}) {
  const isDisabled = disabled || loading;

  return (
    <button
      type={type}
      disabled={isDisabled}
      className={`
        inline-flex items-center justify-center gap-2 font-medium
        transition-all duration-150 ease-out
        hover:shadow-elevated active:scale-[0.98]
        focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2
        disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:shadow-none disabled:active:scale-100
        ${VARIANT_CLASSES[variant]} ${SIZE_CLASSES[size]} ${fullWidth ? 'w-full' : ''} ${className}
      `}
      {...rest}
    >
      {loading && <Loader2 size={18} className="animate-spin" />}
      {!loading && Icon && iconPosition === 'left' && <Icon size={18} strokeWidth={2} />}
      {children}
      {!loading && Icon && iconPosition === 'right' && <Icon size={18} strokeWidth={2} />}
    </button>
  );
}

export default Button;