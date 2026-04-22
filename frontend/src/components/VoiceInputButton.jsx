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
  return (
    <div>
      <Button
        variant="secondary"
        onClick={onVoiceCapture}
        disabled={voiceProcessing}
      >
        {voiceProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
        {voiceListening ? 'Stop Listening' : 'Voice Add'}
      </Button>

      {voiceFallbackReason ? (
        <div className="mt-3 rounded-lg border border-amber-200 bg-amber-50 px-3 py-2 text-xs text-amber-800">
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
        <p className="mt-2 text-xs text-amber-700">
          Voice input is unavailable in this browser. You can still add items manually.
        </p>
      ) : null}
    </div>
  );
}
