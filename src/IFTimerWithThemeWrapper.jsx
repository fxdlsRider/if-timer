import React, { useEffect } from 'react';
import { useTheme } from './ThemeContext';
import { getThemeColors } from './themeConfig';
import IFTimerFinal from './IFTimerFinal';

const IFTimerWithThemeWrapper = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme === 'dark');

  // Apply theme colors as CSS variables
  useEffect(() => {
    const root = document.documentElement;
    
    root.style.setProperty('--color-background', colors.background);
    root.style.setProperty('--color-background-secondary', colors.backgroundSecondary);
    root.style.setProperty('--color-text', colors.text);
    root.style.setProperty('--color-text-secondary', colors.textSecondary);
    root.style.setProperty('--color-text-tertiary', colors.textTertiary);
    root.style.setProperty('--color-border', colors.border);
    root.style.setProperty('--color-border-subtle', colors.borderSubtle);
    root.style.setProperty('--color-ring-background', colors.ringBackground);
    root.style.setProperty('--color-accent-teal', colors.accentTeal);
    root.style.setProperty('--color-accent-red', colors.accentRed);
    root.style.setProperty('--color-accent-green', colors.accentGreen);
    root.style.setProperty('--color-accent-orange', colors.accentOrange);
    root.style.setProperty('--color-accent-yellow', colors.accentYellow);
    root.style.setProperty('--color-accent-purple', colors.accentPurple);
  }, [colors]);

  return (
    <div style={{
      background: colors.background,
      minHeight: '100vh',
      color: colors.text
    }}>
      <IFTimerFinal />
    </div>
  );
};

export default IFTimerWithThemeWrapper;
