// services/profileService.js
import { supabase } from '../supabaseClient';

/**
 * Load user profile from database
 * @param {string} userId - User ID
 * @returns {Promise<object|null>} Profile data or null
 */
export async function loadProfile(userId) {
  if (!userId) {
    return null;
  }

  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('user_id', userId)
      .single();

    if (error) {
      // If profile doesn't exist yet, return null (not an error)
      if (error.code === 'PGRST116') {
        return null;
      }
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Error loading profile:', error);
    return null;
  }
}

/**
 * Save or update user profile
 * @param {string} userId - User ID
 * @param {object} profileData - Profile data to save
 * @returns {Promise<object>} Saved profile data
 */
export async function saveProfile(userId, profileData) {
  if (!userId) {
    throw new Error('User ID is required');
  }

  try {
    // Check if profile exists
    const { data: existingProfile } = await supabase
      .from('profiles')
      .select('id')
      .eq('user_id', userId)
      .single();

    if (existingProfile) {
      // Update existing profile
      const { data, error } = await supabase
        .from('profiles')
        .update({
          name: profileData.name,
          age: profileData.age,
          height: profileData.height,
          weight: profileData.weight,
          target_weight: profileData.targetWeight,
          goal: profileData.goal,
        })
        .eq('user_id', userId)
        .select()
        .single();

      if (error) throw error;
      return data;
    } else {
      // Insert new profile
      const { data, error } = await supabase
        .from('profiles')
        .insert([
          {
            user_id: userId,
            name: profileData.name,
            age: profileData.age,
            height: profileData.height,
            weight: profileData.weight,
            target_weight: profileData.targetWeight,
            goal: profileData.goal,
          },
        ])
        .select()
        .single();

      if (error) throw error;
      return data;
    }
  } catch (error) {
    console.error('Error saving profile:', error);
    throw error;
  }
}
