import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { describe, expect, it, vi } from 'vitest';
import VoiceHistoryPanel from '../VoiceHistoryPanel';

describe('VoiceHistoryPanel', () => {
  it('shows empty state when there are no sessions', () => {
    render(<VoiceHistoryPanel sessions={[]} loading={false} onReuseSession={vi.fn()} />);

    expect(screen.getByText(/No voice sessions yet/i)).toBeInTheDocument();
  });

  it('renders sessions and calls reuse callback', async () => {
    const user = userEvent.setup();
    const onReuseSession = vi.fn();

    render(
      <VoiceHistoryPanel
        loading={false}
        onReuseSession={onReuseSession}
        sessions={[
          {
            id: 11,
            transcript: '2 kg rice and 1 milk',
            parsed_items: [
              { name: 'Rice', quantity: 2, unit: 'kg', category: 1 },
              { name: 'Milk', quantity: 1, unit: 'l', category: 2 },
            ],
            confirmed: false,
            created_at: '2026-04-15T10:00:00Z',
          },
        ]}
      />,
    );

    expect(screen.getByText(/2 kg rice and 1 milk/i)).toBeInTheDocument();
    expect(screen.getByText(/2 items parsed/i)).toBeInTheDocument();
    expect(screen.getByText(/Pending/i)).toBeInTheDocument();

    await user.click(screen.getByRole('button', { name: /Reuse Items/i }));

    expect(onReuseSession).toHaveBeenCalledTimes(1);
    expect(onReuseSession).toHaveBeenCalledWith(expect.objectContaining({ id: 11 }));
  });
});
