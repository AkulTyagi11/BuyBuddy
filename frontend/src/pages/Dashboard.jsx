import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Calendar, ShoppingBag, Trash2, CheckCircle2 } from 'lucide-react';
import toast from 'react-hot-toast';
import useGroceryStore from '../stores/groceryStore';
import Button from '../components/Button';
import Input from '../components/Input';

export default function Dashboard() {
  const { lists, loading, fetchLists, createList, deleteList } = useGroceryStore();
  const [showModal, setShowModal] = useState(false);
  const [newListName, setNewListName] = useState('');
  const [newListDueDate, setNewListDueDate] = useState('');

  useEffect(() => {
    fetchLists();
  }, [fetchLists]);

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

  return (
    <div>
      <div className="flex items-center justify-between mb-8">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Grocery Lists</h1>
          <p className="text-gray-500 mt-1">{lists.length} list{lists.length !== 1 ? 's' : ''}</p>
        </div>
        <Button onClick={() => setShowModal(true)}>
          <Plus className="w-4 h-4" />
          New List
        </Button>
      </div>

      {loading && lists.length === 0 ? (
        <div className="text-center py-20 text-gray-400">Loading...</div>
      ) : lists.length === 0 ? (
        <div className="text-center py-20">
          <ShoppingBag className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-1">No lists yet</h3>
          <p className="text-gray-500 mb-6">Create your first grocery list to get started.</p>
          <Button onClick={() => setShowModal(true)}>
            <Plus className="w-4 h-4" />
            Create List
          </Button>
        </div>
      ) : (
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {lists.map((list) => {
            const progress = list.item_count > 0 ? Math.round((list.purchased_count / list.item_count) * 100) : 0;
            return (
              <Link
                key={list.id}
                to={`/lists/${list.id}`}
                className="group bg-white rounded-xl border border-gray-200 p-5 hover:shadow-md hover:border-emerald-200 transition-all"
              >
                <div className="flex items-start justify-between mb-3">
                  <h3 className="font-semibold text-gray-900 group-hover:text-emerald-700 transition-colors truncate pr-2">
                    {list.name}
                  </h3>
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                      handleDelete(list.id, list.name);
                    }}
                    className="p-1 text-gray-400 hover:text-red-500 transition-colors shrink-0"
                  >
                    <Trash2 className="w-4 h-4" />
                  </button>
                </div>

                <div className="flex items-center gap-4 text-sm text-gray-500 mb-4">
                  <span className="flex items-center gap-1">
                    <CheckCircle2 className="w-3.5 h-3.5" />
                    {list.purchased_count}/{list.item_count} items
                  </span>
                  {list.due_date && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-3.5 h-3.5" />
                      {new Date(list.due_date).toLocaleDateString()}
                    </span>
                  )}
                </div>

                <div className="w-full bg-gray-100 rounded-full h-2">
                  <div
                    className="bg-emerald-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${progress}%` }}
                  />
                </div>
                <p className="text-xs text-gray-400 mt-1">{progress}% complete</p>
              </Link>
            );
          })}
        </div>
      )}

      {/* Create List Modal */}
      {showModal && (
        <div className="fixed inset-0 bg-black/40 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6">
            <h2 className="text-lg font-semibold text-gray-900 mb-4">Create New List</h2>
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
              <div className="flex gap-3 justify-end pt-2">
                <Button
                  type="button"
                  variant="secondary"
                  size="sm"
                  onClick={() => setShowModal(false)}
                >
                  Cancel
                </Button>
                <Button type="submit" size="sm">
                  Create
                </Button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
