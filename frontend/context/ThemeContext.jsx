"use client";

import { createContext, useCallback, useContext, useEffect, useState } from 'react';
import { themes, DEFAULT_THEME } from '@/styles/themes';

const STORAGE_KEY = 'seenema-theme';
const ThemeContext = createContext(null);

export function ThemeProvider({ children }) {
  const [theme, setTheme] = useState(DEFAULT_THEME);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === 'light' || saved === 'dark') {
      setTheme(saved);
    } else if (window.matchMedia?.('(prefers-color-scheme: light)').matches) {
      setTheme('light');
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;

    const root = document.documentElement;
    const tokens = themes[theme] || themes[DEFAULT_THEME];

    Object.entries(tokens).forEach(([key, value]) => {
      root.style.setProperty(key, value);
    });

    root.style.colorScheme = theme;
    root.setAttribute('data-theme', theme);
    window.localStorage.setItem(STORAGE_KEY, theme);
  }, [theme, hydrated]);

  const toggleTheme = useCallback(() => {
    setTheme((prev) => (prev === 'dark' ? 'light' : 'dark'));
  }, []);

  return (
    <ThemeContext.Provider value={{ theme, setTheme, toggleTheme }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  const ctx = useContext(ThemeContext);
  if (!ctx) {
    throw new Error('useTheme phải được gọi bên trong ThemeProvider');
  }
  return ctx;
}