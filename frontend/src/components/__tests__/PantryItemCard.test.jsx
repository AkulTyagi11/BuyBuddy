import { describe, expect, it, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import PantryItemCard from '../PantryItemCard';

const baseItem = {
  id: 42,
  name: 'Milk',
  quantity: '1.00',
  unit: 'l',
  category_name: 'Dairy',
  condition: 'stock',
  notes: '',
  days_until_expiry: 2,
};

describe('PantryItemCard gestures', () => {
  it('triggers onMarkLow on long press', () => {
    vi.useFakeTimers();

    const onMarkLow = vi.fn();
    render(
      <PantryItemCard
        item={baseItem}
        onAddToList={vi.fn()}
        onMarkLow={onMarkLow}
        onEdit={vi.fn()}
        onDelete={vi.fn()}
      />,
    );

    const cardHeading = screen.getByRole('heading', { name: 'Milk' });
    const touchTarget = cardHeading.closest('div');

    fireEvent.touchStart(touchTarget, { touches: [{ clientX: 240, clientY: 80 }] });
    vi.advanceTimersByTime(700);
    fireEvent.touchEnd(touchTarget, { changedTouches: [{ clientX: 240, clientY: 80 }] });

    expect(onMarkLow).toHaveBeenCalledTimes(1);
    vi.useRealTimers();
  });

  it('triggers onDelete when swiped left', () => {
    const onDelete = vi.fn();

    render(
      <PantryItemCard
        item={baseItem}
        onAddToList={vi.fn()}
        onMarkLow={vi.fn()}
        onEdit={vi.fn()}
        onDelete={onDelete}
      />,
    );

    const cardHeading = screen.getByRole('heading', { name: 'Milk' });
    const touchTarget = cardHeading.closest('div');

    fireEvent.touchStart(touchTarget, { touches: [{ clientX: 260, clientY: 80 }] });
    fireEvent.touchEnd(touchTarget, { changedTouches: [{ clientX: 100, clientY: 86 }] });

    expect(onDelete).toHaveBeenCalledTimes(1);
  });
});
