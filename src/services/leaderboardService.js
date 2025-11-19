// services/leaderboardService.js
import { supabase } from '../supabaseClient';

/**
 * Leaderboard Service
 *
 * Provides access to real-time fasting leaderboard data
 * Queries active fasts from Supabase and ranks by elapsed time
 */

/**
 * Fetch active fasting leaderboard
 * Returns top fasters currently in an active fast, sorted by elapsed time
 *
 * @param {number} limit - Number of top users to return (default: 10)
 * @returns {Promise<{users: Array, totalActive: number}>}
 */
export async function fetchLeaderboard(limit = 10) {
  try {
    // Query active timer states
    const { data: activeTimers, error } = await supabase
      .from('timer_states')
      .select(`
        user_id,
        hours,
        target_time,
        is_running,
        is_extended,
        updated_at
      `)
      .eq('is_running', true)
      .not('target_time', 'is', null)
      .order('updated_at', { ascending: false });

    if (error) {
      console.error('Error fetching leaderboard:', error);
      return { users: [], totalActive: 0 };
    }

    if (!activeTimers || activeTimers.length === 0) {
      return { users: [], totalActive: 0 };
    }

    const now = new Date();
    const totalActive = activeTimers.length;

    // STEP 1: Load profiles for active users
    const userIds = activeTimers.map(timer => timer.user_id);
    console.log('🔍 [Leaderboard] Active user IDs:', userIds);

    const { data: profiles, error: profileError } = await supabase
      .from('profiles')
      .select('user_id, nickname')
      .in('user_id', userIds);

    if (profileError) {
      console.error('❌ [Leaderboard] Error loading profiles:', profileError);
    } else {
      console.log('✅ [Leaderboard] Loaded profiles:', profiles);
    }

    // Create nickname mapping
    const nicknameMap = {};
    if (profiles) {
      profiles.forEach(profile => {
        if (profile.nickname) {
          nicknameMap[profile.user_id] = profile.nickname;
        }
      });
    }
    console.log('🗺️ [Leaderboard] Nickname mapping:', nicknameMap);

    // Calculate elapsed time for each active fast
    const usersWithElapsed = activeTimers.map((timer) => {
      const targetTime = new Date(timer.target_time);

      // Calculate how long they've been fasting
      const totalDurationSeconds = timer.hours * 3600;
      const elapsedSeconds = totalDurationSeconds - Math.max(0, Math.floor((targetTime - now) / 1000));

      // Calculate elapsed time
      const elapsedHours = Math.floor(elapsedSeconds / 3600);
      const elapsedMinutes = Math.floor((elapsedSeconds % 3600) / 60);

      // Determine fasting level based on original goal (not elapsed time)
      const level = getFastingLevelName(timer.hours);
      const badge = getFastingBadge(timer.hours);

      return {
        id: timer.user_id,
        name: anonymizeUserId(timer.user_id, nicknameMap[timer.user_id]),
        level,
        badge,
        hours: elapsedHours,
        minutes: elapsedMinutes,
        elapsedSeconds,
        isExtended: timer.is_extended
      };
    });

    // Sort by elapsed time (descending - longest fast first)
    const sortedUsers = usersWithElapsed
      .sort((a, b) => b.elapsedSeconds - a.elapsedSeconds)
      .slice(0, limit);

    return {
      users: sortedUsers,
      totalActive
    };
  } catch (error) {
    console.error('Error in fetchLeaderboard:', error);
    return { users: [], totalActive: 0 };
  }
}

/**
 * Subscribe to real-time leaderboard updates
 * Listens to changes in timer_states table and calls callback
 *
 * @param {function} callback - Called when leaderboard changes
 * @returns {object} Subscription object (call .unsubscribe() to stop)
 */
export function subscribeToLeaderboard(callback) {
  const channel = supabase
    .channel('leaderboard-changes')
    .on(
      'postgres_changes',
      {
        event: '*', // Listen to INSERT, UPDATE, DELETE
        schema: 'public',
        table: 'timer_states',
        filter: 'is_running=eq.true'
      },
      (payload) => {
        console.log('Leaderboard change detected:', payload);
        callback();
      }
    )
    .subscribe();

  return channel;
}

/**
 * Get total count of active fasters
 * @returns {Promise<number>}
 */
export async function getActiveFastersCount() {
  try {
    const { count, error } = await supabase
      .from('timer_states')
      .select('*', { count: 'exact', head: true })
      .eq('is_running', true);

    if (error) {
      console.error('Error getting active count:', error);
      return 0;
    }

    return count || 0;
  } catch (error) {
    console.error('Error in getActiveFastersCount:', error);
    return 0;
  }
}

// Helper functions

/**
 * Get display name for leaderboard
 * Uses real nickname from profile if available, otherwise generates anonymous name
 *
 * @param {string} userId - UUID of user
 * @param {string|null|undefined} nickname - User's nickname from profile (optional)
 * @returns {string} Display username
 */
function anonymizeUserId(userId, nickname = null) {
  // If user has a nickname in their profile, use it
  if (nickname) {
    console.log(`👤 [Leaderboard] Using nickname for ${userId.slice(0, 8)}...: "${nickname}"`);
    return nickname;
  }

  // Otherwise generate consistent anonymous name based on user_id hash
  console.log(`🎭 [Leaderboard] Generating fantasy name for ${userId.slice(0, 8)}...`);

  const adjectives = [
    'Fast', 'Quick', 'Swift', 'Zen', 'Strong', 'Mindful', 'Wise', 'Calm',
    'Focused', 'Balanced', 'Health', 'Wellness', 'Fit', 'Active', 'Clean'
  ];

  const nouns = [
    'Master', 'Warrior', 'Champion', 'Seeker', 'Journey', 'Path', 'Guide',
    'Spirit', 'Soul', 'Mind', 'Body', 'Guru', 'Sage', 'Hero', 'Legend'
  ];

  // Use userId to generate consistent but anonymous name
  const hashCode = userId.split('').reduce((acc, char) => {
    return char.charCodeAt(0) + ((acc << 5) - acc);
  }, 0);

  const adjIndex = Math.abs(hashCode) % adjectives.length;
  const nounIndex = Math.abs(hashCode >> 4) % nouns.length;
  const number = Math.abs(hashCode % 100);

  return `${adjectives[adjIndex]}${nouns[nounIndex]}${number}`;
}

/**
 * Get fasting level name based on goal hours
 * @param {number} hours - Goal fasting hours (14-48)
 * @returns {string} Level name
 */
function getFastingLevelName(hours) {
  if (hours <= 16) return 'Gentle';
  if (hours < 20) return 'Classic';
  if (hours < 24) return 'Intensive';
  if (hours < 36) return 'Warrior';
  if (hours < 48) return 'Monk';
  return 'Extended';
}

/**
 * Get badge emoji based on hours
 * @param {number} hours - Elapsed fasting hours
 * @returns {string} Badge emoji
 */
function getFastingBadge(hours) {
  if (hours < 14) return '🌱';
  if (hours < 16) return '🔥';
  if (hours < 20) return '⚡';
  if (hours < 24) return '💪';
  if (hours < 36) return '🌟';
  if (hours < 48) return '✨';
  return '🏆';
}
