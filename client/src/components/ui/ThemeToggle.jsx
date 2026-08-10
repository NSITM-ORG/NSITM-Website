/**
 * ThemeToggle — cycles Light → Dark → Brand → Light. Placed in the
 * SiteLayout header and PanelLayout top bar.
 */

import { Sun, Moon } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ICONS = { light: Sun, dark: Moon };
const LABELS = { light: 'Light mode', dark: 'Dark mode' };
// const ICONS = { light: Sun, dark: Moon, brand: Palette };
// const LABELS = { light: 'Light mode', dark: 'Dark mode', brand: 'Brand mode' };

export const ThemeToggle = () => {
  const { theme, cycleTheme } = useTheme();
  const Icon = ICONS[theme];

  return (
    <button
      onClick={cycleTheme}
      title={`Currently ${LABELS[theme]} — click to switch`}
      aria-label="Toggle theme"
      className="rounded-full p-2 text-text-secondary transition-colors hover:bg-surface hover:text-text-primary"
    >
      <Icon size={20} />
    </button>
  );
}

export const FloatingThemeToggle = () => {
  const { theme, cycleTheme } = useTheme();
  const Icon = ICONS[theme];

  return (
    <button
      onClick={cycleTheme}
      title={`Currently ${LABELS[theme]} — click to switch`}
      aria-label="Toggle theme"
      className="
        fixed bottom-15 right-9 z-50
        rounded-full p-1.5
        bg-primary/15 text-primary
        shadow-lg backdrop-blur-lg
        border border-primary/20
        transition-all duration-200
        hover:bg-primary/25 hover:shadow-lg hover:scale-105
        active:scale-95
      "
    >
      <Icon size={35} />
    </button>
  );
}
