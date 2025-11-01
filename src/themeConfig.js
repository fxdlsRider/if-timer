// Theme configuration for light and dark modes
// Fitness Energy + Steve Jobs Minimal design

export const themes = {
  light: {
    // Backgrounds
    background: '#FFFFFF',
    backgroundSecondary: '#F8FAFC',
    
    // Text
    text: '#0F172A',
    textSecondary: '#64748B',
    textTertiary: '#94A3B8',
    
    // Borders
    border: '#E2E8F0',
    borderSubtle: '#F1F5F9',
    
    // Ring
    ringBackground: '#F1F5F9',
    
    // Accents (same in both themes)
    accentTeal: '#4ECDC4',
    accentRed: '#FF6B6B',
    accentGreen: '#34C759',
    accentOrange: '#FF9500',
    accentYellow: '#FFE66D',
    accentPurple: '#A855F7',
    
    // Celebration level colors
    levelGentle: '#34C759',
    levelClassic: '#007AFF',
    levelIntensive: '#FF9500',
    levelWarrior: '#FF3B30',
    levelMonk: '#AF52DE',
    levelLegend: '#FFD60A'
  },
  
  dark: {
    // Backgrounds
    background: '#1F1F1F',
    backgroundSecondary: '#2D2D2D',
    
    // Text
    text: '#F8FAFC',
    textSecondary: '#94A3B8',
    textTertiary: '#64748B',
    
    // Borders
    border: '#3A3A3A',
    borderSubtle: '#2D2D2D',

    // Ring
    ringBackground: '#2D2D2D',
    
    // Accents (same in both themes)
    accentTeal: '#4ECDC4',
    accentRed: '#FF6B6B',
    accentGreen: '#6BCF7F',
    accentOrange: '#FF9500',
    accentYellow: '#FFE66D',
    accentPurple: '#A855F7',
    
    // Celebration level colors
    levelGentle: '#6BCF7F',
    levelClassic: '#4A90E2',
    levelIntensive: '#FF9F43',
    levelWarrior: '#FF3838',
    levelMonk: '#A855F7',
    levelLegend: '#FFD700'
  }
};

// Helper to get current theme colors
export const getThemeColors = (isDark) => {
  return isDark ? themes.dark : themes.light;
};
