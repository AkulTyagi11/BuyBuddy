import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { AlertTriangle, ArrowRight } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import usePantryStore from '../stores/pantryStore';

function renderExpiryText(daysUntilExpiry) {
  if (daysUntilExpiry === null || daysUntilExpiry === undefined) return 'No expiry set';
  if (daysUntilExpiry < 0) return `Expired ${Math.abs(daysUntilExpiry)}d ago`;
  if (daysUntilExpiry === 0) return 'Expires today';
  if (daysUntilExpiry === 1) return 'Expires tomorrow';
  return `Expires in ${daysUntilExpiry}d`;
}

export default function ExpiringItemsAlert() {
  const { expiringItems, alertLoading, fetchExpiringItems } = usePantryStore();

  useEffect(() => {
    fetchExpiringItems();
  }, [fetchExpiringItems]);

  if (alertLoading && expiringItems.length === 0) {
    return (
      <Card className="border-semantic-warning/30 bg-amber-50/40" accent>
        <p className="text-sm text-text-muted">Checking pantry expiry dates...</p>
      </Card>
    );
  }

  if (expiringItems.length === 0) {
    return null;
  }

  return (
    <Card className="border-semantic-warning/35 bg-amber-50/50" accent>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="min-w-0">
          <div className="mb-2 flex items-center gap-2 text-semantic-warning">
            <AlertTriangle className="h-4 w-4" />
            <p className="text-sm font-semibold">
              {expiringItems.length} item{expiringItems.length === 1 ? '' : 's'} expiring soon
            </p>
          </div>
          <ul className="space-y-1 text-sm text-neutral-dark">
            {expiringItems.slice(0, 3).map((item) => (
              <li key={item.id} className="truncate">
                {item.name} • {renderExpiryText(item.days_until_expiry)}
              </li>
            ))}
          </ul>
        </div>

        <Link to="/pantry" className="shrink-0">
          <Button size="sm" variant="secondary">
            Open Pantry
            <ArrowRight className="h-4 w-4" />
          </Button>
        </Link>
      </div>
    </Card>
  );
}
