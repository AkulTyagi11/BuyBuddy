import Card from './Card';

export default function CollaborationActivity({ items = [] }) {
  return (
    <Card padding="md" accent>
      <div className="mb-3 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-dark">Recent Activity</h2>
        <span className="text-xs text-text-muted">{items.length} update{items.length === 1 ? '' : 's'}</span>
      </div>

      {items.length === 0 ? (
        <p className="text-sm text-text-muted">No collaboration updates yet.</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 6).map((item) => (
            <div key={item.id} className="rounded-lg border border-border-default bg-surface-muted px-3 py-2 text-sm text-neutral-dark">
              <p className="font-medium">{item.message}</p>
              <p className="mt-1 text-xs text-text-muted">{item.timestamp}</p>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
