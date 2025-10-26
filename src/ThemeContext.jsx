import React, { createContext, useContext, useState, useEffect } from 'react';

const ThemeContext = createContext();

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within ThemeProvider');
  }
  return context;
};

export const ThemeProvider = ({ children }) => {
  // Check localStorage for saved preference
  const getSavedTheme = () => {
    if (typeof window === 'undefined') return 'auto';
    return localStorage.getItem('theme-preference') || 'auto';
  };

  // Detect system preference
  const getSystemTheme = () => {
    if (typeof window === 'undefined') return 'light';
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  const [themePreference, setThemePreference] = useState(getSavedTheme());
  const [systemTheme, setSystemTheme] = useState(getSystemTheme());

  // Actual theme to use
  const activeTheme = themePreference === 'auto' ? systemTheme : themePreference;

  // Listen to system theme changes
  useEffect(() => {
    if (typeof window === 'undefined') return;

    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    
    const handleChange = (e) => {
      setSystemTheme(e.matches ? 'dark' : 'light');
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, []);

  // Save preference to localStorage
  const setTheme = (newTheme) => {
    setThemePreference(newTheme);
    if (typeof window !== 'undefined') {
      localStorage.setItem('theme-preference', newTheme);
    }
  };

  const value = {
    theme: activeTheme, // 'light' or 'dark'
    themePreference, // 'auto', 'light', or 'dark'
    setTheme,
    isDark: activeTheme === 'dark'
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
};
