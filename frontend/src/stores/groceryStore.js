import { create } from 'zustand';
import * as groceryService from '../services/groceryService';

const useGroceryStore = create((set) => ({
  lists: [],
  currentList: null,
  items: [],
  categories: [],
  collaborators: [],
  loading: false,

  // Lists
  fetchLists: async () => {
    set({ loading: true });
    try {
      const lists = await groceryService.getLists();
      set({ lists, loading: false });
    } catch {
      set({ loading: false });
    }
  },

  fetchList: async (id) => {
    set({ loading: true });
    try {
      const currentList = await groceryService.getList(id);
      set({ currentList, items: currentList.items || [], loading: false });
    } catch {
      set({ loading: false });
    }
  },

  createList: async (listData) => {
    const newList = await groceryService.createList(listData);
    set((state) => ({ lists: [newList, ...state.lists] }));
    return newList;
  },

  updateList: async (id, listData) => {
    const updated = await groceryService.updateList(id, listData);
    set((state) => ({
      lists: state.lists.map((l) => (l.id === id ? { ...l, ...updated } : l)),
      currentList: state.currentList?.id === id ? { ...state.currentList, ...updated } : state.currentList,
    }));
    return updated;
  },

  deleteList: async (id) => {
    await groceryService.deleteList(id);
    set((state) => ({
      lists: state.lists.filter((l) => l.id !== id),
      currentList: state.currentList?.id === id ? null : state.currentList,
    }));
  },

  // Items
  fetchItems: async (listId) => {
    const items = await groceryService.getItems(listId);
    set({ items });
  },

  createItem: async (listId, itemData) => {
    const newItem = await groceryService.createItem(listId, itemData);
    set((state) => ({ items: [...state.items, newItem] }));
    return newItem;
  },

  updateItem: async (id, itemData) => {
    const updated = await groceryService.updateItem(id, itemData);
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? updated : i)),
    }));
    return updated;
  },

  deleteItem: async (id) => {
    await groceryService.deleteItem(id);
    set((state) => ({
      items: state.items.filter((i) => i.id !== id),
    }));
  },

  toggleItem: async (id) => {
    const updated = await groceryService.toggleItem(id);
    set((state) => ({
      items: state.items.map((i) => (i.id === id ? updated : i)),
    }));
    return updated;
  },

  // Categories
  fetchCategories: async () => {
    try {
      const categories = await groceryService.getCategories();
      set({ categories });
    } catch {
      // ignore
    }
  },

  // Voice sessions
  processVoiceTranscript: async ({ transcript, listId }) => {
    const session = await groceryService.processVoiceTranscript({ transcript, listId });
    return session;
  },

  confirmVoiceSession: async ({ sessionId, listId, items }) => {
    const result = await groceryService.confirmVoiceSession({ sessionId, listId, items });
    return result;
  },

  fetchVoiceSessions: async () => {
    const sessions = await groceryService.getVoiceSessions();
    return sessions;
  },

  // Collaboration
  fetchCollaborators: async (listId) => {
    const collaborators = await groceryService.getCollaborators(listId);
    set({ collaborators });
    return collaborators;
  },

  shareListWithUser: async (listId, username) => {
    const result = await groceryService.shareListWithUser(listId, username);
    if (result?.user) {
      set((state) => ({
        collaborators: [...state.collaborators, { ...result.user, role: 'collaborator' }],
      }));
    }
    return result;
  },

  unshareListWithUser: async (listId, username) => {
    const result = await groceryService.unshareListWithUser(listId, username);
    if (result?.user) {
      set((state) => ({
        collaborators: state.collaborators.filter((collaborator) => collaborator.id !== result.user.id),
      }));
    }
    return result;
  },

  applyRealtimeEvent: (event, payload) => {
    set((state) => {
      if (!event) {
        return {};
      }

      if (event === 'item_created' && payload) {
        if (state.items.some((item) => item.id === payload.id)) {
          return {};
        }
        return { items: [...state.items, payload] };
      }

      if (event === 'items_created' && Array.isArray(payload)) {
        const existingIds = new Set(state.items.map((item) => item.id));
        const merged = [...state.items, ...payload.filter((item) => !existingIds.has(item.id))];
        return { items: merged };
      }

      if (event === 'item_updated' && payload) {
        return {
          items: state.items.map((item) => (item.id === payload.id ? payload : item)),
        };
      }

      if (event === 'item_deleted' && payload?.id) {
        return {
          items: state.items.filter((item) => item.id !== payload.id),
        };
      }

      if (event === 'list_updated' && payload) {
        return {
          lists: state.lists.map((list) => (list.id === payload.id ? { ...list, ...payload } : list)),
          currentList: state.currentList?.id === payload.id ? { ...state.currentList, ...payload } : state.currentList,
        };
      }

      if (event === 'list_deleted' && payload?.id) {
        const updates = {
          lists: state.lists.filter((list) => list.id !== payload.id),
        };
        if (state.currentList?.id === payload.id) {
          updates.currentList = null;
          updates.items = [];
        }
        return updates;
      }

      return {};
    });
  },
}));

export default useGroceryStore;
