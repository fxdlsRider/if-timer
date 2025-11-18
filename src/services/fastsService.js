// services/fastsService.js
import { supabase } from '../supabaseClient';

/**
 * Save a completed fast to the database
 * @param {string} userId - User ID
 * @param {object} fastData - Fast data
 * @returns {object|null} Saved fast or null on error
 */
export async function saveFast(userId, fastData) {
  try {
    const { data, error } = await supabase
      .from('fasts')
      .insert({
        user_id: userId,
        start_time: fastData.startTime,
        end_time: fastData.endTime,
        original_goal: fastData.originalGoal,
        duration: fastData.duration,
        cancelled: fastData.cancelled || false,
        unit: fastData.unit || 'hours'
      })
      .select()
      .single();

    if (error) {
      console.error('Error saving fast:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in saveFast:', error);
    return null;
  }
}

/**
 * Get all fasts for a user
 * @param {string} userId - User ID
 * @param {number} limit - Maximum number of fasts to return
 * @returns {array} Array of fasts
 */
export async function getFasts(userId, limit = 50) {
  try {
    const { data, error } = await supabase
      .from('fasts')
      .select('*')
      .eq('user_id', userId)
      .order('end_time', { ascending: false })
      .limit(limit);

    if (error) {
      console.error('Error fetching fasts:', error);
      return [];
    }

    return data || [];
  } catch (error) {
    console.error('Error in getFasts:', error);
    return [];
  }
}

/**
 * Get the last completed fast for a user
 * @param {string} userId - User ID
 * @returns {object|null} Last fast or null
 */
export async function getLastFast(userId) {
  try {
    const { data, error } = await supabase
      .from('fasts')
      .select('*')
      .eq('user_id', userId)
      .order('end_time', { ascending: false })
      .limit(1)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // No rows found
        return null;
      }
      console.error('Error fetching last fast:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in getLastFast:', error);
    return null;
  }
}

/**
 * Calculate statistics for a user
 * @param {string} userId - User ID
 * @returns {object} Statistics object
 */
export async function getStatistics(userId) {
  try {
    const fasts = await getFasts(userId, 1000); // Get all fasts for calculations

    if (!fasts || fasts.length === 0) {
      return {
        totalFasts: 0,
        currentStreak: 0,
        totalHours: 0,
        longestFast: 0,
        averageFast: 0
      };
    }

    // Total fasts
    const totalFasts = fasts.length;

    // Total hours (convert to hours if unit is seconds)
    const totalHours = fasts.reduce((sum, fast) => {
      const hours = fast.unit === 'seconds' ? fast.duration / 3600 : fast.duration;
      return sum + (hours || 0);
    }, 0);

    // Longest fast (in hours)
    const longestFast = Math.max(...fasts.map(f => {
      return f.unit === 'seconds' ? f.duration / 3600 : f.duration;
    }));

    // Average fast
    const averageFast = totalHours / totalFasts;

    // Current streak (consecutive days with at least one fast)
    const currentStreak = calculateStreak(fasts);

    return {
      totalFasts,
      currentStreak,
      totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
      longestFast: Math.round(longestFast * 10) / 10,
      averageFast: Math.round(averageFast * 10) / 10
    };
  } catch (error) {
    console.error('Error in getStatistics:', error);
    return {
      totalFasts: 0,
      currentStreak: 0,
      totalHours: 0,
      longestFast: 0,
      averageFast: 0
    };
  }
}

/**
 * Calculate current streak (consecutive days with fasts)
 * @param {array} fasts - Array of fasts (sorted by end_time desc)
 * @returns {number} Current streak in days
 */
function calculateStreak(fasts) {
  if (!fasts || fasts.length === 0) return 0;

  const today = new Date();
  today.setHours(0, 0, 0, 0);

  let streak = 0;
  let currentDate = new Date(today);

  // Group fasts by date
  const fastsByDate = new Map();
  fasts.forEach(fast => {
    const fastDate = new Date(fast.end_time);
    fastDate.setHours(0, 0, 0, 0);
    const dateKey = fastDate.getTime();

    if (!fastsByDate.has(dateKey)) {
      fastsByDate.set(dateKey, []);
    }
    fastsByDate.get(dateKey).push(fast);
  });

  // Check consecutive days backwards from today
  while (true) {
    const dateKey = currentDate.getTime();

    if (fastsByDate.has(dateKey)) {
      streak++;
      currentDate.setDate(currentDate.getDate() - 1);
    } else {
      // If it's today and no fast yet, check yesterday
      if (streak === 0 && currentDate.getTime() === today.getTime()) {
        currentDate.setDate(currentDate.getDate() - 1);
        continue;
      }
      break;
    }
  }

  return streak;
}

/**
 * Delete a fast
 * @param {string} fastId - Fast ID
 * @returns {boolean} Success status
 */
export async function deleteFast(fastId) {
  try {
    const { error } = await supabase
      .from('fasts')
      .delete()
      .eq('id', fastId);

    if (error) {
      console.error('Error deleting fast:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Error in deleteFast:', error);
    return false;
  }
}
