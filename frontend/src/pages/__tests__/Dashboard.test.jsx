import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Dashboard from '../Dashboard';
import useGroceryStore from '../../stores/groceryStore';
import useAuthStore from '../../stores/authStore';

vi.mock('../../stores/groceryStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../stores/authStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../components/ExpiringItemsAlert', () => ({
  default: () => <div data-testid="expiring-alert" />, 
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderDashboard() {
  return render(
    <MemoryRouter>
      <Dashboard />
    </MemoryRouter>,
  );
}

describe('Dashboard interactions', () => {
  let groceryState;

  beforeEach(() => {
    vi.clearAllMocks();

    groceryState = {
      lists: [
        {
          id: 1,
          name: 'Weekly Groceries',
          item_count: 5,
          purchased_count: 2,
          created_at: '2026-04-12T10:00:00Z',
          updated_at: '2026-04-13T10:00:00Z',
          due_date: '2026-04-20',
        },
      ],
      loading: false,
      fetchLists: vi.fn().mockResolvedValue([]),
      createList: vi.fn().mockResolvedValue({ id: 2, name: 'Created List' }),
      deleteList: vi.fn().mockResolvedValue({}),
    };

    useGroceryStore.mockImplementation(() => groceryState);
    useAuthStore.mockImplementation(() => ({
      user: { username: 'akul', first_name: 'Akul' },
    }));
  });

  it('loads list data on mount', async () => {
    renderDashboard();

    await waitFor(() => {
      expect(groceryState.fetchLists).toHaveBeenCalledTimes(1);
    });
  });

  it('opens and closes create-list modal with backdrop action', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole('button', { name: 'New List' }));
    expect(screen.getByRole('heading', { name: 'Create New List' })).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: 'Close modal' }));
    expect(screen.queryByRole('heading', { name: 'Create New List' })).not.toBeInTheDocument();
  });

  it('submits create-list form with trimmed name', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole('button', { name: 'New List' }));

    const nameInput = await screen.findByLabelText(/List Name/i);
    await user.clear(nameInput);
    await user.type(nameInput, '  Pantry Run  ');

    await user.click(screen.getByRole('button', { name: 'Create' }));

    await waitFor(() => {
      expect(groceryState.createList).toHaveBeenCalledWith({
        name: 'Pantry Run',
        due_date: null,
      });
    });
  });

  it('closes modal on Escape key', async () => {
    const user = userEvent.setup();
    renderDashboard();

    await user.click(screen.getByRole('button', { name: 'New List' }));
    expect(screen.getByRole('heading', { name: 'Create New List' })).toBeInTheDocument();

    await user.keyboard('{Escape}');
    expect(screen.queryByRole('heading', { name: 'Create New List' })).not.toBeInTheDocument();
  });
});
