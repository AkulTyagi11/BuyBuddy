import { Trash2 } from 'lucide-react';
import Button from './Button';
import Input from './Input';

export default function VoiceItemEditor({
  item,
  index,
  categories,
  unitOptions,
  onChange,
  onRemove,
}) {
  return (
    <div className="rounded-lg border border-border-default bg-surface-muted p-3">
      <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_1.5fr_auto]">
        <Input
          label="Name"
          value={item.name}
          onChange={(event) => onChange(index, 'name', event.target.value)}
          inputClassName="py-2 text-sm"
        />
        <Input
          label="Qty"
          type="number"
          min="0.01"
          step="0.01"
          value={item.quantity}
          onChange={(event) => onChange(index, 'quantity', event.target.value)}
          inputClassName="py-2 text-sm"
        />
        <label className="block text-sm font-medium text-neutral-dark">
          Unit
          <select
            value={item.unit}
            onChange={(event) => onChange(index, 'unit', event.target.value)}
            className="mt-1 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(123,191,74,0.18)]"
          >
            {unitOptions.map((unitOption) => (
              <option key={unitOption.value} value={unitOption.value}>
                {unitOption.label}
              </option>
            ))}
          </select>
        </label>
        <label className="block text-sm font-medium text-neutral-dark">
          Category
          <select
            value={item.category}
            onChange={(event) => onChange(index, 'category', event.target.value)}
            className="mt-1 w-full rounded-lg border border-border-default bg-surface px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(123,191,74,0.18)]"
          >
            <option value="">No category</option>
            {categories.map((category) => (
              <option key={category.id} value={category.id}>{category.name}</option>
            ))}
          </select>
        </label>
        <div className="flex items-end">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-semantic-error hover:bg-red-50"
            aria-label="Remove voice item"
          >
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  );
}
