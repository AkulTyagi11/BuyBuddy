import Card from './Card';

function getInitials(user) {
  const label = user?.display_name || user?.first_name || user?.username || 'U';
  return label.charAt(0).toUpperCase();
}

export default function CollaboratorsList({ activeUsers = [], collaborators = [] }) {
  const sharedUsers = collaborators.filter((user) => user.role !== 'owner');
  const owner = collaborators.find((user) => user.role === 'owner');

  return (
    <Card padding="md" accent>
      <div className="mb-4 flex items-center justify-between">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-neutral-dark">Collaborators</h2>
        <span className="text-xs text-text-muted">{collaborators.length} member{collaborators.length === 1 ? '' : 's'}</span>
      </div>

      <div className="mb-4">
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Active now</p>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {activeUsers.length === 0 ? (
            <span className="text-sm text-text-muted">No one else is active.</span>
          ) : (
            activeUsers.map((user) => (
              <span
                key={user.id}
                className="inline-flex items-center gap-2 rounded-full border border-border-default bg-surface-muted px-3 py-1 text-xs font-semibold text-neutral-dark"
              >
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-primary-light text-[11px] font-semibold text-brand-primary">
                  {getInitials(user)}
                </span>
                {user.display_name || user.username}
              </span>
            ))
          )}
        </div>
      </div>

      <div>
        <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Shared with</p>
        <div className="mt-2 space-y-2">
          {owner ? (
            <div className="flex items-center justify-between rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-neutral-dark">
              <span>{owner.display_name || owner.username}</span>
              <span className="text-xs font-semibold text-text-muted">Owner</span>
            </div>
          ) : null}
          {sharedUsers.length === 0 ? (
            <p className="text-sm text-text-muted">Invite someone to collaborate.</p>
          ) : (
            sharedUsers.map((user) => (
              <div key={user.id} className="flex items-center justify-between rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-neutral-dark">
                <span>{user.display_name || user.username}</span>
                <span className="text-xs text-text-muted">Collaborator</span>
              </div>
            ))
          )}
        </div>
      </div>
    </Card>
  );
}
