import { describe, expect, it, vi } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import AddPantryItemModal from '../AddPantryItemModal';

describe('AddPantryItemModal', () => {
  const categories = [
    { id: 1, name: 'Vegetables' },
    { id: 2, name: 'Dairy' },
  ];

  it('closes when cancel button is clicked', async () => {
    const user = userEvent.setup();
    const onClose = vi.fn();

    render(
      <AddPantryItemModal
        onClose={onClose}
        onSubmit={vi.fn()}
        categories={categories}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Cancel' }));

    expect(onClose).toHaveBeenCalledTimes(1);
  });

  it('auto-suggests category from item name keywords', async () => {
    const user = userEvent.setup();

    render(
      <AddPantryItemModal
        onClose={vi.fn()}
        onSubmit={vi.fn()}
        categories={categories}
      />,
    );

    const itemNameInput = screen.getByLabelText(/Item Name/i);
    await user.type(itemNameInput, 'onion');

    await waitFor(() => {
      expect(screen.getByLabelText('Category')).toHaveValue('1');
    });
  });

  it('submits normalized payload', async () => {
    const user = userEvent.setup();
    const onSubmit = vi.fn().mockResolvedValue({});

    render(
      <AddPantryItemModal
        onClose={vi.fn()}
        onSubmit={onSubmit}
        categories={categories}
      />,
    );

    const itemNameInput = screen.getByLabelText(/Item Name/i);
    await user.clear(itemNameInput);
    await user.type(itemNameInput, 'Milk');
    await user.click(screen.getByRole('button', { name: 'Add to Pantry' }));

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledWith({
        name: 'Milk',
        quantity: 1,
        unit: 'pcs',
        category: 2,
        expiry_date: null,
        condition: 'stock',
        notes: '',
      });
    });
  });
});
