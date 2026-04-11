import { create } from 'zustand';
import * as pantryService from '../services/pantryService';

const usePantryStore = create((set) => ({
  items: [],
  expiringItems: [],
  loading: false,
  alertLoading: false,
  error: null,

  fetchItems: async (params = {}) => {
    set({ loading: true, error: null });
    try {
      const items = await pantryService.getPantryItems(params);
      set({ items, loading: false });
      return items;
    } catch (error) {
      set({ loading: false, error: error?.response?.data?.detail || 'Failed to fetch pantry items.' });
      throw error;
    }
  },

  addItem: async (itemData) => {
    const newItem = await pantryService.createPantryItem(itemData);
    set((state) => ({ items: [newItem, ...state.items] }));
    return newItem;
  },

  updateItem: async (id, itemData) => {
    const updated = await pantryService.updatePantryItem(id, itemData);
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? updated : item)),
      expiringItems: state.expiringItems.map((item) => (item.id === id ? updated : item)),
    }));
    return updated;
  },

  deleteItem: async (id) => {
    await pantryService.deletePantryItem(id);
    set((state) => ({
      items: state.items.filter((item) => item.id !== id),
      expiringItems: state.expiringItems.filter((item) => item.id !== id),
    }));
  },

  markLow: async (id) => {
    const updated = await pantryService.markPantryItemLow(id);
    set((state) => ({
      items: state.items.map((item) => (item.id === id ? updated : item)),
      expiringItems: state.expiringItems.map((item) => (item.id === id ? updated : item)),
    }));
    return updated;
  },

  addToList: async (id, listId) => {
    return pantryService.addPantryItemToList(id, listId);
  },

  fetchExpiringItems: async () => {
    set({ alertLoading: true });
    try {
      const expiringItems = await pantryService.getExpiringPantryItems();
      set({ expiringItems, alertLoading: false });
      return expiringItems;
    } catch {
      set({ alertLoading: false });
      return [];
    }
  },
}));

export default usePantryStore;
