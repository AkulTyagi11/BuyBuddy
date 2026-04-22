import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import VoiceItemEditor from '../VoiceItemEditor';

describe('VoiceItemEditor', () => {
  const baseProps = {
    item: {
      name: 'Rice',
      quantity: '2',
      unit: 'kg',
      category: '1',
    },
    index: 0,
    categories: [
      { id: 1, name: 'Grains' },
      { id: 2, name: 'Dairy' },
    ],
    unitOptions: [
      { value: 'pcs', label: 'Pieces' },
      { value: 'kg', label: 'Kg' },
    ],
    onChange: vi.fn(),
    onRemove: vi.fn(),
  };

  it('calls onChange when editing fields', async () => {
    const user = userEvent.setup();
    const onChange = vi.fn();

    render(<VoiceItemEditor {...baseProps} onChange={onChange} />);

    await user.clear(screen.getByLabelText('Name'));
    await user.type(screen.getByLabelText('Name'), 'Milk');

    expect(onChange).toHaveBeenCalled();
  });

  it('calls onRemove for the current row', async () => {
    const user = userEvent.setup();
    const onRemove = vi.fn();

    render(<VoiceItemEditor {...baseProps} onRemove={onRemove} />);

    await user.click(screen.getByRole('button', { name: 'Remove voice item' }));

    expect(onRemove).toHaveBeenCalledWith(0);
  });
});
