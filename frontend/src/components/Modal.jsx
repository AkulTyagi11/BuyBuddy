import { useEffect } from 'react';
import { createPortal } from 'react-dom';

export default function Modal({
  open,
  onClose,
  children,
  closeOnBackdrop = true,
  className = '',
}) {
  useEffect(() => {
    if (!open) return undefined;

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = 'hidden';

    const handleEscape = (event) => {
      if (event.key === 'Escape') {
        onClose?.();
      }
    };

    document.addEventListener('keydown', handleEscape);

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener('keydown', handleEscape);
    };
  }, [open, onClose]);

  if (!open) {
    return null;
  }

  return createPortal(
    <div className={`fixed inset-0 z-[90] flex items-center justify-center bg-neutral-dark/55 p-4 backdrop-blur-[1px] ${className}`} role="dialog" aria-modal="true">
      {closeOnBackdrop ? (
        <button
          type="button"
          className="absolute inset-0"
          onClick={onClose}
          aria-label="Close modal"
        />
      ) : null}
      <div className="relative z-10 w-full">
        {children}
      </div>
    </div>,
    document.body,
  );
}
