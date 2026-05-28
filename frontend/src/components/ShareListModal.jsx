import { useMemo, useState } from 'react';
import { UserPlus, X } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import Input from './Input';
import Modal from './Modal';

export default function ShareListModal({
  open,
  onClose,
  collaborators = [],
  canManage = false,
  onShare,
  onUnshare,
  loading = false,
}) {
  const [username, setUsername] = useState('');

  const sharedUsers = useMemo(
    () => collaborators.filter((user) => user.role !== 'owner'),
    [collaborators],
  );

  const handleShare = async (event) => {
    event.preventDefault();
    if (!username.trim()) {
      return;
    }
    await onShare?.(username.trim());
    setUsername('');
  };

  return (
    <Modal open={open} onClose={onClose}>
      <Card className="modal-enter mx-auto w-full max-w-lg" accent>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-dark font-heading">Share List</h2>
          <Button variant="ghost" size="sm" className="p-2!" onClick={onClose} aria-label="Close share modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        {!canManage ? (
          <p className="mb-4 rounded-lg border border-border-default bg-surface-muted px-3 py-2 text-sm text-text-muted">
            Only the list owner can add or remove collaborators.
          </p>
        ) : null}

        <form onSubmit={handleShare} className="space-y-3">
          <Input
            label="Invite by username"
            value={username}
            onChange={(event) => setUsername(event.target.value)}
            placeholder="Enter a username"
            disabled={!canManage}
            clearable
          />
          <Button type="submit" disabled={!canManage} loading={loading} fullWidth>
            <UserPlus className="h-4 w-4" />
            Send Invite
          </Button>
        </form>

        <div className="mt-6">
          <h3 className="text-sm font-semibold text-neutral-dark">Current collaborators</h3>
          {sharedUsers.length === 0 ? (
            <p className="mt-2 text-sm text-text-muted">No collaborators yet.</p>
          ) : (
            <div className="mt-3 space-y-2">
              {sharedUsers.map((user) => (
                <div key={user.id} className="flex items-center justify-between rounded-lg border border-border-default bg-surface px-3 py-2 text-sm text-neutral-dark">
                  <span>{user.display_name || user.username}</span>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="text-semantic-error hover:bg-red-50"
                    onClick={() => onUnshare?.(user.username)}
                    disabled={!canManage}
                  >
                    Remove
                  </Button>
                </div>
              ))}
            </div>
          )}
        </div>
      </Card>
    </Modal>
  );
}
