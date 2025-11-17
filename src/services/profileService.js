// services/profileService.js
import { supabase } from '../supabaseClient';

/**
 * Profile Service
 *
 * Manages user profile data in Supabase
 * Table: profiles (user_id, name, nickname, age, height, weight, target_weight, goal)
 */

/**
 * Fetch user profile
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} Profile data or null
 */
export async function fetchProfile(userId) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      if (error.code === 'PGRST116') {
        // Profile doesn't exist yet
        return null;
      }
      console.error('Error fetching profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in fetchProfile:', error);
    return null;
  }
}

/**
 * Create or update user profile
 * @param {string} userId - User ID
 * @param {object} profileData - Profile fields to update
 * @returns {Promise<object|null>} Updated profile or null
 */
export async function upsertProfile(userId, profileData) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .upsert({
        user_id: userId,
        ...profileData,
        updated_at: new Date().toISOString()
      }, {
        onConflict: 'user_id'
      })
      .select()
      .single();

    if (error) {
      console.error('Error upserting profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in upsertProfile:', error);
    return null;
  }
}

/**
 * Update specific profile fields
 * @param {string} userId - User ID
 * @param {object} updates - Fields to update
 * @returns {Promise<object|null>} Updated profile or null
 */
export async function updateProfile(userId, updates) {
  try {
    const { data, error } = await supabase
      .from('profiles')
      .update({
        ...updates,
        updated_at: new Date().toISOString()
      })
      .eq('user_id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating profile:', error);
      return null;
    }

    return data;
  } catch (error) {
    console.error('Error in updateProfile:', error);
    return null;
  }
}

/**
 * Calculate weight to go (current weight - target weight)
 * @param {number} weight - Current weight
 * @param {number} targetWeight - Target weight
 * @returns {number} Weight to go (rounded to 1 decimal)
 */
export function calculateWeightToGo(weight, targetWeight) {
  if (!weight || !targetWeight) return 0;
  return Math.max(0, parseFloat((weight - targetWeight).toFixed(1)));
}
