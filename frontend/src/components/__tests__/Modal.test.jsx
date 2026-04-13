import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Modal from '../Modal';

function ModalHarness({ open = true, onClose = vi.fn(), closeOnBackdrop = true }) {
  return (
    <Modal open={open} onClose={onClose} closeOnBackdrop={closeOnBackdrop}>
      <div>Modal Content</div>
    </Modal>
  );
}

describe('Modal', () => {
  it('does not render when closed', () => {
    render(<ModalHarness open={false} />);

    expect(screen.queryByText('Modal Content')).not.toBeInTheDocument();
  });

  it('renders children in a portal and sets dialog semantics', () => {
    render(<ModalHarness open />);

    expect(screen.getByRole('dialog')).toBeInTheDocument();
    expect(screen.getByRole('dialog')).toHaveAttribute('aria-modal', 'true');
    expect(screen.getByText('Modal Content')).toBeInTheDocument();
  });

  it('locks body scroll while open and restores on unmount', () => {
    const { unmount } = render(<ModalHarness open />);
    expect(document.body.style.overflow).toBe('hidden');

    unmount();
    expect(document.body.style.overflow).toBe('');
  });

  it('calls onClose when Escape is pressed', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ModalHarness open onClose={onClose} />);

    await user.keyboard('{Escape}');

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('calls onClose when backdrop is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();
    render(<ModalHarness open onClose={onClose} />);

    await user.click(screen.getByRole('button', { name: 'Close modal' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('does not render backdrop close button when closeOnBackdrop is false', () => {
    render(<ModalHarness open closeOnBackdrop={false} />);

    expect(screen.queryByRole('button', { name: 'Close modal' })).not.toBeInTheDocument();
  });
});
