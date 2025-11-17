// services/fastsService.js
import { supabase } from '../supabaseClient';

/**
 * Save a completed fast to the database
 * @param {string} userId - User ID
 * @param {object} fastData - Fast completion data
 * @returns {Promise<object>} Saved fast record
 */
export async function saveFast(userId, fastData) {
  if (!userId) {
    console.warn('Cannot save fast: user not logged in');
    return null;
  }

  try {
    // Check for duplicate (same user, start_time, and duration)
    const startTimeISO = fastData.startTime.toISOString();
    const durationValue = parseFloat(fastData.duration);

    const { data: existingFasts, error: checkError } = await supabase
      .from('fasts')
      .select('id')
      .eq('user_id', userId)
      .eq('start_time', startTimeISO)
      .eq('duration', durationValue)
      .limit(1);

    if (checkError) throw checkError;

    if (existingFasts && existingFasts.length > 0) {
      console.warn('Duplicate fast detected - skipping save:', {
        userId,
        startTime: startTimeISO,
        duration: durationValue
      });
      return existingFasts[0]; // Return existing fast instead of creating duplicate
    }

    // No duplicate found, proceed with insert
    const { data, error } = await supabase
      .from('fasts')
      .insert([
        {
          user_id: userId,
          duration: durationValue,
          original_goal: fastData.originalGoal,
          start_time: startTimeISO,
          end_time: fastData.endTime.toISOString(),
          cancelled: fastData.cancelled || false,
          unit: fastData.unit || 'hours',
        },
      ])
      .select()
      .single();

    if (error) throw error;
    console.log('✅ Fast saved successfully:', data.id);
    return data;
  } catch (error) {
    console.error('Error saving fast:', error);
    throw error;
  }
}

/**
 * Load all fasts for a user
 * @param {string} userId - User ID
 * @returns {Promise<array>} Array of fast records
 */
export async function loadFasts(userId) {
  if (!userId) {
    return [];
  }

  try {
    const { data, error } = await supabase
      .from('fasts')
      .select('*')
      .eq('user_id', userId)
      .order('end_time', { ascending: false });

    if (error) throw error;
    return data || [];
  } catch (error) {
    console.error('Error loading fasts:', error);
    return [];
  }
}

/**
 * Calculate statistics from fasts data
 * @param {array} fasts - Array of fast records
 * @returns {object} Statistics object
 */
export function calculateStatistics(fasts) {
  if (!fasts || fasts.length === 0) {
    return {
      totalFasts: 0,
      totalHours: 0,
      longestFast: 0,
      currentStreak: 0,
      averageFast: 0,
    };
  }

  const totalFasts = fasts.length;
  const totalHours = fasts.reduce((sum, fast) => sum + parseFloat(fast.duration || 0), 0);
  const longestFast = Math.max(...fasts.map(fast => parseFloat(fast.duration || 0)));
  const averageFast = totalHours / totalFasts;

  // Debug logging
  console.log('🔍 calculateStatistics DEBUG:');
  console.log('  Fasts array:', fasts.map(f => ({ duration: f.duration, start: f.start_time, end: f.end_time })));
  console.log('  Total Fasts:', totalFasts);
  console.log('  Individual durations:', fasts.map(f => parseFloat(f.duration || 0)));
  console.log('  Sum (totalHours):', totalHours);
  console.log('  Max (longestFast):', longestFast);
  console.log('  Average (totalHours / totalFasts):', averageFast);
  console.log('  L+A:', longestFast + averageFast);

  // Calculate current streak (consecutive days with fasts)
  const sortedFasts = [...fasts].sort((a, b) =>
    new Date(b.end_time) - new Date(a.end_time)
  );

  let currentStreak = 0;
  let lastDate = null;

  for (const fast of sortedFasts) {
    const fastDate = new Date(fast.end_time);
    const fastDay = new Date(fastDate.getFullYear(), fastDate.getMonth(), fastDate.getDate());

    if (lastDate === null) {
      // First fast
      const today = new Date();
      const todayDay = new Date(today.getFullYear(), today.getMonth(), today.getDate());
      const diffDays = Math.floor((todayDay - fastDay) / (1000 * 60 * 60 * 24));

      if (diffDays <= 1) {
        currentStreak = 1;
        lastDate = fastDay;
      } else {
        break;
      }
    } else {
      const diffDays = Math.floor((lastDate - fastDay) / (1000 * 60 * 60 * 24));

      if (diffDays === 1) {
        currentStreak++;
        lastDate = fastDay;
      } else if (diffDays === 0) {
        // Same day, don't increment streak but continue checking
        continue;
      } else {
        break;
      }
    }
  }

  return {
    totalFasts,
    totalHours: Math.round(totalHours * 10) / 10, // Round to 1 decimal
    longestFast: Math.round(longestFast * 10) / 10,
    currentStreak,
    averageFast: Math.round(averageFast * 10) / 10,
  };
}
