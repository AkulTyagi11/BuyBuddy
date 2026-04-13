import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Navbar from '../Navbar';
import useAuthStore from '../../stores/authStore';

vi.mock('../../stores/authStore', () => ({
  default: vi.fn(),
}));

function renderNavbar(initialPath = '/dashboard') {
  return render(
    <MemoryRouter initialEntries={[initialPath]}>
      <Navbar />
    </MemoryRouter>,
  );
}

describe('Navbar interactions', () => {
  let logout;

  beforeEach(() => {
    vi.clearAllMocks();
    logout = vi.fn().mockResolvedValue({});

    useAuthStore.mockImplementation(() => ({
      user: { username: 'akul', first_name: 'Akul' },
      logout,
    }));
  });

  it('opens user menu and closes on outside click', async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole('button', { name: /Akul/i }));
    expect(screen.getByRole('menu')).toBeInTheDocument();

    await user.click(document.body);

    await waitFor(() => {
      expect(screen.queryByRole('menu')).not.toBeInTheDocument();
    });
  });

  it('logs out from desktop user menu action', async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole('button', { name: /Akul/i }));
    await user.click(screen.getAllByRole('button', { name: 'Logout' })[0]);

    await waitFor(() => {
      expect(logout).toHaveBeenCalledTimes(1);
    });
  });

  it('opens and closes mobile navigation panel', async () => {
    const user = userEvent.setup();
    renderNavbar();

    await user.click(screen.getByRole('button', { name: 'Open menu' }));
    const openCloseButton = screen
      .getAllByRole('button', { name: 'Close menu' })
      .find((button) => button.getAttribute('aria-expanded') === 'true');
    expect(openCloseButton).toBeDefined();

    await user.click(screen.getByRole('button', { name: 'Close navigation panel' }));

    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Open menu' })).toBeInTheDocument();
    });
  });
});
