import { History, CheckCircle2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';

function formatSessionTimestamp(value) {
  if (!value) {
    return 'Unknown time';
  }

  const timestamp = new Date(value);
  if (Number.isNaN(timestamp.getTime())) {
    return 'Unknown time';
  }

  return timestamp.toLocaleString([], {
    month: 'short',
    day: 'numeric',
    hour: 'numeric',
    minute: '2-digit',
  });
}

export default function VoiceHistoryPanel({ sessions = [], loading = false, onReuseSession }) {
  return (
    <Card className="mb-6" padding="md" accent>
      <div className="mb-3 flex items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <History className="h-4 w-4 text-brand-primary" />
          <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-dark">Recent Voice Inputs</h2>
        </div>
        <span className="text-xs text-text-muted">{sessions.length} session{sessions.length === 1 ? '' : 's'}</span>
      </div>

      {loading ? (
        <p className="text-sm text-text-muted">Loading voice history...</p>
      ) : null}

      {!loading && sessions.length === 0 ? (
        <p className="text-sm text-text-muted">No voice sessions yet. Try Voice Add to get started.</p>
      ) : null}

      {!loading && sessions.length > 0 ? (
        <div className="space-y-2">
          {sessions.map((session) => {
            const parsedItems = session.parsed_items || [];
            const itemCount = parsedItems.length;

            return (
              <div key={session.id} className="rounded-lg border border-border-default bg-surface-muted px-3 py-2">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <p className="text-sm font-medium text-neutral-dark">
                    {session.transcript || 'Untitled session'}
                  </p>
                  {session.confirmed ? (
                    <span className="inline-flex items-center gap-1 rounded-full bg-brand-primary-light/70 px-2 py-0.5 text-[11px] font-medium text-brand-primary">
                      <CheckCircle2 className="h-3 w-3" />
                      Confirmed
                    </span>
                  ) : (
                    <span className="rounded-full bg-semantic-warning/15 px-2 py-0.5 text-[11px] font-medium text-semantic-warning">
                      Pending
                    </span>
                  )}
                </div>

                <div className="mt-1 flex flex-wrap items-center justify-between gap-2 text-xs text-text-muted">
                  <span>{itemCount} item{itemCount === 1 ? '' : 's'} parsed</span>
                  <span>{formatSessionTimestamp(session.created_at)}</span>
                </div>

                {itemCount > 0 ? (
                  <div className="mt-2 flex justify-end">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onReuseSession?.(session)}
                    >
                      Reuse Items
                    </Button>
                  </div>
                ) : null}
              </div>
            );
          })}
        </div>
      ) : null}
    </Card>
  );
}
