import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Trash2, Check, Pencil, ShoppingBasket,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useGroceryStore from '../stores/groceryStore';
import Button from '../components/Button';
import Input from '../components/Input';

const UNIT_OPTIONS = [
    { value: 'pcs', label: 'Pieces' },
    { value: 'kg', label: 'Kg' },
    { value: 'g', label: 'Grams' },
    { value: 'l', label: 'Liters' },
    { value: 'ml', label: 'mL' },
    { value: 'dozen', label: 'Dozen' },
    { value: 'pack', label: 'Pack' },
    { value: 'bottle', label: 'Bottle' },
    { value: 'can', label: 'Can' },
    { value: 'bag', label: 'Bag' },
];

function ItemForm({ onSubmit, submitLabel, form, setForm, categories, onCancel }) {
    return (
        <form onSubmit={onSubmit} className="bg-white rounded-xl border border-gray-200 p-4 mb-4">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-3">
                <Input
                    label="Item Name"
                    type="text"
                    placeholder="Item name"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    required
                    autoFocus
                    clearable
                    inputClassName="py-2 text-sm"
                />
                <div className="flex gap-2">
                    <Input
                        label="Quantity"
                        type="number"
                        placeholder="Qty"
                        value={form.quantity}
                        onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                        min="0.01"
                        step="0.01"
                        inputClassName="w-20 py-2 text-sm"
                    />
                    <select
                        value={form.unit}
                        onChange={(e) => setForm({ ...form, unit: e.target.value })}
                        className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                    >
                        {UNIT_OPTIONS.map((u) => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                    </select>
                </div>
                <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 outline-none text-sm"
                >
                    <option value="">No category</option>
                    {categories.map((c) => (
                        <option key={c.id} value={c.id}>{c.name}</option>
                    ))}
                </select>
                <Input
                    label="Price"
                    type="number"
                    placeholder="Price (optional)"
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: e.target.value })}
                    min="0"
                    step="0.01"
                    inputClassName="py-2 text-sm"
                />
            </div>
            <div className="flex gap-2 justify-end">
                <Button
                    type="button"
                    variant="secondary"
                    size="sm"
                    onClick={onCancel}
                >
                    Cancel
                </Button>
                <Button
                    type="submit"
                    size="sm"
                >
                    {submitLabel}
                </Button>
            </div>
        </form>
    );
}

function ItemRow({ item, onToggle, onEdit, onDelete }) {
    return (
        <div
            className={`flex items-center gap-3 px-4 py-3 border-b border-gray-100 hover:bg-gray-50 transition group ${item.is_purchased ? 'bg-gray-50/50' : ''
                }`}
        >
            <button
                onClick={() => onToggle(item.id)}
                className={`shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${item.is_purchased
                        ? 'bg-emerald-500 border-emerald-500 text-white'
                        : 'border-gray-300 hover:border-emerald-400'
                    }`}
            >
                {item.is_purchased && <Check className="w-3 h-3" />}
            </button>

            <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${item.is_purchased ? 'line-through text-gray-400' : 'text-gray-900'}`}>
                    {item.name}
                </span>
                <span className="text-xs text-gray-400 ml-2">
                    {item.quantity} {item.unit}
                    {item.category_name && ` · ${item.category_name}`}
                    {item.price && ` · $${item.price}`}
                </span>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                {!item.is_purchased && (
                    <button
                        onClick={() => onEdit(item)}
                        className="p-1 text-gray-400 hover:text-blue-500 transition"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                )}
                <button
                    onClick={() => onDelete(item.id)}
                    className="p-1 text-gray-400 hover:text-red-500 transition"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

export default function ListDetailPage() {
    const { id } = useParams();
    const navigate = useNavigate();
    const {
        currentList, items, categories, loading,
        fetchList, fetchCategories,
        createItem, updateItem, deleteItem, toggleItem,
    } = useGroceryStore();

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        name: '', quantity: '1', unit: 'pcs', category: '', price: '',
    });

    useEffect(() => {
        fetchList(id);
        fetchCategories();
    }, [id, fetchList, fetchCategories]);

    const resetForm = () => {
        setForm({ name: '', quantity: '1', unit: 'pcs', category: '', price: '' });
        setShowAddForm(false);
        setEditingId(null);
    };

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!form.name.trim()) return;
        try {
            await createItem(id, {
                name: form.name.trim(),
                quantity: form.quantity,
                unit: form.unit,
                category: form.category || null,
                price: form.price || null,
            });
            resetForm();
            toast.success('Item added!');
        } catch {
            toast.error('Failed to add item.');
        }
    };

    const handleEdit = (item) => {
        setEditingId(item.id);
        setForm({
            name: item.name,
            quantity: String(item.quantity),
            unit: item.unit,
            category: item.category || '',
            price: item.price || '',
        });
        setShowAddForm(false);
    };

    const handleUpdate = async (e) => {
        e.preventDefault();
        try {
            await updateItem(editingId, {
                name: form.name.trim(),
                quantity: form.quantity,
                unit: form.unit,
                category: form.category || null,
                price: form.price || null,
                grocery_list: Number(id),
            });
            resetForm();
            toast.success('Item updated!');
        } catch {
            toast.error('Failed to update item.');
        }
    };

    const handleDelete = async (itemId) => {
        try {
            await deleteItem(itemId);
            toast.success('Item removed.');
        } catch {
            toast.error('Failed to delete item.');
        }
    };

    const handleToggle = async (itemId) => {
        try {
            await toggleItem(itemId);
        } catch {
            toast.error('Failed to toggle item.');
        }
    };

    if (loading && !currentList) {
        return <div className="text-center py-20 text-gray-400">Loading...</div>;
    }

    if (!currentList) {
        return <div className="text-center py-20 text-gray-500">List not found.</div>;
    }

    const unpurchased = items.filter((i) => !i.is_purchased);
    const purchased = items.filter((i) => i.is_purchased);

    const progress = items.length > 0
        ? Math.round((purchased.length / items.length) * 100)
        : 0;

    // Group by category
    const grouped = {};
    unpurchased.forEach((item) => {
        const cat = item.category_name || 'Uncategorized';
        if (!grouped[cat]) grouped[cat] = [];
        grouped[cat].push(item);
    });

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1 text-sm text-gray-500 hover:text-gray-700 mb-3 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to lists
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">{currentList.name}</h1>
                        <p className="text-sm text-gray-500 mt-1">
                            {items.length} item{items.length !== 1 ? 's' : ''} · {progress}% complete
                            {currentList.due_date && ` · Due ${new Date(currentList.due_date).toLocaleDateString()}`}
                        </p>
                    </div>
                    <Button
                        onClick={() => {
                            resetForm();
                            setShowAddForm(true);
                        }}
                    >
                        <Plus className="w-4 h-4" />
                        Add Item
                    </Button>
                </div>

                {/* Progress bar */}
                <div className="mt-4 w-full bg-gray-100 rounded-full h-2.5">
                    <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && <ItemForm onSubmit={handleAdd} submitLabel="Add Item" form={form} setForm={setForm} categories={categories} onCancel={resetForm} />}
            {editingId && <ItemForm onSubmit={handleUpdate} submitLabel="Update Item" form={form} setForm={setForm} categories={categories} onCancel={resetForm} />}

            {/* Items */}
            {items.length === 0 ? (
                <div className="text-center py-16">
                    <ShoppingBasket className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                    <p className="text-gray-500">No items yet. Add your first item!</p>
                </div>
            ) : (
                <div className="space-y-6">
                    {/* Unpurchased - grouped by category */}
                    {Object.entries(grouped).map(([category, categoryItems]) => (
                        <div key={category} className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{category}</h3>
                            </div>
                            {categoryItems.map((item) => (
                                <ItemRow key={item.id} item={item} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />
                            ))}
                        </div>
                    ))}

                    {/* Purchased items */}
                    {purchased.length > 0 && (
                        <div className="bg-white rounded-xl border border-gray-200 overflow-hidden">
                            <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100">
                                <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                                    Purchased ({purchased.length})
                                </h3>
                            </div>
                            {purchased.map((item) => (
                                <ItemRow key={item.id} item={item} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />
                            ))}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
}
