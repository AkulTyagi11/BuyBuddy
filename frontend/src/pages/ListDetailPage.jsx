import { useCallback, useEffect, useRef, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
    ArrowLeft, Plus, Trash2, Check, Pencil, ShoppingBasket, X, Share2,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useGroceryStore from '../stores/groceryStore';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';
import Skeleton from '../components/Skeleton';
import EmptyState from '../components/EmptyState';
import Modal from '../components/Modal';
import VoiceHistoryPanel from '../components/VoiceHistoryPanel';
import VoiceItemEditor from '../components/VoiceItemEditor';
import VoiceInputButton from '../components/VoiceInputButton';
import RealTimeIndicator from '../components/RealTimeIndicator';
import CollaboratorsList from '../components/CollaboratorsList';
import CollaborationActivity from '../components/CollaborationActivity';
import ShareListModal from '../components/ShareListModal';
import useListCollaboration from '../hooks/useListCollaboration';
import useAuthStore from '../stores/authStore';

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
                        className="flex-1 rounded-lg border border-border-default px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(123,191,74,0.18)]"
                    >
                        {UNIT_OPTIONS.map((u) => (
                            <option key={u.value} value={u.value}>{u.label}</option>
                        ))}
                    </select>
                </div>
                <select
                    value={form.category}
                    onChange={(e) => setForm({ ...form, category: e.target.value })}
                    className="rounded-lg border border-border-default px-3 py-2 text-sm outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(123,191,74,0.18)]"
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
            className={`flex items-center gap-3 px-4 py-3 border-b border-border-default/60 hover:bg-surface-muted transition group ${item.is_purchased ? 'bg-surface-muted/60' : ''
                }`}
        >
            <button
                onClick={() => onToggle(item.id)}
                className={`icon-button-motion shrink-0 w-5 h-5 rounded border-2 flex items-center justify-center transition ${item.is_purchased
                        ? 'bg-brand-primary border-brand-primary text-white'
                        : 'border-border-default hover:border-brand-primary'
                    }`}
            >
                {item.is_purchased && <Check className="w-3 h-3" />}
            </button>

            <div className="flex-1 min-w-0">
                <span className={`text-sm font-medium ${item.is_purchased ? 'line-through text-text-muted/80' : 'text-neutral-dark'}`}>
                    {item.name}
                </span>
                <span className="text-xs text-text-muted ml-2">
                    {item.quantity} {item.unit}
                    {item.category_name && ` · ${item.category_name}`}
                    {item.price && ` · $${item.price}`}
                </span>
            </div>

            <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition">
                {!item.is_purchased && (
                    <button
                        onClick={() => onEdit(item)}
                        className="icon-button-motion rounded p-1 text-text-muted hover:bg-blue-50 hover:text-blue-500"
                    >
                        <Pencil className="w-3.5 h-3.5" />
                    </button>
                )}
                <button
                    onClick={() => onDelete(item.id)}
                    className="icon-button-motion rounded p-1 text-text-muted hover:bg-red-50 hover:text-red-500"
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
                        <div className="border-b border-border-default bg-surface-muted px-4 py-2">
                            <Skeleton className="h-3 w-28" />
                        </div>
                        {Array.from({ length: 4 }).map((__, rowIndex) => (
                            <div
                                key={`detail-skeleton-row-${sectionIndex}-${rowIndex}`}
                                className="flex items-center gap-3 border-b border-border-default/60 px-4 py-3 last:border-b-0"
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
        processVoiceTranscript, confirmVoiceSession, fetchVoiceSessions,
        applyRealtimeEvent, collaborators, fetchCollaborators, shareListWithUser, unshareListWithUser,
    } = useGroceryStore();
    const { user } = useAuthStore();

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
    const [voiceFallbackReason, setVoiceFallbackReason] = useState('');
    const [voiceSessions, setVoiceSessions] = useState([]);
    const [voiceHistoryLoading, setVoiceHistoryLoading] = useState(false);
    const [shareModalOpen, setShareModalOpen] = useState(false);
    const [shareLoading, setShareLoading] = useState(false);
    const [activityItems, setActivityItems] = useState([]);
    const recognitionRef = useRef(null);

    useEffect(() => {
        fetchList(id);
        fetchCategories();
    }, [id, fetchList, fetchCategories]);

    useEffect(() => {
        const loadCollaborators = async () => {
            try {
                await fetchCollaborators(id);
            } catch {
                toast.error('Failed to load collaborators.');
            }
        };

        loadCollaborators();
    }, [id, fetchCollaborators]);

    useEffect(() => {
        const loadVoiceHistory = async () => {
            setVoiceHistoryLoading(true);
            try {
                const allSessions = await fetchVoiceSessions();
                const listSessions = (allSessions || []).filter(
                    (session) => Number(session.grocery_list) === Number(id)
                );
                setVoiceSessions(listSessions.slice(0, 6));
            } catch {
                toast.error('Failed to load voice history.');
            } finally {
                setVoiceHistoryLoading(false);
            }
        };

        loadVoiceHistory();
    }, [id, fetchVoiceSessions]);

    useEffect(() => {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        setVoiceSupported(Boolean(SpeechRecognition));

        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const appendActivity = useCallback((message) => {
        setActivityItems((prev) => {
            const timestamp = new Date().toLocaleTimeString([], {
                hour: 'numeric',
                minute: '2-digit',
            });
            const next = [{ id: `${Date.now()}-${Math.random()}`, message, timestamp }, ...prev];
            return next.slice(0, 6);
        });
    }, []);

    const handleRealtimeEvent = useCallback(
        (event, payload) => {
            applyRealtimeEvent(event, payload);

            if (event === 'item_created' && payload?.name) {
                appendActivity(`Added ${payload.name}`);
            } else if (event === 'item_updated' && payload?.name) {
                appendActivity(`Updated ${payload.name}`);
            } else if (event === 'item_deleted' && payload?.id) {
                appendActivity('Removed an item');
            } else if (event === 'items_created' && Array.isArray(payload)) {
                appendActivity(`Added ${payload.length} items`);
            } else if (event === 'list_shared' && payload?.user?.username) {
                appendActivity(`Shared with ${payload.user.username}`);
            } else if (event === 'list_unshared') {
                appendActivity('Removed a collaborator');
            } else if (event === 'list_updated') {
                appendActivity('List details updated');
            }
        },
        [applyRealtimeEvent, appendActivity],
    );

    const { status: collaborationStatus, activeUsers } = useListCollaboration({
        listId: id,
        onEvent: handleRealtimeEvent,
    });

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
        setVoiceFallbackReason('');
    };

    const openManualVoiceModal = ({ transcript = '', sessionId = null, reason = '' } = {}) => {
        setVoiceSessionId(sessionId);
        setVoiceTranscript(transcript);
        setVoiceItems([{ name: '', quantity: '1', unit: 'pcs', category: '' }]);
        setVoiceFallbackReason(reason);
        setVoiceModalOpen(true);
    };

    const handleVoiceCapture = () => {
        setVoiceFallbackReason('');

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
                setVoiceFallbackReason('No speech detected. You can retry voice capture or switch to manual entry.');
                toast.error('No speech detected. Please try again.');
                return;
            }
            if (event.error === 'not-allowed') {
                setVoiceFallbackReason('Microphone access was denied. Continue by adding items manually.');
                toast.error('Microphone permission was denied.');
                return;
            }
            setVoiceFallbackReason('Voice capture failed. Retry voice capture or add items manually.');
            toast.error('Voice capture failed. Please try again.');
        };

        recognition.onresult = async (event) => {
            const transcript = Array.from(event.results)
                .map((result) => result[0]?.transcript || '')
                .join(' ')
                .trim();

            if (!transcript) {
                setVoiceFallbackReason('No transcript was captured. Retry voice capture or add items manually.');
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
                    openManualVoiceModal({
                        transcript: session.transcript || transcript,
                        sessionId: session.id,
                        reason: 'No items were recognized from voice input. Add them manually below.',
                    });
                    toast.error('No grocery items were recognized.');
                    return;
                }

                setVoiceSessionId(session.id);
                setVoiceTranscript(session.transcript || transcript);
                setVoiceItems(parsedItems);
                setVoiceFallbackReason('');
                setVoiceModalOpen(true);
                setVoiceSessions((prevSessions) => [session, ...prevSessions].slice(0, 6));
                toast.success('Review and confirm voice items.');
            } catch {
                setVoiceFallbackReason('Voice processing failed. Retry voice capture or use manual entry.');
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
            let count = sanitizedItems.length;

            if (voiceSessionId) {
                const result = await confirmVoiceSession({
                    sessionId: voiceSessionId,
                    listId: Number(id),
                    items: sanitizedItems,
                });
                count = result?.count ?? sanitizedItems.length;
                await fetchList(id);

                setVoiceSessions((prevSessions) => prevSessions.map((session) => (
                    session.id === voiceSessionId
                        ? { ...session, confirmed: true, parsed_items: sanitizedItems }
                        : session
                )));
            } else {
                await Promise.all(
                    sanitizedItems.map((item) => createItem(id, {
                        name: item.name,
                        quantity: item.quantity,
                        unit: item.unit,
                        category: item.category,
                        price: null,
                    }))
                );
            }

            resetVoiceModal();
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

    const handleReuseVoiceSession = (session) => {
        const parsedItems = normalizeVoiceItems(session.parsed_items || []);
        if (parsedItems.length === 0) {
            toast.error('This voice session does not contain any parsed items.');
            return;
        }

        setVoiceSessionId(session.id);
        setVoiceTranscript(session.transcript || '');
        setVoiceItems(parsedItems);
        setVoiceModalOpen(true);
    };

    return (
        <div>
            {/* Header */}
            <div className="mb-6">
                <button
                    onClick={() => navigate('/dashboard')}
                    className="flex items-center gap-1 text-sm text-text-muted hover:text-neutral-dark mb-3 transition"
                >
                    <ArrowLeft className="w-4 h-4" />
                    Back to lists
                </button>
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-neutral-dark font-heading">{currentList.name}</h1>
                        <p className="text-sm text-text-muted mt-1">
                            {items.length} item{items.length !== 1 ? 's' : ''} · {progress}% complete
                            {currentList.due_date && ` · Due ${new Date(currentList.due_date).toLocaleDateString()}`}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <VoiceInputButton
                            voiceProcessing={voiceProcessing}
                            voiceListening={voiceListening}
                            voiceSupported={voiceSupported}
                            voiceFallbackReason={voiceFallbackReason}
                            onVoiceCapture={handleVoiceCapture}
                            onManualEntry={() => openManualVoiceModal({ reason: 'Manual entry mode enabled.' })}
                        />
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

                {/* Progress bar */}
                <div className="mt-4 w-full bg-surface-strong rounded-full h-2.5">
                    <div
                        className="bg-brand-primary h-2.5 rounded-full transition-all duration-300"
                        style={{ width: `${progress}%` }}
                    />
                </div>
            </div>

            <VoiceHistoryPanel
                sessions={voiceSessions}
                loading={voiceHistoryLoading}
                onReuseSession={handleReuseVoiceSession}
            />

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
                                    <h2 className="text-lg font-semibold text-neutral-dark font-heading">Review Voice Items</h2>
                                    <p className="mt-1 text-xs text-text-muted">
                                {voiceTranscript ? `"${voiceTranscript}"` : 'Update recognized items before confirming.'}
                            </p>
                        </div>
                        <button
                            type="button"
                            onClick={resetVoiceModal}
                                    className="rounded p-1 text-text-muted transition hover:bg-surface-muted hover:text-neutral-dark"
                            aria-label="Close voice review"
                            disabled={voiceProcessing}
                        >
                            <X className="h-4 w-4" />
                        </button>
                    </div>

                    <div className="max-h-[55vh] space-y-3 overflow-y-auto pr-1">
                        {voiceItems.map((item, index) => (
                            <VoiceItemEditor
                                key={`voice-item-${index}`}
                                item={item}
                                index={index}
                                categories={categories}
                                unitOptions={UNIT_OPTIONS}
                                onChange={handleVoiceItemChange}
                                onRemove={handleVoiceItemRemove}
                            />
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
                            <div className="px-4 py-2 bg-surface-muted border-b border-border-default">
                                <h3 className="text-xs font-semibold text-text-muted uppercase tracking-wider">{category}</h3>
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
                            <div className="px-4 py-2 bg-brand-primary-light/50 border-b border-brand-primary-light">
                                <h3 className="text-xs font-semibold text-brand-primary uppercase tracking-wider">
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
