import { describe, expect, it, vi } from 'vitest';
import { render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import VoiceInputButton from '../VoiceInputButton';

describe('VoiceInputButton', () => {
  it('renders default voice add state', () => {
    render(
      <VoiceInputButton
        voiceProcessing={false}
        voiceListening={false}
        voiceSupported={true}
        voiceFallbackReason=""
        onVoiceCapture={vi.fn()}
        onManualEntry={vi.fn()}
      />,
    );

    expect(screen.getByRole('button', { name: 'Voice Add' })).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: 'Retry Voice' })).not.toBeInTheDocument();
  });

  it('renders fallback actions and calls handlers', async () => {
    const user = userEvent.setup();
    const onVoiceCapture = vi.fn();
    const onManualEntry = vi.fn();

    render(
      <VoiceInputButton
        voiceProcessing={false}
        voiceListening={false}
        voiceSupported={true}
        voiceFallbackReason="No speech detected"
        onVoiceCapture={onVoiceCapture}
        onManualEntry={onManualEntry}
      />,
    );

    await user.click(screen.getByRole('button', { name: 'Retry Voice' }));
    await user.click(screen.getByRole('button', { name: 'Manual Entry' }));

    expect(onVoiceCapture).toHaveBeenCalledTimes(1);
    expect(onManualEntry).toHaveBeenCalledTimes(1);
  });

  it('shows unsupported browser hint', () => {
    render(
      <VoiceInputButton
        voiceProcessing={false}
        voiceListening={false}
        voiceSupported={false}
        voiceFallbackReason=""
        onVoiceCapture={vi.fn()}
        onManualEntry={vi.fn()}
      />,
    );

    expect(screen.getByText(/Voice input is unavailable in this browser/i)).toBeInTheDocument();
  });
});
