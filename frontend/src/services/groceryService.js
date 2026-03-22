import api from './api';

// Lists
export const getLists = async () => {
  const { data } = await api.get('/lists/');
  return data;
};

export const getList = async (id) => {
  const { data } = await api.get(`/lists/${id}/`);
  return data;
};

export const createList = async (listData) => {
  const { data } = await api.post('/lists/', listData);
  return data;
};

export const updateList = async (id, listData) => {
  const { data } = await api.put(`/lists/${id}/`, listData);
  return data;
};

export const deleteList = async (id) => {
  await api.delete(`/lists/${id}/`);
};

// Items
export const getItems = async (listId) => {
  const { data } = await api.get(`/lists/${listId}/items/`);
  return data;
};

export const createItem = async (listId, itemData) => {
  const { data } = await api.post(`/lists/${listId}/items/`, itemData);
  return data;
};

export const updateItem = async (id, itemData) => {
  const { data } = await api.put(`/items/${id}/`, itemData);
  return data;
};

export const deleteItem = async (id) => {
  await api.delete(`/items/${id}/`);
};

export const toggleItem = async (id) => {
  const { data } = await api.patch(`/items/${id}/toggle/`);
  return data;
};

// Categories
export const getCategories = async () => {
  const { data } = await api.get('/categories/');
  return data;
};
