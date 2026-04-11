import { useState } from 'react';
import { Plus, Save, X } from 'lucide-react';
import Button from './Button';
import Card from './Card';
import Input from './Input';

const UNIT_OPTIONS = [
  { value: 'pcs', label: 'Pieces' },
  { value: 'kg', label: 'Kilograms' },
  { value: 'g', label: 'Grams' },
  { value: 'l', label: 'Liters' },
  { value: 'ml', label: 'Milliliters' },
  { value: 'dozen', label: 'Dozen' },
  { value: 'pack', label: 'Pack' },
  { value: 'bottle', label: 'Bottle' },
  { value: 'can', label: 'Can' },
  { value: 'bag', label: 'Bag' },
];

const CONDITION_OPTIONS = [
  { value: 'stock', label: 'In Stock' },
  { value: 'low', label: 'Running Low' },
  { value: 'expired', label: 'Expired' },
];

const defaultForm = {
  name: '',
  quantity: '1',
  unit: 'pcs',
  category: '',
  expiry_date: '',
  condition: 'stock',
  notes: '',
};

function toFormState(initialValues) {
  if (!initialValues) {
    return defaultForm;
  }

  return {
    name: initialValues.name || '',
    quantity: String(initialValues.quantity ?? '1'),
    unit: initialValues.unit || 'pcs',
    category: initialValues.category ? String(initialValues.category) : '',
    expiry_date: initialValues.expiry_date || '',
    condition: initialValues.condition || 'stock',
    notes: initialValues.notes || '',
  };
}

export default function AddPantryItemModal({
  onClose,
  onSubmit,
  categories = [],
  initialValues = null,
  loading = false,
}) {
  const [formData, setFormData] = useState(() => toFormState(initialValues));

  const isEditing = Boolean(initialValues?.id);

  const title = isEditing ? 'Edit Pantry Item' : 'Add Pantry Item';

  const handleChange = (key, value) => {
    setFormData((current) => ({ ...current, [key]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!formData.name.trim()) return;

    const payload = {
      name: formData.name.trim(),
      quantity: Number(formData.quantity) || 1,
      unit: formData.unit,
      category: formData.category ? Number(formData.category) : null,
      expiry_date: formData.expiry_date || null,
      condition: formData.condition,
      notes: formData.notes.trim(),
    };

    await onSubmit(payload);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-neutral-dark/40 p-4">
      <Card className="modal-enter w-full max-w-lg" accent>
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-neutral-dark">{title}</h2>
          <Button variant="ghost" size="sm" className="!p-2" onClick={onClose} aria-label="Close modal">
            <X className="h-4 w-4" />
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <Input
            label="Item Name"
            value={formData.name}
            onChange={(event) => handleChange('name', event.target.value)}
            placeholder="e.g., Olive Oil"
            required
            clearable
            autoFocus
          />

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Quantity"
              type="number"
              min="0"
              step="0.01"
              value={formData.quantity}
              onChange={(event) => handleChange('quantity', event.target.value)}
              required
            />

            <div>
              <label htmlFor="pantry-unit" className="mb-1 block text-sm font-medium text-neutral-dark">Unit</label>
              <select
                id="pantry-unit"
                value={formData.unit}
                onChange={(event) => handleChange('unit', event.target.value)}
                className="h-[42px] w-full rounded-lg border border-border-default bg-white px-3 text-sm text-neutral-dark outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
              >
                {UNIT_OPTIONS.map((unit) => (
                  <option key={unit.value} value={unit.value}>{unit.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <div>
              <label htmlFor="pantry-category" className="mb-1 block text-sm font-medium text-neutral-dark">Category</label>
              <select
                id="pantry-category"
                value={formData.category}
                onChange={(event) => handleChange('category', event.target.value)}
                className="h-[42px] w-full rounded-lg border border-border-default bg-white px-3 text-sm text-neutral-dark outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
              >
                <option value="">Uncategorized</option>
                {categories.map((category) => (
                  <option key={category.id} value={String(category.id)}>{category.name}</option>
                ))}
              </select>
            </div>

            <Input
              label="Expiry Date"
              type="date"
              value={formData.expiry_date}
              onChange={(event) => handleChange('expiry_date', event.target.value)}
            />
          </div>

          <div>
            <label htmlFor="pantry-condition" className="mb-1 block text-sm font-medium text-neutral-dark">Condition</label>
            <select
              id="pantry-condition"
              value={formData.condition}
              onChange={(event) => handleChange('condition', event.target.value)}
              className="h-[42px] w-full rounded-lg border border-border-default bg-white px-3 text-sm text-neutral-dark outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
            >
              {CONDITION_OPTIONS.map((condition) => (
                <option key={condition.value} value={condition.value}>{condition.label}</option>
              ))}
            </select>
          </div>

          <Input
            label="Notes"
            value={formData.notes}
            onChange={(event) => handleChange('notes', event.target.value)}
            placeholder="Optional notes"
          />

          <div className="flex justify-end gap-3 pt-2">
            <Button type="button" variant="secondary" size="sm" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" size="sm" loading={loading}>
              {isEditing ? <Save className="h-4 w-4" /> : <Plus className="h-4 w-4" />}
              {isEditing ? 'Save Changes' : 'Add to Pantry'}
            </Button>
          </div>
        </form>
      </Card>
    </div>
  );
}
