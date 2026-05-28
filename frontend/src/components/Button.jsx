import { forwardRef } from 'react';

const baseClasses =
  'inline-flex items-center justify-center gap-2 rounded-xl font-medium transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)] focus-visible:outline-[3px] focus-visible:outline-offset-[3px] active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100';

const variantClasses = {
  primary:
    'bg-brand-primary text-white shadow-[0_8px_20px_rgba(43,36,28,0.18)] hover:bg-brand-primary-hover hover:-translate-y-0.5 hover:shadow-[0_12px_24px_rgba(43,36,28,0.2)] active:translate-y-0 focus-visible:outline-brand-primary/40',
  secondary:
    'bg-surface text-neutral-dark border border-border-default shadow-[0_6px_16px_rgba(43,36,28,0.1)] hover:bg-surface-muted hover:-translate-y-0.5 focus-visible:outline-brand-primary/30',
  outline:
    'bg-transparent text-neutral-dark border border-border-default hover:bg-surface-muted focus-visible:outline-brand-primary/30',
  ghost:
    'bg-transparent text-neutral-dark hover:bg-surface-muted focus-visible:outline-brand-primary/30',
  destructive:
    'bg-semantic-error text-white shadow-[0_8px_18px_rgba(217,91,74,0.25)] hover:bg-red-500 hover:-translate-y-0.5 focus-visible:outline-semantic-error/35',
};

const sizeClasses = {
  sm: 'px-3.5 py-1.5 text-sm',
  md: 'px-4 py-2.5 text-sm',
  lg: 'px-5 py-3 text-base',
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="3" className="opacity-25" />
      <path
        d="M22 12a10 10 0 0 0-10-10"
        stroke="currentColor"
        strokeWidth="3"
        strokeLinecap="round"
        className="opacity-90"
      />
    </svg>
  );
}

const Button = forwardRef(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    disabled = false,
    fullWidth = false,
    className = '',
    children,
    type = 'button',
    ...props
  },
  ref,
) {
  const variantClass = variantClasses[variant] || variantClasses.primary;
  const sizeClass = sizeClasses[size] || sizeClasses.md;

  const classes = [
    baseClasses,
    variantClass,
    sizeClass,
    fullWidth ? 'w-full' : '',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button ref={ref} type={type} className={classes} disabled={disabled || loading} {...props}>
      {loading ? <Spinner /> : null}
      {children}
    </button>
  );
});

export default Button;
