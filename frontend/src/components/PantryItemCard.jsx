import { AlertTriangle, CalendarDays, Pencil, PlusCircle, Trash2 } from 'lucide-react';
import Button from './Button';
import Card from './Card';

function getConditionMeta(item) {
  const days = item.days_until_expiry;
  if (typeof days === 'number' && days < 0) {
    return {
      label: 'Expired',
      badgeClass: 'bg-semantic-error/10 text-semantic-error',
      expiryClass: 'text-semantic-error',
    };
  }

  if (item.condition === 'low') {
    return {
      label: 'Running Low',
      badgeClass: 'bg-semantic-warning/10 text-semantic-warning',
      expiryClass: 'text-semantic-warning',
    };
  }

  if (item.condition === 'expired') {
    return {
      label: 'Expired',
      badgeClass: 'bg-semantic-error/10 text-semantic-error',
      expiryClass: 'text-semantic-error',
    };
  }

  return {
    label: 'In Stock',
    badgeClass: 'bg-semantic-success/10 text-semantic-success',
    expiryClass: 'text-text-muted',
  };
}

function getExpiryLabel(daysUntilExpiry) {
  if (daysUntilExpiry === null || daysUntilExpiry === undefined) {
    return 'No expiry date';
  }

  if (daysUntilExpiry < 0) {
    return `Expired ${Math.abs(daysUntilExpiry)} day${Math.abs(daysUntilExpiry) === 1 ? '' : 's'} ago`;
  }

  if (daysUntilExpiry === 0) {
    return 'Expires today';
  }

  if (daysUntilExpiry === 1) {
    return 'Expires tomorrow';
  }

  return `Expires in ${daysUntilExpiry} days`;
}

export default function PantryItemCard({
  item,
  onAddToList,
  onMarkLow,
  onEdit,
  onDelete,
  disableAddToList = false,
}) {
  const conditionMeta = getConditionMeta(item);

  return (
    <Card hover accent className="stagger-enter" padding="none">
      <div className="p-5">
        <div className="mb-3 flex items-start justify-between gap-3">
          <div>
            <h3 className="text-base font-semibold text-neutral-dark">{item.name}</h3>
            <p className="mt-1 text-sm text-text-muted">
              {item.quantity} {item.unit}
              {item.category_name ? ` • ${item.category_name}` : ''}
            </p>
          </div>
          <span className={`inline-flex rounded-full px-2 py-1 text-xs font-medium ${conditionMeta.badgeClass}`}>
            {conditionMeta.label}
          </span>
        </div>

        <div className={`mb-4 flex items-center gap-2 text-sm ${conditionMeta.expiryClass}`}>
          <CalendarDays className="h-4 w-4" />
          <span>{getExpiryLabel(item.days_until_expiry)}</span>
        </div>

        {item.notes ? (
          <p className="mb-4 rounded-lg bg-neutral-light px-3 py-2 text-sm text-text-muted">{item.notes}</p>
        ) : null}

        <div className="flex flex-wrap gap-2">
          <Button size="sm" onClick={onAddToList} disabled={disableAddToList}>
            <PlusCircle className="h-4 w-4" />
            Add to List
          </Button>
          <Button
            size="sm"
            variant="secondary"
            onClick={onMarkLow}
            disabled={item.condition === 'low' || item.condition === 'expired'}
          >
            <AlertTriangle className="h-4 w-4" />
            Mark Low
          </Button>
          <Button size="sm" variant="outline" onClick={onEdit}>
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
          <Button size="sm" variant="ghost" className="text-semantic-error hover:bg-red-50" onClick={onDelete}>
            <Trash2 className="h-4 w-4" />
            Delete
          </Button>
        </div>
      </div>
    </Card>
  );
}
