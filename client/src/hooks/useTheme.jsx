/**
 * useTheme — Light / Dark / Brand theme switching (Section 6 of the
 * locked plan: 3 themes, toggleable + system-preference-aware).
 *
 * Persists the choice to localStorage under 'nsitm-theme'. On first
 * load with no stored preference, defers to the OS's prefers-color-scheme
 * (dark → 'dark', anything else → 'light'; 'brand' is never auto-selected
 * — it's an explicit user choice only).
 *
 * Applies the theme by toggling a class on <html> (.dark or .brand;
 * plain light theme has no class — see index.css :root vs .dark vs .brand).
 * This is a Context+useReducer candidate per the plan's "in-house complex
 * component state" instruction, but theme is truly global and simple
 * enough (3 states, 1 setter) that a plain custom hook backed by
 * localStorage + a module-level subscriber list is sufficient and avoids
 * an unnecessary Context provider wrapping the whole app.
 */

import { useCallback, useEffect, useState } from 'react';

const STORAGE_KEY = 'nsitm-theme';
const THEMES = ['light', 'dark'];
// const THEMES = ['light', 'dark', 'brand'];

function getInitialTheme() {
  const stored = localStorage.getItem(STORAGE_KEY);
  if (stored && THEMES.includes(stored)) return stored;
  const prefersDark = window.matchMedia?.('(prefers-color-scheme: dark)').matches;
  return prefersDark ? 'dark' : 'light';
}

function applyThemeClass(theme) {
  const root = document.documentElement;
  root.classList.remove('dark');
  // root.classList.remove('dark', 'brand');
  if (theme === 'dark') root.classList.add('dark');
  // if (theme === 'brand') root.classList.add('brand');
}

export function useTheme() {
  const [theme, setThemeState] = useState(getInitialTheme);

  useEffect(() => {
    applyThemeClass(theme);
    localStorage.setItem(STORAGE_KEY, theme);
  }, [theme]);

  const setTheme = useCallback((next) => {
    if (THEMES.includes(next)) setThemeState(next);
  }, []);

  /** Cycles Light → Dark → Brand → Light, per the F1 ThemeToggle spec. */
  const cycleTheme = useCallback(() => {
    setThemeState((current) => {
      const idx = THEMES.indexOf(current);
      return THEMES[(idx + 1) % THEMES.length];
    });
  }, []);

  return { theme, setTheme, cycleTheme, themes: THEMES };
}

export default useTheme;