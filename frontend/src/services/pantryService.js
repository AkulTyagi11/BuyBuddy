import api from './api';

export const getPantry = async () => {
  const { data } = await api.get('/pantry/');
  return data;
};

export const getPantryItems = async (params = {}) => {
  const { data } = await api.get('/pantry/items/', { params });
  return data;
};

export const createPantryItem = async (itemData) => {
  const { data } = await api.post('/pantry/items/', itemData);
  return data;
};

export const updatePantryItem = async (id, itemData) => {
  const { data } = await api.put(`/pantry/items/${id}/`, itemData);
  return data;
};

export const deletePantryItem = async (id) => {
  await api.delete(`/pantry/items/${id}/`);
};

export const markPantryItemLow = async (id) => {
  const { data } = await api.patch(`/pantry/items/${id}/mark-low/`);
  return data;
};

export const addPantryItemToList = async (id, listId) => {
  const { data } = await api.post(`/pantry/items/${id}/to-list/`, { list_id: listId });
  return data;
};

export const getExpiringPantryItems = async () => {
  const { data } = await api.get('/pantry/expiring/');
  return data;
};
