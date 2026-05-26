import { useThemeStore } from '@/store/theme';

export function ThemeToggle() {
  const theme = useThemeStore((s) => s.theme);
  const toggle = useThemeStore((s) => s.toggle);
  const isDark = theme === 'dark';

  return (
    <button
      type="button"
      onClick={toggle}
      className="theme-toggle"
      title={isDark ? 'Mudar para tema claro' : 'Mudar para tema escuro'}
      aria-label="Alternar tema"
    >
      <span className="theme-toggle-icon">{isDark ? '☀' : '☾'}</span>
      <span className="theme-toggle-label">{isDark ? 'Claro' : 'Escuro'}</span>
    </button>
  );
}
