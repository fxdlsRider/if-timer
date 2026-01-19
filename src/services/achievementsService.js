// services/achievementsService.js
import { getAllAchievements, getAchievementById } from '../config/achievements';

/**
 * Achievements Service
 *
 * Manages user achievements using localStorage.
 * Can be extended to use Supabase in the future.
 *
 * Storage format:
 * {
 *   userId: {
 *     'first-fast': { earnedAt: '2024-01-15T10:30:00Z' },
 *     '16h-fast': { earnedAt: '2024-01-16T12:00:00Z' }
 *   }
 * }
 */

const STORAGE_KEY = 'if-timer-achievements';

/**
 * Get all earned achievements for a user
 * @param {string} userId - User ID
 * @returns {object} Map of earned achievements { achievementId: { earnedAt } }
 */
export function getEarnedAchievements(userId) {
  if (!userId) return {};

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return {};

    const allAchievements = JSON.parse(stored);
    return allAchievements[userId] || {};
  } catch (error) {
    console.error('Error loading achievements:', error);
    return {};
  }
}

/**
 * Check if user has earned a specific achievement
 * @param {string} userId - User ID
 * @param {string} achievementId - Achievement ID
 * @returns {boolean} True if achievement is earned
 */
export function hasAchievement(userId, achievementId) {
  const earned = getEarnedAchievements(userId);
  return !!earned[achievementId];
}

/**
 * Award an achievement to a user
 * @param {string} userId - User ID
 * @param {string} achievementId - Achievement ID
 * @returns {boolean} True if achievement was newly awarded, false if already earned
 */
export function awardAchievement(userId, achievementId) {
  if (!userId || !achievementId) return false;

  // Check if already earned
  if (hasAchievement(userId, achievementId)) {
    return false;
  }

  try {
    // Load all achievements
    const stored = localStorage.getItem(STORAGE_KEY);
    const allAchievements = stored ? JSON.parse(stored) : {};

    // Ensure user object exists
    if (!allAchievements[userId]) {
      allAchievements[userId] = {};
    }

    // Award achievement
    allAchievements[userId][achievementId] = {
      earnedAt: new Date().toISOString()
    };

    // Save to localStorage
    localStorage.setItem(STORAGE_KEY, JSON.stringify(allAchievements));

    console.log(`🏆 Achievement earned: ${achievementId}`);
    return true;
  } catch (error) {
    console.error('Error awarding achievement:', error);
    return false;
  }
}

/**
 * Get all achievements with earned status for a user
 * @param {string} userId - User ID
 * @returns {array} Array of achievements with earned status
 */
export function getAchievementsWithStatus(userId) {
  const allAchievements = getAllAchievements();
  const earnedAchievements = getEarnedAchievements(userId);

  return allAchievements.map(achievement => ({
    ...achievement,
    earned: !!earnedAchievements[achievement.id],
    earnedAt: earnedAchievements[achievement.id]?.earnedAt || null
  }));
}

/**
 * Check for newly earned achievements based on completed fast
 * Returns array of newly earned achievement IDs
 * @param {string} userId - User ID
 * @param {object} userStats - Current user statistics
 * @param {object} completedFast - The fast that was just completed
 * @returns {array} Array of newly earned achievement IDs
 */
export function checkAchievements(userId, userStats, completedFast) {
  if (!userId || !userStats || !completedFast) return [];

  const allAchievements = getAllAchievements();
  const newlyEarned = [];

  for (const achievement of allAchievements) {
    // Skip if already earned
    if (hasAchievement(userId, achievement.id)) {
      continue;
    }

    // Check if condition is met
    try {
      const isEarned = achievement.checkCondition(userStats, completedFast);
      if (isEarned) {
        const awarded = awardAchievement(userId, achievement.id);
        if (awarded) {
          newlyEarned.push(achievement.id);
        }
      }
    } catch (error) {
      console.error(`Error checking achievement ${achievement.id}:`, error);
    }
  }

  return newlyEarned;
}

/**
 * Get achievement progress statistics
 * @param {string} userId - User ID
 * @returns {object} Progress stats { earned, total, percentage }
 */
export function getAchievementProgress(userId) {
  const allAchievements = getAllAchievements();
  const earnedAchievements = getEarnedAchievements(userId);

  const earned = Object.keys(earnedAchievements).length;
  const total = allAchievements.length;
  const percentage = total > 0 ? Math.round((earned / total) * 100) : 0;

  return { earned, total, percentage };
}

/**
 * Backfill achievements based on historical fasts
 * Checks all past fasts and awards missing achievements
 * @param {string} userId - User ID
 * @param {object} userStats - Current user statistics
 * @param {array} allFasts - All historical fasts
 * @returns {array} Array of newly awarded achievement IDs
 */
export function backfillAchievements(userId, userStats, allFasts) {
  if (!userId || !userStats || !allFasts) {
    return [];
  }

  const allAchievements = getAllAchievements();
  const newlyAwarded = [];

  for (const achievement of allAchievements) {
    // Skip if already earned
    if (hasAchievement(userId, achievement.id)) {
      continue;
    }

    // Check achievement against all historical fasts
    try {
      let shouldAward = false;

      // Check if any historical fast satisfies the condition
      for (const fast of allFasts) {
        const fastData = {
          duration: fast.unit === 'seconds' ? fast.duration / 3600 : fast.duration,
          originalGoal: fast.original_goal,
          cancelled: fast.cancelled || false,
          unit: fast.unit || 'hours'
        };

        if (achievement.checkCondition(userStats, fastData)) {
          shouldAward = true;
          break;
        }
      }

      if (shouldAward) {
        const awarded = awardAchievement(userId, achievement.id);
        if (awarded) {
          newlyAwarded.push(achievement.id);
        }
      }
    } catch (error) {
      console.error(`Error backfilling achievement ${achievement.id}:`, error);
    }
  }

  return newlyAwarded;
}

/**
 * Reset all achievements for a user (for testing)
 * @param {string} userId - User ID
 */
export function resetAchievements(userId) {
  if (!userId) return;

  try {
    const stored = localStorage.getItem(STORAGE_KEY);
    if (!stored) return;

    const allAchievements = JSON.parse(stored);
    delete allAchievements[userId];

    localStorage.setItem(STORAGE_KEY, JSON.stringify(allAchievements));
    console.log('✅ Achievements reset');
  } catch (error) {
    console.error('Error resetting achievements:', error);
  }
}
