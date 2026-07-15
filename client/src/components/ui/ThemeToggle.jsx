/**
 * ThemeToggle — cycles Light → Dark → Brand → Light. Placed in the
 * SiteLayout header and PanelLayout top bar.
 */

import { Sun, Moon, Palette } from 'lucide-react';
import { useTheme } from '../../hooks/useTheme';

const ICONS = { light: Sun, dark: Moon, brand: Palette };
const LABELS = { light: 'Light mode', dark: 'Dark mode', brand: 'Brand mode' };

export function ThemeToggle() {
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

export default ThemeToggle;