/**
 * Achievement Definitions
 *
 * Centralized achievement system with extensible structure.
 * Each achievement has:
 * - id: Unique identifier
 * - icon: Emoji icon
 * - label: Display name
 * - description: Achievement description
 * - checkCondition: Function to determine if achievement is earned
 */

/**
 * All available achievements
 * Add new achievements here to extend the system
 */
export const ACHIEVEMENT_DEFINITIONS = {
  'first-fast': {
    id: 'first-fast',
    icon: '🎯',
    label: 'First Fast',
    description: 'Complete your first fast',
    /**
     * Check if achievement should be awarded
     * @param {object} userStats - User statistics (totalFasts, longestFast, etc.)
     * @param {object} currentFast - The fast that was just completed
     * @returns {boolean} True if achievement earned
     */
    checkCondition: (userStats, currentFast) => {
      return userStats.totalFasts === 1;
    }
  },

  '16h-fast': {
    id: '16h-fast',
    icon: '⏰',
    label: '16h Fast',
    description: 'Complete a 16-hour fast',
    checkCondition: (userStats, currentFast) => {
      // Check if this fast OR any previous fast was >= 16h
      return currentFast.duration >= 16;
    }
  },

  // === TEMPLATE FOR FUTURE ACHIEVEMENTS ===
  // Copy this template to add new achievements:
  //
  // 'achievement-id': {
  //   id: 'achievement-id',
  //   icon: '🏆',
  //   label: 'Achievement Label',
  //   description: 'Achievement description',
  //   checkCondition: (userStats, currentFast) => {
  //     // Return true if achievement earned
  //     // userStats contains: totalFasts, currentStreak, totalHours, longestFast, averageFast
  //     // currentFast contains: duration, originalGoal, cancelled, unit
  //     return false;
  //   }
  // },
};

/**
 * Get all achievement definitions as array
 * @returns {array} Array of achievement definitions
 */
export function getAllAchievements() {
  return Object.values(ACHIEVEMENT_DEFINITIONS);
}

/**
 * Get achievement by ID
 * @param {string} achievementId - Achievement ID
 * @returns {object|null} Achievement definition or null
 */
export function getAchievementById(achievementId) {
  return ACHIEVEMENT_DEFINITIONS[achievementId] || null;
}
