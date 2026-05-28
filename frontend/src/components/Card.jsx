import { createElement } from 'react';

function Card({
  as = 'div',
  children,
  className = '',
  hover = false,
  accent = false,
  padding = 'md',
  ...props
}) {
  const paddingClasses = {
    none: '',
    sm: 'p-4',
    md: 'p-6',
    lg: 'p-8',
  };

  const classes = [
    'relative overflow-hidden rounded-2xl border border-border-default bg-surface shadow-[0_10px_30px_rgba(43,36,28,0.08)] transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
    hover ? 'hover:-translate-y-0.5 hover:border-brand-primary-light hover:shadow-[0_16px_35px_rgba(43,36,28,0.12)]' : '',
    paddingClasses[padding] || paddingClasses.md,
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return createElement(
    as,
    { className: classes, ...props },
    accent
      ? createElement('div', {
          'aria-hidden': 'true',
          className:
            'pointer-events-none absolute inset-x-0 top-0 h-px bg-linear-to-r from-brand-primary/55 via-brand-primary-light to-transparent',
        })
      : null,
    children,
  );
}

export default Card;
