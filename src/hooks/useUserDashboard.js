// hooks/useUserDashboard.js
import { useState, useEffect } from 'react';
import { loadProfile } from '../services/profileService';
import { useFastsData } from './useFastsData';

/**
 * Custom hook to load all dashboard data (profile + statistics)
 * @param {string} userId - User ID
 * @returns {object} Combined profile and statistics data
 */
export function useUserDashboard(userId) {
  const [profileData, setProfileData] = useState(null);
  const [profileLoading, setProfileLoading] = useState(true);

  // Load fasts statistics
  const { statistics, loading: statsLoading } = useFastsData(userId);

  // Load profile data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!userId) {
        setProfileLoading(false);
        return;
      }

      try {
        const profile = await loadProfile(userId);
        setProfileData(profile);
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [userId]);

  // Combine profile and statistics
  const dashboardData = {
    // Profile data
    nickname: profileData?.nickname || '',
    name: profileData?.name || '',
    age: profileData?.age || null,
    height: profileData?.height || null,
    currentWeight: profileData?.weight || null,
    targetWeight: profileData?.target_weight || null,
    goal: profileData?.goal || '',

    // Statistics from fasts
    currentStreak: statistics.currentStreak || 0,
    totalFasts: statistics.totalFasts || 0,
    totalHours: statistics.totalHours || 0,
    longestFast: statistics.longestFast || 0,
  };

  return {
    dashboardData,
    loading: profileLoading || statsLoading,
  };
}
