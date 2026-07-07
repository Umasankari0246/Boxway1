import React, { useEffect } from 'react';
import { useSettingsStore } from '../store/settingsStore';

export const ThemeProvider = ({ children }) => {
  const store = useSettingsStore();
  const theme = store.preview?.theme || store.theme;
  const language = store.preview?.language || store.language;

  useEffect(() => {
    const root = document.documentElement;
    
    // Apply theme
    let activeTheme = theme;
    if (theme === 'auto') {
      activeTheme = window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
    }
    
    if (activeTheme === 'dark') {
      root.classList.add('dark');
      root.classList.remove('light');
    } else {
      root.classList.add('light');
      root.classList.remove('dark');
    }
    
    // Apply language to HTML tag
    root.setAttribute('lang', language);

  }, [theme, language]);

  return <>{children}</>;
};
