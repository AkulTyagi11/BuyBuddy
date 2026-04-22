import { beforeEach, describe, expect, it, vi } from 'vitest';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { act, render, screen, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ListDetailPage from '../ListDetailPage';
import useGroceryStore from '../../stores/groceryStore';

vi.mock('../../stores/groceryStore', () => ({
  default: vi.fn(),
}));

vi.mock('react-hot-toast', () => ({
  default: {
    success: vi.fn(),
    error: vi.fn(),
  },
}));

class MockSpeechRecognition {
  static instance = null;

  constructor() {
    MockSpeechRecognition.instance = this;
    this.onstart = null;
    this.onend = null;
    this.onerror = null;
    this.onresult = null;
  }

  start() {
    if (this.onstart) {
      this.onstart();
    }
  }

  stop() {
    if (this.onend) {
      this.onend();
    }
  }
}

function renderPage() {
  return render(
    <MemoryRouter initialEntries={['/lists/1']}>
      <Routes>
        <Route path="/lists/:id" element={<ListDetailPage />} />
      </Routes>
    </MemoryRouter>,
  );
}

describe('ListDetailPage voice fallback flow', () => {
  let groceryState;

  beforeEach(() => {
    vi.clearAllMocks();

    window.SpeechRecognition = MockSpeechRecognition;

    groceryState = {
      currentList: {
        id: 1,
        name: 'Weekly List',
        due_date: null,
      },
      items: [
        {
          id: 101,
          name: 'Milk',
          quantity: '1.00',
          unit: 'l',
          category_name: 'Dairy',
          is_purchased: false,
          price: null,
        },
      ],
      categories: [
        { id: 1, name: 'Dairy' },
        { id: 2, name: 'Bakery' },
      ],
      loading: false,
      fetchList: vi.fn().mockResolvedValue({}),
      fetchCategories: vi.fn().mockResolvedValue([]),
      createItem: vi.fn().mockResolvedValue({ id: 999 }),
      updateItem: vi.fn().mockResolvedValue({}),
      deleteItem: vi.fn().mockResolvedValue({}),
      toggleItem: vi.fn().mockResolvedValue({}),
      processVoiceTranscript: vi.fn().mockResolvedValue({
        id: 55,
        transcript: 'random words',
        parsed_items: [],
        confirmed: false,
      }),
      confirmVoiceSession: vi.fn().mockResolvedValue({ status: 'items_added', count: 1 }),
      fetchVoiceSessions: vi.fn().mockResolvedValue([]),
    };

    useGroceryStore.mockImplementation(() => groceryState);
  });

  it('shows retry and manual entry actions when no speech is detected', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Voice Add' }));

    await act(async () => {
      MockSpeechRecognition.instance.onerror({ error: 'no-speech' });
    });

    expect(
      await screen.findByText(/No speech detected. You can retry voice capture or switch to manual entry./i),
    ).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Retry Voice' })).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Manual Entry' })).toBeInTheDocument();
  });

  it('allows manual item entry and confirms without requiring a voice session id', async () => {
    const user = userEvent.setup();
    renderPage();

    await user.click(screen.getByRole('button', { name: 'Voice Add' }));
    await act(async () => {
      MockSpeechRecognition.instance.onerror({ error: 'no-speech' });
    });

    await user.click(await screen.findByRole('button', { name: 'Manual Entry' }));

    const nameInput = await screen.findByLabelText('Name');
    await user.type(nameInput, 'Bread');

    await user.click(screen.getByRole('button', { name: 'Confirm & Add' }));

    await waitFor(() => {
      expect(groceryState.createItem).toHaveBeenCalledWith('1', {
        name: 'Bread',
        quantity: 1,
        unit: 'pcs',
        category: null,
        price: null,
      });
    });

    expect(groceryState.confirmVoiceSession).not.toHaveBeenCalled();
  });
});
