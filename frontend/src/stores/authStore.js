import { create } from 'zustand';
import * as authService from '../services/authService';

const useAuthStore = create((set) => ({
  user: JSON.parse(localStorage.getItem('user') || 'null'),
  tokens: JSON.parse(localStorage.getItem('tokens') || 'null'),
  isAuthenticated: !!localStorage.getItem('tokens'),
  loading: false,
  error: null,

  login: async (username, password) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.login(username, password);
      const tokens = { access: data.access, refresh: data.refresh };
      localStorage.setItem('tokens', JSON.stringify(tokens));
      // Fetch user profile after login
      const user = await authService.getProfile();
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, tokens, isAuthenticated: true, loading: false });
    } catch (err) {
      const message =
        err.response?.data?.detail || 'Invalid credentials. Please try again.';
      set({ error: message, loading: false });
      throw err;
    }
  },

  register: async (userData) => {
    set({ loading: true, error: null });
    try {
      const data = await authService.register(userData);
      const tokens = data.tokens;
      const user = data.user;
      localStorage.setItem('tokens', JSON.stringify(tokens));
      localStorage.setItem('user', JSON.stringify(user));
      set({ user, tokens, isAuthenticated: true, loading: false });
    } catch (err) {
      const errors = err.response?.data;
      let message = 'Registration failed.';
      if (errors) {
        const firstKey = Object.keys(errors)[0];
        const firstError = errors[firstKey];
        message = Array.isArray(firstError) ? firstError[0] : firstError;
      }
      set({ error: message, loading: false });
      throw err;
    }
  },

  logout: async () => {
    const tokens = JSON.parse(localStorage.getItem('tokens') || 'null');
    try {
      if (tokens?.refresh) {
        await authService.logout(tokens.refresh);
      }
    } catch {
      // ignore logout errors
    }
    localStorage.removeItem('tokens');
    localStorage.removeItem('user');
    set({ user: null, tokens: null, isAuthenticated: false });
  },

  clearError: () => set({ error: null }),
}));

export default useAuthStore;
