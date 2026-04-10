import { createElement } from 'react';

function Skeleton({ className = '', circle = false, as = 'div' }) {
  return createElement(as, {
    'aria-hidden': 'true',
    className: [
      'skeleton block',
      circle ? 'rounded-full' : 'rounded-lg',
      className,
    ]
      .filter(Boolean)
      .join(' '),
  });
}

export default Skeleton;
