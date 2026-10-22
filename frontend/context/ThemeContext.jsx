"use client";

import { createContext, useCallback, useContext, useEffect, useState } from 'react';

const STORAGE_KEY = 'seenema-theme';
const DEFAULT_THEME = 'dark';
const ThemeContext = createContext(null);

// Theme thật đã được script trong layout gắn vào <html data-theme> trước khi React chạy.
function readTheme() {
  if (typeof document === 'undefined') return DEFAULT_THEME;
  const current = document.documentElement.getAttribute('data-theme');
  return current === 'light' || current === 'dark' ? current : DEFAULT_THEME;
}

export function ThemeProvider({ children }) {
  const [theme, setThemeState] = useState(DEFAULT_THEME);

  useEffect(() => {
    setThemeState(readTheme());
  }, []);

  const setTheme = useCallback((next) => {
    if (next !== 'light' && next !== 'dark') return;
    document.documentElement.setAttribute('data-theme', next);
    try {
      window.localStorage.setItem(STORAGE_KEY, next);
    } catch {
      // Trình duyệt chặn localStorage: theme vẫn đổi trong phiên hiện tại
    }
    setThemeState(next);
  }, []);

  const toggleTheme = useCallback(() => {
    setTheme(readTheme() === 'dark' ? 'light' : 'dark');
  }, [setTheme]);

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
