import { useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Trash2, Check, Pencil, ShoppingBasket, Mic, Loader2, X,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useGroceryStore from '../stores/groceryStore';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';

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

function normalizeVoiceItems(rawItems = []) {
    return rawItems.map((item) => ({
        name: item.name || '',
        quantity: String(item.quantity ?? 1),
        unit: item.unit || 'pcs',
        category: item.category ? String(item.category) : '',
    }));
}

function ItemForm({ onSubmit, submitLabel, form, setForm, categories, onCancel }) {
    return (
        <Card as="form" onSubmit={onSubmit} className="mb-4" padding="sm" accent>
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
        </Card>
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
                className={`icon-button-motion shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${item.is_purchased
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
                        className="icon-button-motion rounded p-1 text-gray-400 hover:bg-blue-50 hover:text-blue-500"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                )}
                <button
                    onClick={() => onDelete(item.id)}
                    className="icon-button-motion rounded p-1 text-gray-400 hover:bg-red-50 hover:text-red-500"
                >
                    <Trash2 className="w-3.5 h-3.5" />
                </button>
            </div>
        </div>
    );
}

function ListDetailSkeleton() {
    return (
        <div>
            <div className="mb-6">
                <Skeleton className="mb-3 h-4 w-28" />
                <div className="flex items-center justify-between gap-4">
                    <div className="flex-1">
                        <Skeleton className="h-8 w-60 max-w-full" />
                        <Skeleton className="mt-2 h-4 w-72 max-w-full" />
                    </div>
                    <Skeleton className="h-10 w-28" />
                </div>
                <Skeleton className="mt-4 h-2.5 w-full rounded-full" />
            </div>

            <div className="space-y-6">
                {Array.from({ length: 2 }).map((_, sectionIndex) => (
                    <Card key={`detail-skeleton-section-${sectionIndex}`} className="overflow-hidden" padding="none" accent>
                        <div className="border-b border-gray-200 bg-gray-50 px-4 py-2">
                            <Skeleton className="h-3 w-28" />
                        </div>
                        {Array.from({ length: 4 }).map((__, rowIndex) => (
                            <div
                                key={`detail-skeleton-row-${sectionIndex}-${rowIndex}`}
                                className="flex items-center gap-3 border-b border-gray-100 px-4 py-3 last:border-b-0"
                            >
                                <Skeleton className="h-5 w-5" circle />
                                <div className="flex-1">
                                    <Skeleton className="h-4 w-40 max-w-full" />
                                    <Skeleton className="mt-2 h-3 w-56 max-w-full" />
                                </div>
                                <Skeleton className="h-4 w-8" />
                            </div>
                        ))}
                    </Card>
                ))}
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
        processVoiceTranscript, confirmVoiceSession,
    } = useGroceryStore();

    const [showAddForm, setShowAddForm] = useState(false);
    const [editingId, setEditingId] = useState(null);
    const [form, setForm] = useState({
        name: '', quantity: '1', unit: 'pcs', category: '', price: '',
    });
    const [voiceSupported, setVoiceSupported] = useState(false);
    const [voiceListening, setVoiceListening] = useState(false);
    const [voiceProcessing, setVoiceProcessing] = useState(false);
    const [voiceModalOpen, setVoiceModalOpen] = useState(false);
    const [voiceSessionId, setVoiceSessionId] = useState(null);
    const [voiceTranscript, setVoiceTranscript] = useState('');
    const [voiceItems, setVoiceItems] = useState([]);
    const recognitionRef = useRef(null);

    useEffect(() => {
        fetchList(id);
        fetchCategories();
    }, [id, fetchList, fetchCategories]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setVoiceSupported(Boolean(SpeechRecognition));

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

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

    const resetVoiceModal = () => {
        setVoiceModalOpen(false);
        setVoiceSessionId(null);
        setVoiceTranscript('');
        setVoiceItems([]);
    };

    const handleVoiceCapture = () => {
        if (!voiceSupported) {
            toast.error('Voice capture is not supported in this browser.');
            return;
        }

        if (voiceListening && recognitionRef.current) {
            recognitionRef.current.stop();
            return;
        }

        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            toast.error('Voice capture is not supported in this browser.');
            return;
        }

        const recognition = new SpeechRecognition();
        recognition.lang = 'en-US';
        recognition.continuous = false;
        recognition.interimResults = false;
        recognition.maxAlternatives = 1;

        recognition.onstart = () => {
            setVoiceListening(true);
        };

        recognition.onerror = (event) => {
            if (event.error === 'no-speech') {
                toast.error('No speech detected. Please try again.');
                return;
            }
            if (event.error === 'not-allowed') {
                toast.error('Microphone permission was denied.');
                return;
            }
            toast.error('Voice capture failed. Please try again.');
        };

        recognition.onresult = async (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0]?.transcript || '')
                .join(' ')
                .trim();

            if (!transcript) {
                toast.error('Could not recognize any grocery items.');
                return;
            }

            setVoiceProcessing(true);
            try {
                const session = await processVoiceTranscript({
                    transcript,
                    listId: Number(id),
                });

                const parsedItems = normalizeVoiceItems(session.parsed_items || []);
                if (parsedItems.length === 0) {
                    toast.error('No grocery items were recognized.');
                    return;
                }

                setVoiceSessionId(session.id);
                setVoiceTranscript(session.transcript || transcript);
                setVoiceItems(parsedItems);
                setVoiceModalOpen(true);
                toast.success('Review and confirm voice items.');
            } catch {
                toast.error('Failed to process voice input.');
            } finally {
                setVoiceProcessing(false);
            }
        };

        recognition.onend = () => {
            setVoiceListening(false);
            recognitionRef.current = null;
        };

        recognitionRef.current = recognition;
        recognition.start();
    };

    const handleVoiceItemChange = (index, field, value) => {
        setVoiceItems((prevItems) => prevItems.map((item, itemIndex) => {
            if (itemIndex !== index) {
                return item;
            }
            return {
                ...item,
                [field]: value,
            };
        }));
    };

    const handleVoiceItemRemove = (index) => {
        setVoiceItems((prevItems) => prevItems.filter((_, itemIndex) => itemIndex !== index));
    };

    const handleVoiceItemAdd = () => {
        setVoiceItems((prevItems) => ([
            ...prevItems,
            {
                name: '',
                quantity: '1',
                unit: 'pcs',
                category: '',
            },
        ]));
    };

    const handleVoiceConfirm = async () => {
        if (!voiceSessionId) {
            toast.error('No voice session selected.');
            return;
        }

        const sanitizedItems = voiceItems
            .map((item) => ({
                name: item.name.trim(),
                quantity: Number(item.quantity) > 0 ? Number(item.quantity) : 1,
                unit: item.unit || 'pcs',
                category: item.category ? Number(item.category) : null,
            }))
            .filter((item) => item.name);

        if (sanitizedItems.length === 0) {
            toast.error('Add at least one valid item to continue.');
            return;
        }

        setVoiceProcessing(true);
        try {
            const result = await confirmVoiceSession({
                sessionId: voiceSessionId,
                listId: Number(id),
                items: sanitizedItems,
            });
            await fetchList(id);
            resetVoiceModal();

            const count = result?.count ?? sanitizedItems.length;
            toast.success(`Added ${count} item${count === 1 ? '' : 's'} from voice.`);
        } catch {
            toast.error('Failed to confirm voice items.');
        } finally {
            setVoiceProcessing(false);
        }
    };

    if (loading && !currentList) {
        return <ListDetailSkeleton />;
    }

    if (!currentList) {
        return (
            <EmptyState
                icon={ShoppingBasket}
                title="List not found"
                description="This list may have been deleted or you may not have access to it."
                action={(
                    <Button variant="secondary" onClick={() => navigate('/dashboard')}>
                        <ArrowLeft className="h-4 w-4" />
                        Back to dashboard
                    </Button>
                )}
            />
        );
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
                    <div className="flex items-center gap-2">
                        <Button
                            variant="secondary"
                            onClick={handleVoiceCapture}
                            disabled={voiceProcessing}
                        >
                            {voiceProcessing ? <Loader2 className="h-4 w-4 animate-spin" /> : <Mic className="h-4 w-4" />}
                            {voiceListening ? 'Stop Listening' : 'Voice Add'}
                        </Button>
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
                </div>
                {!voiceSupported && (
                    <p className="mt-2 text-xs text-amber-700">
                        Voice input is unavailable in this browser. You can still add items manually.
                    </p>
                )}

                {/* Progress bar */}
                <div className="mt-4 w-full bg-gray-100 rounded-full h-2.5">
                    <div
                        className="bg-emerald-500 h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            {/* Add/Edit Form */}
            {showAddForm && (
                <div className="modal-enter">
                    <ItemForm onSubmit={handleAdd} submitLabel="Add Item" form={form} setForm={setForm} categories={categories} onCancel={resetForm} />
                </div>
            )}
            {editingId && (
                <div className="modal-enter">
                    <ItemForm onSubmit={handleUpdate} submitLabel="Update Item" form={form} setForm={setForm} categories={categories} onCancel={resetForm} />
                </div>
            )}

            <Modal
                open={voiceModalOpen}
                onClose={() => {
                    if (!voiceProcessing) {
                        resetVoiceModal();
                    }
                }}
            >
                <Card className="mx-auto max-w-3xl" padding="md" accent>
                    <div className="mb-4 flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-lg font-semibold text-gray-900">Review Voice Items</h2>
                            <p className="mt-1 text-xs text-gray-500">
                                {voiceTranscript ? `"${voiceTranscript}"` : 'Update recognized items before confirming.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={resetVoiceModal}
                            className="rounded p-1 text-gray-400 transition hover:bg-gray-100 hover:text-gray-600"
                            aria-label="Close voice review"
                            disabled={voiceProcessing}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                        {voiceItems.map((item, index) => (
                            <div key={`voice-item-${index}`} className="rounded-lg border border-gray-200 bg-gray-50 p-3">
                                <div className="grid grid-cols-1 gap-2 sm:grid-cols-[2fr_1fr_1fr_1.5fr_auto]">
                                    <Input
                                        label="Name"
                                        value={item.name}
                                        onChange={(event) => handleVoiceItemChange(index, 'name', event.target.value)}
                                        inputClassName="py-2 text-sm"
                                    />
                                    <Input
                                        label="Qty"
                                        type="number"
                                        min="0.01"
                                        step="0.01"
                                        value={item.quantity}
                                        onChange={(event) => handleVoiceItemChange(index, 'quantity', event.target.value)}
                                        inputClassName="py-2 text-sm"
                                    />
                                    <label className="block text-sm font-medium text-neutral-dark">
                                        Unit
                                        <select
                                            value={item.unit}
                                            onChange={(event) => handleVoiceItemChange(index, 'unit', event.target.value)}
                                            className="mt-1 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
                                        >
                                            {UNIT_OPTIONS.map((unitOption) => (
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
                                            onChange={(event) => handleVoiceItemChange(index, 'category', event.target.value)}
                                            className="mt-1 w-full rounded-lg border border-border-default bg-white px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
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
                                            onClick={() => handleVoiceItemRemove(index)}
                                            className="text-semantic-error hover:bg-red-50"
                                            aria-label="Remove voice item"
                                        >
                                            <Trash2 className="h-4 w-4" />
                                        </Button>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    <div className="mt-4 flex flex-wrap items-center justify-between gap-2">
                        <Button variant="outline" size="sm" onClick={handleVoiceItemAdd} disabled={voiceProcessing}>
                            <Plus className="h-4 w-4" />
                            Add Row
                        </Button>

                        <div className="flex items-center gap-2">
                            <Button variant="secondary" size="sm" onClick={resetVoiceModal} disabled={voiceProcessing}>
                                Cancel
                            </Button>
                            <Button size="sm" onClick={handleVoiceConfirm} loading={voiceProcessing}>
                                Confirm & Add
                            </Button>
                        </div>
                    </div>
                </Card>
            </Modal>

            {/* Items */}
            {items.length === 0 ? (
                <EmptyState
                    icon={ShoppingBasket}
                    title="No items yet"
                    description="Add your first item to start tracking this list."
                    compact
                    action={(
                        <Button
                            onClick={() => {
                                resetForm();
                                setShowAddForm(true);
                            }}
                        >
                            <Plus className="h-4 w-4" />
                            Add Item
                        </Button>
                    )}
                />
            ) : (
                <div className="space-y-6">
                    {/* Unpurchased - grouped by category */}
                    {Object.entries(grouped).map(([category, categoryItems], index) => (
                        <Card
                            key={category}
                            className="overflow-hidden stagger-enter"
                            padding="none"
                            accent
                            style={{ '--stagger-index': index }}
                        >
                            <div className="px-4 py-2 bg-gray-50 border-b border-gray-200">
                                <h3 className="text-xs font-semibold text-gray-500 uppercase tracking-wider">{category}</h3>
                            </div>
                            {categoryItems.map((item) => (
                                <ItemRow key={item.id} item={item} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />
                            ))}
                        </Card>
                    ))}

                    {/* Purchased items */}
                    {purchased.length > 0 && (
                        <Card
                            className="overflow-hidden stagger-enter"
                            padding="none"
                            accent
                            style={{ '--stagger-index': Object.keys(grouped).length }}
                        >
                            <div className="px-4 py-2 bg-emerald-50 border-b border-emerald-100">
                                <h3 className="text-xs font-semibold text-emerald-600 uppercase tracking-wider">
                                    Purchased ({purchased.length})
                                </h3>
                            </div>
                            {purchased.map((item) => (
                                <ItemRow key={item.id} item={item} onToggle={handleToggle} onEdit={handleEdit} onDelete={handleDelete} />
                            ))}
                        </Card>
                    )}
                </div>
            )}
        </div>
    );
}
