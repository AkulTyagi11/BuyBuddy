import { useEffect, useMemo, useState } from 'react';
import { LayoutGrid, Package, Rows3, Search, SlidersHorizontal } from 'lucide-react';
import toast from 'react-hot-toast';
import Button from '../components/Button';
import Card from '../components/Card';
import EmptyState from '../components/EmptyState';
import Input from '../components/Input';
import Skeleton from '../components/Skeleton';
import PantryItemCard from '../components/PantryItemCard';
import AddPantryItemModal from '../components/AddPantryItemModal';
import usePantryStore from '../stores/pantryStore';
import useGroceryStore from '../stores/groceryStore';

function PantryLoadingSkeleton() {
  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <Skeleton className="h-9 w-56" />
          <Skeleton className="mt-2 h-4 w-80 max-w-full" />
        </div>
        <Skeleton className="h-10 w-32" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 4 }).map((_, index) => (
          <Card key={index} accent>
            <Skeleton className="h-3 w-20" />
            <Skeleton className="mt-3 h-8 w-16" />
          </Card>
        ))}
      </div>

      <Card accent className="space-y-4">
        <div className="grid gap-3 lg:grid-cols-4">
          <Skeleton className="h-[42px] w-full" />
          <Skeleton className="h-[42px] w-full" />
          <Skeleton className="h-[42px] w-full" />
          <Skeleton className="h-[42px] w-full" />
        </div>
      </Card>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {Array.from({ length: 6 }).map((_, index) => (
          <Card key={index} accent>
            <Skeleton className="h-5 w-36" />
            <Skeleton className="mt-2 h-4 w-28" />
            <Skeleton className="mt-4 h-4 w-44" />
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Skeleton className="h-9 w-full" />
              <Skeleton className="h-9 w-full" />
            </div>
          </Card>
        ))}
      </div>
    </div>
  );
}

export default function PantryPage() {
  const {
    items,
    loading,
    fetchItems,
    addItem,
    updateItem,
    deleteItem,
    markLow,
    addToList,
  } = usePantryStore();

  const {
    categories,
    lists,
    fetchCategories,
    fetchLists,
  } = useGroceryStore();

  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [conditionFilter, setConditionFilter] = useState('all');
  const [sortBy, setSortBy] = useState('added');
  const [viewMode, setViewMode] = useState('grid');
  const [targetListId, setTargetListId] = useState('');
  const [modalOpen, setModalOpen] = useState(false);
  const [saving, setSaving] = useState(false);
  const [editingItem, setEditingItem] = useState(null);

  useEffect(() => {
    fetchItems();
    fetchCategories();
    fetchLists();
  }, [fetchItems, fetchCategories, fetchLists]);

  useEffect(() => {
    if (!targetListId && lists.length > 0) {
      setTargetListId(String(lists[0].id));
    }
  }, [lists, targetListId]);

  const filteredItems = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const mapped = items.filter((item) => {
      const matchesSearch = item.name.toLowerCase().includes(normalizedSearch);
      if (!matchesSearch) return false;

      if (categoryFilter !== 'all' && String(item.category) !== categoryFilter) {
        return false;
      }

      if (conditionFilter !== 'all') {
        if (conditionFilter === 'expiring') {
          return typeof item.days_until_expiry === 'number' && item.days_until_expiry >= 0 && item.days_until_expiry <= 7;
        }

        return item.condition === conditionFilter;
      }

      return true;
    });

    const sorted = [...mapped];
    sorted.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'expiry') {
        if (a.days_until_expiry === null || a.days_until_expiry === undefined) return 1;
        if (b.days_until_expiry === null || b.days_until_expiry === undefined) return -1;
        return a.days_until_expiry - b.days_until_expiry;
      }
      if (sortBy === 'condition') return a.condition.localeCompare(b.condition);

      const aDate = new Date(a.added_date || a.updated_at || 0).getTime();
      const bDate = new Date(b.added_date || b.updated_at || 0).getTime();
      return bDate - aDate;
    });

    return sorted;
  }, [items, searchTerm, categoryFilter, conditionFilter, sortBy]);

  const stats = useMemo(() => {
    const total = items.length;
    const low = items.filter((item) => item.condition === 'low').length;
    const expired = items.filter((item) => item.condition === 'expired' || (item.days_until_expiry ?? 1) < 0).length;
    const expiring = items.filter((item) => typeof item.days_until_expiry === 'number' && item.days_until_expiry >= 0 && item.days_until_expiry <= 7).length;
    return { total, low, expired, expiring };
  }, [items]);

  const handleAddOrUpdate = async (payload) => {
    setSaving(true);
    try {
      if (editingItem) {
        await updateItem(editingItem.id, payload);
        toast.success('Pantry item updated.');
      } else {
        await addItem(payload);
        toast.success('Item added to pantry.');
      }
      setModalOpen(false);
      setEditingItem(null);
    } catch {
      toast.error('Failed to save pantry item.');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (item) => {
    if (!window.confirm(`Delete "${item.name}" from pantry?`)) return;
    try {
      await deleteItem(item.id);
      toast.success('Pantry item deleted.');
    } catch {
      toast.error('Failed to delete pantry item.');
    }
  };

  const handleAddToList = async (item) => {
    if (!targetListId) {
      toast.error('Select a target grocery list first.');
      return;
    }

    try {
      await addToList(item.id, Number(targetListId));
      toast.success(`${item.name} added to list.`);
    } catch {
      toast.error('Failed to add pantry item to list.');
    }
  };

  const handleMarkLow = async (item) => {
    try {
      await markLow(item.id);
      toast.success(`${item.name} marked as low.`);
    } catch {
      toast.error('Failed to mark item as low.');
    }
  };

  if (loading && items.length === 0) {
    return <PantryLoadingSkeleton />;
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-dark">My Pantry</h1>
          <p className="mt-1 text-text-muted">Track what you already have and move items to shopping lists in one click.</p>
        </div>

        <Button
          onClick={() => {
            setEditingItem(null);
            setModalOpen(true);
          }}
        >
          <Package className="h-4 w-4" />
          Add Pantry Item
        </Button>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card accent>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Items</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-dark">{stats.total}</p>
        </Card>
        <Card accent>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Running Low</p>
          <p className="mt-2 text-2xl font-semibold text-semantic-warning">{stats.low}</p>
        </Card>
        <Card accent>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Expiring Soon</p>
          <p className="mt-2 text-2xl font-semibold text-brand-primary">{stats.expiring}</p>
        </Card>
        <Card accent>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Expired</p>
          <p className="mt-2 text-2xl font-semibold text-semantic-error">{stats.expired}</p>
        </Card>
      </div>

      <Card className="space-y-4" accent>
        <div className="grid gap-3 lg:grid-cols-[1fr_repeat(4,minmax(0,220px))] lg:items-end">
          <Input
            label="Search"
            value={searchTerm}
            onChange={(event) => setSearchTerm(event.target.value)}
            placeholder="Search pantry items"
            leftIcon={<Search className="h-4 w-4" />}
            clearable
          />

          <div>
            <label htmlFor="pantry-category-filter" className="mb-1 block text-sm font-medium text-neutral-dark">Category</label>
            <select
              id="pantry-category-filter"
              value={categoryFilter}
              onChange={(event) => setCategoryFilter(event.target.value)}
              className="h-[42px] w-full rounded-lg border border-border-default bg-white px-3 text-sm text-neutral-dark outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
            >
              <option value="all">All categories</option>
              {categories.map((category) => (
                <option key={category.id} value={String(category.id)}>{category.name}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="pantry-condition-filter" className="mb-1 block text-sm font-medium text-neutral-dark">Condition</label>
            <select
              id="pantry-condition-filter"
              value={conditionFilter}
              onChange={(event) => setConditionFilter(event.target.value)}
              className="h-[42px] w-full rounded-lg border border-border-default bg-white px-3 text-sm text-neutral-dark outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
            >
              <option value="all">All conditions</option>
              <option value="stock">In stock</option>
              <option value="low">Running low</option>
              <option value="expired">Expired</option>
              <option value="expiring">Expiring in 7 days</option>
            </select>
          </div>

          <div>
            <label htmlFor="pantry-sort" className="mb-1 block text-sm font-medium text-neutral-dark">Sort</label>
            <select
              id="pantry-sort"
              value={sortBy}
              onChange={(event) => setSortBy(event.target.value)}
              className="h-[42px] w-full rounded-lg border border-border-default bg-white px-3 text-sm text-neutral-dark outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
            >
              <option value="added">Recently added</option>
              <option value="name">Name</option>
              <option value="expiry">Expiry date</option>
              <option value="condition">Condition</option>
            </select>
          </div>

          <div>
            <label htmlFor="pantry-target-list" className="mb-1 block text-sm font-medium text-neutral-dark">Add to list</label>
            <select
              id="pantry-target-list"
              value={targetListId}
              onChange={(event) => setTargetListId(event.target.value)}
              className="h-[42px] w-full rounded-lg border border-border-default bg-white px-3 text-sm text-neutral-dark outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
            >
              {lists.length === 0 ? <option value="">No list available</option> : null}
              {lists.map((list) => (
                <option key={list.id} value={String(list.id)}>{list.name}</option>
              ))}
            </select>
          </div>
        </div>

        <div className="flex items-center justify-between gap-3">
          <div className="inline-flex items-center gap-2 rounded-lg border border-border-default bg-neutral-light px-3 py-1.5 text-xs font-medium text-text-muted">
            <SlidersHorizontal className="h-3.5 w-3.5" />
            {filteredItems.length} item{filteredItems.length === 1 ? '' : 's'} visible
          </div>

          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant={viewMode === 'grid' ? 'primary' : 'secondary'}
              className="!px-3"
              onClick={() => setViewMode('grid')}
              aria-label="Grid view"
            >
              <LayoutGrid className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant={viewMode === 'list' ? 'primary' : 'secondary'}
              className="!px-3"
              onClick={() => setViewMode('list')}
              aria-label="List view"
            >
              <Rows3 className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </Card>

      {items.length === 0 ? (
        <EmptyState
          icon={Package}
          title="Your pantry is empty"
          description="Add pantry items to track inventory and quickly move them into shopping lists."
          action={(
            <Button
              onClick={() => {
                setEditingItem(null);
                setModalOpen(true);
              }}
            >
              <Package className="h-4 w-4" />
              Add Pantry Item
            </Button>
          )}
        />
      ) : filteredItems.length === 0 ? (
        <EmptyState
          icon={Search}
          title="No pantry items match your filters"
          description="Try a different filter or clear your search."
          compact
          card
          action={(
            <Button
              variant="secondary"
              onClick={() => {
                setSearchTerm('');
                setCategoryFilter('all');
                setConditionFilter('all');
              }}
            >
              Reset Filters
            </Button>
          )}
        />
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
          {filteredItems.map((item, index) => (
            <div key={item.id} style={{ '--stagger-index': index }}>
              <PantryItemCard
                item={item}
                disableAddToList={!targetListId}
                onAddToList={() => handleAddToList(item)}
                onMarkLow={() => handleMarkLow(item)}
                onEdit={() => {
                  setEditingItem(item);
                  setModalOpen(true);
                }}
                onDelete={() => handleDelete(item)}
              />
            </div>
          ))}
        </div>
      )}

      {modalOpen ? (
        <AddPantryItemModal
          onClose={() => {
            setModalOpen(false);
            setEditingItem(null);
          }}
          onSubmit={handleAddOrUpdate}
          categories={categories}
          initialValues={editingItem}
          loading={saving}
        />
      ) : null}
    </div>
  );
}
