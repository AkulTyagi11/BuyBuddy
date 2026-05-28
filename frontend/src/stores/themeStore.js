import { create } from 'zustand';

const DEFAULT_THEME = 'market';

const getStoredTheme = () => {
  if (typeof window === 'undefined') {
    return DEFAULT_THEME;
  }
  return window.localStorage.getItem('theme') || DEFAULT_THEME;
};

const applyTheme = (theme) => {
  if (typeof document !== 'undefined') {
    document.documentElement.dataset.theme = theme;
  }
};

const useThemeStore = create((set) => ({
  theme: getStoredTheme(),
  setTheme: (theme) => {
    applyTheme(theme);
    if (typeof window !== 'undefined') {
      window.localStorage.setItem('theme', theme);
    }
    set({ theme });
  },
  initTheme: () => {
    const theme = getStoredTheme();
    applyTheme(theme);
    set({ theme });
  },
}));

export default useThemeStore;
