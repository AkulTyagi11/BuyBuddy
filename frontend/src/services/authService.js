import api from './api';

export const login = async (username, password) => {
  const { data } = await api.post('/auth/login/', { username, password });
  return data;
};

export const register = async (userData) => {
  const { data } = await api.post('/auth/register/', userData);
  return data;
};

export const getProfile = async () => {
  const { data } = await api.get('/auth/profile/');
  return data;
};

export const logout = async (refreshToken) => {
  await api.post('/auth/logout/', { refresh: refreshToken });
};
