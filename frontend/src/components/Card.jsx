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
    'relative overflow-hidden rounded-2xl border border-border-default bg-white shadow-[0_1px_3px_rgba(0,0,0,0.1)] transition-all duration-[250ms] ease-[cubic-bezier(0.16,1,0.3,1)]',
    hover ? 'hover:-translate-y-0.5 hover:border-brand-primary-light hover:shadow-[0_10px_15px_rgba(16,185,129,0.1)]' : '',
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
