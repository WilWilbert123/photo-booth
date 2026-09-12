'use client';

import { useEffect } from 'react';
import { useBoothStore } from '@/store/boothStore';

export const ThemeProvider = ({ children }: { children: React.ReactNode }) => {
  const { theme, setTheme } = useBoothStore();

  useEffect(() => {
    try {
      const savedTheme = localStorage.getItem('photobooth_theme');
      if (savedTheme === 'light' || savedTheme === 'dark') {
        if (savedTheme !== theme) {
          setTheme(savedTheme);
        }
      }
    } catch {
      // ignore
    }
  }, []);

  useEffect(() => {
    const root = document.documentElement;
    if (theme === 'dark') {
      root.classList.add('dark');
      root.style.colorScheme = 'dark';
    } else {
      root.classList.remove('dark');
      root.style.colorScheme = 'light';
    }
  }, [theme]);

  return <>{children}</>;
};
