import { Loader2, Mic } from 'lucide-react';
import Button from './Button';

export default function VoiceInputButton({
  voiceProcessing,
  voiceListening,
  voiceSupported,
  voiceFallbackReason,
  onVoiceCapture,
  onManualEntry,
}) {
  const label = voiceProcessing
    ? 'Processing...'
    : voiceListening
      ? 'Stop Listening'
      : 'Voice Add';

  const statusText = voiceListening
    ? 'Listening for items...'
    : voiceProcessing
      ? 'Transcribing your list...'
      : voiceSupported
        ? 'Tap to add items by voice.'
        : '';

  return (
    <div>
      <Button
        variant={voiceListening ? 'primary' : 'secondary'}
        onClick={onVoiceCapture}
        disabled={voiceProcessing}
        className={voiceListening ? 'voice-pulse' : ''}
      >
        {voiceProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
        {label}
      </Button>

      {statusText ? (
        <p className="mt-2 text-xs text-text-muted">
          {statusText}
        </p>
      ) : null}

      {voiceFallbackReason ? (
        <div className="mt-3 rounded-lg border border-semantic-warning/30 bg-semantic-warning/10 px-3 py-2 text-xs text-semantic-warning">
          <p>{voiceFallbackReason}</p>
          <div className="mt-2 flex flex-wrap gap-2">
            <Button variant="outline" size="sm" onClick={onVoiceCapture} disabled={voiceProcessing}>
              Retry Voice
            </Button>
            <Button
              variant="secondary"
              size="sm"
              onClick={onManualEntry}
              disabled={voiceProcessing}
            >
              Manual Entry
            </Button>
          </div>
        </div>
      ) : null}

      {!voiceSupported ? (
        <p className="mt-2 text-xs text-semantic-warning">
          Voice input is unavailable in this browser. You can still add items manually.
        </p>
      ) : null}
    </div>
  );
}
