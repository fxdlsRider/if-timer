// services/communityService.js
import { supabase } from '../supabaseClient';
import { FASTING_LEVELS } from '../config/constants';

/**
 * Community Service
 *
 * Manages community data - active fasters, their levels, and statistics
 * Queries timer_states + profiles tables
 */

/**
 * Determine fasting level based on hours
 * @param {number} hours - Fasting hours
 * @returns {string} Level ID (e.g., 'novice', 'disciple', etc.)
 */
function getFastingLevel(hours) {
  // Find the matching level based on hour ranges from FASTING_LEVELS
  // Uses exclusive upper bounds to prevent overlapping (e.g., 18h is Intensive, not Classic)
  for (let i = 0; i < FASTING_LEVELS.length; i++) {
    const level = FASTING_LEVELS[i];
    const isLastLevel = i === FASTING_LEVELS.length - 1;

    // Parse range string like "14-16h" or "20-24h"
    const rangeMatch = level.range.match(/(\d+)-(\d+)h/);
    if (rangeMatch) {
      const min = parseInt(rangeMatch[1]);
      const max = parseInt(rangeMatch[2]);

      // Use inclusive lower bound, exclusive upper bound (except for last level)
      // Examples: [14, 16), [16, 18), [18, 20), etc.
      if (isLastLevel) {
        // Last level: inclusive upper bound (36-48h includes 48)
        if (hours >= min && hours <= max) {
          return level.id;
        }
      } else {
        // All other levels: exclusive upper bound
        if (hours >= min && hours < max) {
          return level.id;
        }
      }
    }
  }

  // Default fallbacks
  if (hours < 14) return 'novice';
  if (hours > 48) return 'sage';
  return 'disciple';
}

/**
 * Fetch all active fasters
 * Joins timer_states (is_running=true) with profiles (nickname)
 * @returns {Promise<Array>} Array of active users with nickname, hours, level
 */
export async function getActiveFasters() {
  try {
    // Query timer_states for active users
    const { data: timerStates, error: timerError } = await supabase
      .from('timer_states')
      .select('user_id, hours, is_running')
      .eq('is_running', true);

    if (timerError) {
      console.error('Error fetching timer states:', timerError);
      return [];
    }

    if (!timerStates || timerStates.length === 0) {
      return [];
    }

    // Fetch profiles for these users
    const userIds = timerStates.map(state => state.user_id);
    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, nickname')
      .in('user_id', userIds);

    if (profileError) {
      console.error('Error fetching profiles:', profileError);
      return [];
    }

    // Create a map of user_id -> nickname
    const nicknameMap = {};
    (profiles || []).forEach(profile => {
      nicknameMap[profile.user_id] = profile.nickname || 'Anonymous';
    });

    // Combine data
    const activeUsers = timerStates.map(state => {
      const hours = state.hours || 16;
      const level = getFastingLevel(hours);

      return {
        id: state.user_id,
        nickname: nicknameMap[state.user_id] || 'Anonymous',
        fastingHours: hours,
        level: level
      };
    });

    return activeUsers;
  } catch (error) {
    console.error('Error in getActiveFasters:', error);
    return [];
  }
}

/**
 * Get community statistics
 * @returns {Promise<object>} Stats: totalActive, byLevel
 */
export async function getCommunityStats() {
  try {
    const activeUsers = await getActiveFasters();

    // Group by level
    const byLevel = {};
    FASTING_LEVELS.forEach(level => {
      byLevel[level.id] = 0;
    });

    activeUsers.forEach(user => {
      if (byLevel[user.level] !== undefined) {
        byLevel[user.level]++;
      }
    });

    return {
      totalActive: activeUsers.length,
      byLevel: byLevel
    };
  } catch (error) {
    console.error('Error in getCommunityStats:', error);
    return {
      totalActive: 0,
      byLevel: {}
    };
  }
}
