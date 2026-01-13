/**
 * Application Constants
 *
 * All magic numbers, configuration values, and static data.
 * Single source of truth for app-wide constants.
 */

// ===== FEATURE FLAGS =====

export const FEATURE_FLAGS = {
  LEARN_ENABLED: false, // Learn page (training)
  MODES_ENABLED: false, // App Modes page (scientific, hippie, pro)
  SUPPORT_ENABLED: false, // Support page (Buy Me a Coffee, Shop)
  LANGUAGE_DETECTION_ENABLED: false, // Auto-detect browser language (German/English)
};

// ===== TIMER CONFIGURATION =====

export const TIMER_CONSTANTS = {
  MIN_HOURS: 14,
  MAX_HOURS: 48,
  DEFAULT_HOURS: 16,
  HOUR_RANGE: 34, // MAX_HOURS - MIN_HOURS
  DEFAULT_ANGLE: 21.2,
  MINIMUM_FAST_HOURS: 14, // Minimum hours to count as successful fast (even if goal not reached)
};

export const TEST_MODE = {
  ENABLED: false, // Change to false for production!
  TIME_MULTIPLIER: 1, // 1 second = 1 unit in test mode
  TIME_UNIT: 'seconds',
};

export const PRODUCTION_MODE = {
  TIME_MULTIPLIER: 3600, // 1 hour = 3600 seconds
  TIME_UNIT: 'hours',
};

// ===== CIRCLE/UI CONSTANTS =====

export const CIRCLE_CONFIG = {
  RADIUS: 96,
  HANDLE_RADIUS: 70, // Moved 15px outward (55 + 15)
  CENTER_X: 112,
  CENTER_Y: 112,
  OUTER_RADIUS: 104,
  CONTAINER_SIZE: 224,
};

// ===== FASTING LEVELS =====

export const FASTING_LEVELS = [
  {
    id: 'novice',
    range: '14-16h',
    label: 'Novice',
    startHour: 14,
    endHour: 16,
    color: '#4CAF50',
    title: 'NOVICE',
    description: 'Building healthy habits, one fast at a time.',
  },
  {
    id: 'disciple',
    range: '16-18h',
    label: 'Disciple',
    startHour: 16,
    endHour: 18,
    color: '#2196F3',
    title: 'DISCIPLE',
    description: 'This is the gold standard. You nailed it.',
  },
  {
    id: 'champion',
    range: '18-20h',
    label: 'Champion',
    startHour: 18,
    endHour: 20,
    color: '#FF9800',
    title: 'CHAMPION',
    description: "Most people can't do this. You're not most people. Bro-Mode: ideal for OMAD.",
  },
  {
    id: 'warrior',
    range: '20-24h',
    label: 'Warrior',
    startHour: 20,
    endHour: 24,
    color: '#F44336',
    title: 'WARRIOR',
    description: 'Discipline. Focus. Power. This is mastery.',
  },
  {
    id: 'monk',
    range: '24-36h',
    label: 'Monk',
    startHour: 24,
    endHour: 36,
    color: '#9C27B0',
    title: 'MONK',
    description: 'Few reach this level. You have transcended.',
  },
  {
    id: 'sage',
    range: '36+h',
    label: 'Sage',
    startHour: 36,
    endHour: 48,
    color: '#FFD700',
    title: 'SAGE',
    description: "This is legendary. You've earned your place.",
  },
];

// ===== BODY MODES =====

export const BODY_MODES = [
  {
    id: 'digesting',
    range: '0-4h',
    label: 'Digesting',
    description: 'Your body is processing food and absorbing nutrients',
    tip: 'Stay hydrated and rest. Your body is working hard to digest.',
  },
  {
    id: 'getting-ready',
    range: '4-12h',
    label: 'Getting ready',
    description: 'Transitioning to fat-burning mode',
    tip: 'Drink water or herbal tea. Light activity helps the transition.',
  },
  {
    id: 'fat-burning',
    range: '12-18h',
    label: 'Fat burning',
    description: 'Your body is burning stored fat for energy',
    tip: 'Perfect time for exercise! Your body is using fat for fuel.',
  },
  {
    id: 'cell-renewal',
    range: '18-24h',
    label: 'Cell renewal',
    description: 'Autophagy begins - cellular cleanup and repair',
    tip: 'Meditation and rest support cellular repair. Stay calm and hydrated.',
  },
  {
    id: 'deep-healing',
    range: '24+h',
    label: 'Deep healing',
    description: 'Maximum autophagy and cellular regeneration',
    tip: 'Deep rest and mindfulness. Your body is in maximum healing mode.',
  },
];

// ===== PROGRESS COLORS =====

export const PROGRESS_COLORS = {
  0: '#d32f2f',   // 0-25%: Red
  25: '#f57c00',  // 25-50%: Orange
  50: '#388e3c',  // 50-75%: Green
  75: '#1976d2',  // 75-100%: Blue
  100: '#7b1fa2', // 100%+: Purple
};

/**
 * Get progress color based on percentage
 * @param {number} progress - Progress percentage (0-100)
 * @returns {string} Hex color code
 */
export const getProgressColor = (progress) => {
  if (progress < 25) return PROGRESS_COLORS[0];
  if (progress < 50) return PROGRESS_COLORS[25];
  if (progress < 75) return PROGRESS_COLORS[50];
  if (progress < 100) return PROGRESS_COLORS[75];
  return PROGRESS_COLORS[100];
};

// ===== NOTIFICATION SETTINGS =====

export const NOTIFICATION_CONFIG = {
  ICON: '/favicon.ico',
  TAG: 'if-timer-complete',
  PERMISSION_REQUEST_DELAY: 0, // ms to wait before requesting permission
  RESET_FLAG_DELAY: 5000, // ms before notification can show again
};

// ===== AUDIO SETTINGS =====

export const AUDIO_CONFIG = {
  COMPLETION_MELODY: [
    { frequency: 523.25, duration: 0.15, delay: 0 },      // C5
    { frequency: 659.25, duration: 0.15, delay: 0.15 },   // E5
    { frequency: 783.99, duration: 0.3, delay: 0.3 },     // G5
  ],
  GAIN: 0.3,
  FADE_OUT_DURATION: 0.3,
};

// ===== CELEBRATION SCREEN SETTINGS =====

export const CELEBRATION_CONFIG = {
  FADE_IN_DURATION: 300, // ms
  AUTO_HIDE_DELAY: null, // ms, null = never auto-hide
  Z_INDEX: 10000,
};

// ===== STORAGE KEYS =====

export const STORAGE_KEYS = {
  TIMER_STATE: 'ifTimerState',
  THEME_PREFERENCE: 'theme-preference',
  USER_SETTINGS: 'if-timer-settings',
};

// ===== API/REALTIME CHANNELS =====

export const SUPABASE_CHANNELS = {
  TIMER_CHANGES: 'timer_changes',
  SOCIAL_FEED: 'social_feed',
};

// ===== RESPONSIVE BREAKPOINTS =====

export const BREAKPOINTS = {
  MOBILE: 768,
  TABLET: 1024,
  DESKTOP: 1440,
};

// ===== ANIMATION DURATIONS =====

export const ANIMATIONS = {
  QUICK: 150,   // ms
  NORMAL: 300,  // ms
  SLOW: 500,    // ms
};
