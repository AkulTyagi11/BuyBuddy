import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter } from 'react-router-dom';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import PantryPage from '../PantryPage';
import usePantryStore from '../../stores/pantryStore';
import useGroceryStore from '../../stores/groceryStore';

vi.mock('../../stores/pantryStore', () => ({
  default: vi.fn(),
}));

vi.mock('../../stores/groceryStore', () => ({
  default: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

function renderPantryPage() {
  return render(
    <MemoryRouter>
      <PantryPage />
    </MemoryRouter>,
  );
}

describe('PantryPage integration behavior', () => {
  let pantryState;
  let groceryState;

  beforeEach(() => {
    vi.clearAllMocks();

    pantryState = {
      items: [
        {
          id: 101,
          name: 'Milk',
          quantity: '1.00',
          unit: 'l',
          category: 2,
          category_name: 'Dairy',
          condition: 'stock',
          notes: '',
          days_until_expiry: 2,
          added_date: '2026-04-12T10:00:00Z',
          updated_at: '2026-04-12T10:00:00Z',
        },
        {
          id: 202,
          name: 'Onions',
          quantity: '2.00',
          unit: 'kg',
          category: 1,
          category_name: 'Vegetables',
          condition: 'stock',
          notes: '',
          days_until_expiry: null,
          added_date: '2026-04-10T10:00:00Z',
          updated_at: '2026-04-10T10:00:00Z',
        },
      ],
      loading: false,
      fetchItems: vi.fn().mockResolvedValue([]),
      addItem: vi.fn().mockResolvedValue({ id: 303 }),
      updateItem: vi.fn().mockResolvedValue({}),
      deleteItem: vi.fn().mockResolvedValue({}),
      markLow: vi.fn().mockResolvedValue({}),
      addToList: vi.fn().mockResolvedValue({}),
    };

    groceryState = {
      categories: [
        { id: 1, name: 'Vegetables' },
        { id: 2, name: 'Dairy' },
      ],
      lists: [
        { id: 77, name: 'Weekly List' },
      ],
      fetchCategories: vi.fn().mockResolvedValue([]),
      fetchLists: vi.fn().mockResolvedValue([]),
    };

    usePantryStore.mockImplementation(() => pantryState);
    useGroceryStore.mockImplementation(() => groceryState);
  });

  it('loads pantry dependencies on mount', async () => {
    renderPantryPage();

    await waitFor(() => {
      expect(pantryState.fetchItems).toHaveBeenCalledTimes(1);
      expect(groceryState.fetchCategories).toHaveBeenCalledTimes(1);
      expect(groceryState.fetchLists).toHaveBeenCalledTimes(1);
    });
  });

  it('filters visible pantry cards by search', async () => {
    const user = userEvent.setup();
    renderPantryPage();

    await user.type(screen.getByLabelText('Search'), 'milk');

    expect(screen.getByRole('heading', { name: 'Milk' })).toBeInTheDocument();
    expect(screen.queryByRole('heading', { name: 'Onions' })).not.toBeInTheDocument();
  });

  it('opens add modal from quick add and prefills item name', async () => {
    const user = userEvent.setup();
    renderPantryPage();

    await user.click(screen.getByRole('button', { name: '+ Milk' }));

    expect(screen.getByRole('heading', { name: 'Add Pantry Item' })).toBeInTheDocument();
    const itemNameInput = await screen.findByLabelText(/Item Name/i);
    expect(itemNameInput).toHaveValue('Milk');
  });

  it('submits add pantry item form with normalized payload', async () => {
    const user = userEvent.setup();
    renderPantryPage();

    await user.click(screen.getByRole('button', { name: 'Add Pantry Item' }));

    const itemNameInput = await screen.findByLabelText(/Item Name/i);
    await user.clear(itemNameInput);
    await user.type(itemNameInput, 'Cucumber');
    await user.click(screen.getByRole('button', { name: 'Add to Pantry' }));

    await waitFor(() => {
      expect(pantryState.addItem).toHaveBeenCalledWith({
        name: 'Cucumber',
        quantity: 1,
        unit: 'pcs',
        category: null,
        expiry_date: null,
        condition: 'stock',
        notes: '',
      });
    });
  });

  it('triggers mark-low and add-to-list actions for an item', async () => {
    const user = userEvent.setup();
    pantryState.items = [
      {
        id: 505,
        name: 'Tomatoes',
        quantity: '1.00',
        unit: 'kg',
        category: 1,
        category_name: 'Vegetables',
        condition: 'stock',
        notes: '',
        days_until_expiry: 1,
        added_date: '2026-04-12T10:00:00Z',
        updated_at: '2026-04-12T10:00:00Z',
      },
    ];

    renderPantryPage();

    const listSelect = screen.getByLabelText('Add to list');
    await waitFor(() => expect(listSelect).toHaveValue('77'));

    await user.click(screen.getByRole('button', { name: 'Mark Low' }));
    await user.click(screen.getByRole('button', { name: 'Add to List' }));

    await waitFor(() => {
      expect(pantryState.markLow).toHaveBeenCalledWith(505);
      expect(pantryState.addToList).toHaveBeenCalledWith(505, 77);
    });
  });
});
