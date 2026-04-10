import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Plus,
  Calendar,
  ShoppingBag,
  Trash2,
  CheckCircle2,
  Search,
  LayoutGrid,
  Rows3,
  Clock3,
} from 'lucide-react';
import toast from 'react-hot-toast';
import useGroceryStore from '../stores/groceryStore';
import useAuthStore from '../stores/authStore';
import Button from '../components/Button';
import Input from '../components/Input';
import Card from '../components/Card';

const FILTER_TABS = [
  { key: 'all', label: 'All' },
  { key: 'active', label: 'Active' },
  { key: 'completed', label: 'Completed' },
  { key: 'dueSoon', label: 'Due Soon' },
];

function formatDateDisplay(value) {
  if (!value) return 'No due date';
  const parsed = new Date(value);
  if (Number.isNaN(parsed.getTime())) return 'No due date';
  return parsed.toLocaleDateString();
}

export default function Dashboard() {
  const { lists, loading, fetchLists, createList, deleteList } = useGroceryStore();
  const { user } = useAuthStore();
  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDueDate, setNewListDueDate] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('recent');
  const [activeFilter, setActiveFilter] = useState('all');
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

  const enrichedLists = useMemo(() => {
    const now = new Date();
    return lists.map((list) => {
      const itemCount = list.item_count || 0;
      const purchasedCount = list.purchased_count || 0;
      const progress = itemCount > 0 ? Math.round((purchasedCount / itemCount) * 100) : 0;
      const dueDate = list.due_date ? new Date(list.due_date) : null;
      const hasValidDueDate = dueDate && !Number.isNaN(dueDate.getTime());
      const dayDiff = hasValidDueDate
        ? Math.ceil((dueDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
        : null;

      return {
        ...list,
        itemCount,
        purchasedCount,
        progress,
        hasValidDueDate,
        dayDiff,
        isCompleted: itemCount > 0 && purchasedCount === itemCount,
        isOverdue: hasValidDueDate && dayDiff < 0 && !(itemCount > 0 && purchasedCount === itemCount),
        isDueSoon: hasValidDueDate && dayDiff >= 0 && dayDiff <= 3,
      };
    });
  }, [lists]);

  const stats = useMemo(() => {
    const totalLists = enrichedLists.length;
    const totalItems = enrichedLists.reduce((sum, list) => sum + list.itemCount, 0);
    const completedItems = enrichedLists.reduce((sum, list) => sum + list.purchasedCount, 0);
    const itemsToBuy = totalItems - completedItems;
    const dueSoonCount = enrichedLists.filter((list) => list.isDueSoon && !list.isCompleted).length;

    const latestDate = enrichedLists
      .flatMap((list) => [list.updated_at, list.created_at, list.due_date])
      .filter(Boolean)
      .map((value) => new Date(value))
      .filter((date) => !Number.isNaN(date.getTime()))
      .sort((a, b) => b.getTime() - a.getTime())[0];

    return {
      totalLists,
      itemsToBuy,
      completedItems,
      dueSoonCount,
      latestLabel: latestDate ? latestDate.toLocaleDateString() : 'No activity yet',
    };
  }, [enrichedLists]);

  const visibleLists = useMemo(() => {
    const normalizedSearch = searchTerm.trim().toLowerCase();

    const filtered = enrichedLists.filter((list) => {
      const matchesSearch = list.name.toLowerCase().includes(normalizedSearch);
      if (!matchesSearch) return false;

      if (activeFilter === 'active') return !list.isCompleted;
      if (activeFilter === 'completed') return list.isCompleted;
      if (activeFilter === 'dueSoon') return list.isDueSoon;
      return true;
    });

    const sorted = [...filtered];
    sorted.sort((a, b) => {
      if (sortBy === 'name') return a.name.localeCompare(b.name);
      if (sortBy === 'progress') return b.progress - a.progress;
      if (sortBy === 'dueDate') {
        if (!a.hasValidDueDate && !b.hasValidDueDate) return 0;
        if (!a.hasValidDueDate) return 1;
        if (!b.hasValidDueDate) return -1;
        return new Date(a.due_date).getTime() - new Date(b.due_date).getTime();
      }

      const aRecent = new Date(a.updated_at || a.created_at || 0).getTime();
      const bRecent = new Date(b.updated_at || b.created_at || 0).getTime();
      return bRecent - aRecent;
    });

    return sorted;
  }, [enrichedLists, searchTerm, activeFilter, sortBy]);

  const handleCreate = async (e) => {
    e.preventDefault();
    if (!newListName.trim()) return;
    try {
      await createList({
        name: newListName.trim(),
        due_date: newListDueDate || null,
      });
      setShowModal(false);
      setNewListName('');
      setNewListDueDate('');
      toast.success('List created!');
    } catch {
      toast.error('Failed to create list.');
    }
  };

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    try {
      await deleteList(id);
      toast.success('List deleted.');
    } catch {
      toast.error('Failed to delete list.');
    }
  };

  const userLabel = user?.first_name || user?.username || 'there';

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
        <div>
          <h1 className="text-3xl font-semibold text-neutral-dark">Welcome back, {userLabel}</h1>
          <p className="mt-1 text-text-muted">Plan your week faster with smart list management.</p>
        </div>
        <div className="flex items-center gap-2">
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            New List
          </Button>
        </div>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <Card accent>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Total Lists</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-dark">{stats.totalLists}</p>
        </Card>
        <Card accent>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Items To Buy</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-dark">{stats.itemsToBuy}</p>
        </Card>
        <Card accent>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Completed Items</p>
          <p className="mt-2 text-2xl font-semibold text-neutral-dark">{stats.completedItems}</p>
        </Card>
        <Card accent>
          <p className="text-xs font-semibold uppercase tracking-wider text-text-muted">Last Updated</p>
          <p className="mt-2 text-lg font-semibold text-neutral-dark">{stats.latestLabel}</p>
          <p className="mt-1 text-sm text-text-muted">Due soon: {stats.dueSoonCount}</p>
        </Card>
      </div>

      <Card className="space-y-4" accent>
        <div className="grid gap-3 lg:grid-cols-[1fr_auto_auto] lg:items-end">
          <Input
            label="Search"
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            clearable
            placeholder="Search lists by name"
            leftIcon={<Search className="h-4 w-4" />}
          />

          <div>
            <label htmlFor="sortBy" className="mb-1 block text-sm font-medium text-neutral-dark">Sort</label>
            <div className="relative">
              <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-text-muted" />
              <select
                id="sortBy"
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="h-[42px] min-w-44 rounded-lg border border-border-default bg-white pl-9 pr-3 text-sm text-neutral-dark outline-none transition focus:border-brand-primary focus:shadow-[0_0_0_3px_rgba(16,185,129,0.1)]"
              >
                <option value="recent">Most Recent</option>
                <option value="name">Name</option>
                <option value="dueDate">Due Date</option>
                <option value="progress">Progress</option>
              </select>
            </div>
          </div>

          <div>
            <p className="mb-1 block text-sm font-medium text-neutral-dark">View</p>
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
        </div>

        <div className="flex flex-wrap gap-2">
          {FILTER_TABS.map((tab) => (
            <Button
              key={tab.key}
              size="sm"
              variant={activeFilter === tab.key ? 'primary' : 'secondary'}
              onClick={() => setActiveFilter(tab.key)}
            >
              {tab.label}
            </Button>
          ))}
        </div>
      </Card>

      {loading && lists.length === 0 ? (
        <div className="py-20 text-center text-text-muted">Loading...</div>
      ) : lists.length === 0 ? (
        <div className="py-20 text-center">
          <ShoppingBag className="mx-auto mb-4 h-16 w-16 text-gray-300" />
          <h3 className="mb-1 text-lg font-medium text-gray-900">No lists yet</h3>
          <p className="mb-6 text-gray-500">Create your first grocery list to get started.</p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            Create List
          </Button>
        </div>
      ) : visibleLists.length === 0 ? (
        <Card className="py-16 text-center" accent>
          <p className="text-lg font-medium text-neutral-dark">No lists match your filters</p>
          <p className="mt-1 text-text-muted">Try another search term or switch filters.</p>
          <Button
            className="mt-5"
            variant="secondary"
            onClick={() => {
              setSearchTerm('');
              setActiveFilter('all');
            }}
          >
            Reset Filters
          </Button>
        </Card>
      ) : (
        <div className={viewMode === 'grid' ? 'grid gap-4 sm:grid-cols-2 xl:grid-cols-3' : 'space-y-3'}>
          {visibleLists.map((list) => {
            const statusText = list.isCompleted
              ? 'Completed'
              : list.isOverdue
                ? 'Overdue'
                : list.isDueSoon
                  ? 'Due Soon'
                  : 'Active';

            const statusClasses = list.isCompleted
              ? 'bg-semantic-success/10 text-semantic-success'
              : list.isOverdue
                ? 'bg-semantic-error/10 text-semantic-error'
                : list.isDueSoon
                  ? 'bg-semantic-warning/10 text-semantic-warning'
                  : 'bg-brand-primary-light text-brand-primary';

            return (
              <Card
                as={Link}
                key={list.id}
                to={`/lists/${list.id}`}
                hover
                accent
                padding="none"
                className={`group p-5 ${viewMode === 'list' ? 'sm:p-4' : ''}`}
              >
                <div className="mb-3 flex items-start justify-between gap-3">
                  <div>
                    <h3 className="truncate pr-2 font-semibold text-gray-900 transition-colors group-hover:text-emerald-700">
                      {list.name}
                    </h3>
                    <span className={`mt-2 inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusClasses}`}>
                      {statusText}
                    </span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(list.id, list.name);
                    }}
                    className="shrink-0 p-1 text-gray-400 transition-colors hover:text-red-500"
                    aria-label={`Delete ${list.name}`}
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="mb-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {list.purchasedCount}/{list.itemCount} items
                  </span>
                  <span className="flex items-center gap-1">
                    <Calendar className="w-3.5 h-3.5" />
                    {formatDateDisplay(list.due_date)}
                  </span>
                </div>

                <div className="h-2 w-full rounded-full bg-gray-100">
                  <div
                    className="h-2 rounded-full bg-emerald-500 transition-all duration-300"
                    style={{ width: `${list.progress}%` }}
                  />
                </div>
                <p className="mt-1 text-xs text-gray-400">{list.progress}% complete</p>
              </Card>
            );
          })}
        </div>
      )}

      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 p-4">
          <Card className="w-full max-w-md" accent>
            <h2 className="mb-4 text-lg font-semibold text-gray-900">Create New List</h2>
            <form onSubmit={handleCreate} className="space-y-4">
              <Input
                label="List Name"
                type="text"
                value={newListName}
                onChange={(e) => setNewListName(e.target.value)}
                required
                autoFocus
                clearable
                placeholder="e.g., Weekly Groceries"
              />
              <Input
                label="Due Date (optional)"
                type="date"
                value={newListDueDate}
                onChange={(e) => setNewListDueDate(e.target.value)}
              />
              <div className="flex justify-end gap-3 pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  <Plus className="h-4 w-4" />
                  Create
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  );
}
