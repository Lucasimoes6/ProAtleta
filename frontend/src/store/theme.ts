import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Theme = 'light' | 'dark';

interface ThemeState {
  theme: Theme;
  toggle: () => void;
  set: (t: Theme) => void;
}

function initialTheme(): Theme {
  // Sistema operacional decide a primeira vez. Persist override depois.
  if (typeof window === 'undefined') return 'dark';
  return window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
}

export const useThemeStore = create<ThemeState>()(
  persist(
    (set, get) => ({
      theme: initialTheme(),
      toggle: () => set({ theme: get().theme === 'dark' ? 'light' : 'dark' }),
      set: (t) => set({ theme: t }),
    }),
    {
      name: 'athlete-theme',
      onRehydrateStorage: () => (state) => {
        if (state) applyTheme(state.theme);
      },
    },
  ),
);

export function applyTheme(theme: Theme) {
  if (typeof document === 'undefined') return;
  document.documentElement.dataset.theme = theme;
}

// Aplica imediatamente o tema inicial — evita "flash" de tema errado no boot.
if (typeof window !== 'undefined') {
  applyTheme(useThemeStore.getState().theme);
  useThemeStore.subscribe((s) => applyTheme(s.theme));
}
