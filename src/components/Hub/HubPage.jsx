// components/Hub/HubPage.jsx
import React, { useState, useEffect } from 'react';
import { useFastsData } from '../../hooks/useFastsData';
import { loadProfile, saveProfile } from '../../services/profileService';

/**
 * HubPage - User Hub with 3-column layout
 * Minimalist design using existing color scheme
 *
 * For logged-in users: Profile, Statistics, Achievements
 * For guests: Sign Up / Sign In prompt
 */
export default function HubPage({ user, onSignIn }) {
  // Load fasts data and statistics
  const { statistics, loading } = useFastsData(user?.id);
  const [isEditingProfile, setIsEditingProfile] = useState(false);
  const [profileData, setProfileData] = useState({
    nickname: '',
    name: '',
    age: null,
    height: null,
    weight: null,
    targetWeight: null,
    goal: ''
  });
  const [profileLoading, setProfileLoading] = useState(true);

  // Load profile data when user is available
  useEffect(() => {
    const fetchProfile = async () => {
      if (!user?.id) {
        setProfileLoading(false);
        return;
      }

      try {
        const profile = await loadProfile(user.id);
        if (profile) {
          setProfileData({
            nickname: profile.nickname || '',
            name: profile.name || '',
            age: profile.age || null,
            height: profile.height || null,
            weight: profile.weight || null,
            targetWeight: profile.target_weight || null,
            goal: profile.goal || ''
          });
        }
      } catch (error) {
        console.error('Failed to load profile:', error);
      } finally {
        setProfileLoading(false);
      }
    };

    fetchProfile();
  }, [user?.id]);

  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-text dark:text-text-dark mb-4">Welcome to Your Hub</h1>
        <p className="text-lg text-text-secondary dark:text-text-dark-secondary mb-8">
          Sign in to access your personal statistics, achievements, and profile
        </p>

        <button
          onClick={onSignIn}
          className="px-8 py-3 bg-accent-teal text-white rounded-lg font-medium hover:bg-accent-teal/90 transition-colors shadow-xl"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  const handleProfileEdit = () => setIsEditingProfile(!isEditingProfile);
  const handleProfileSave = async () => {
    if (!user?.id) return;

    try {
      await saveProfile(user.id, profileData);
      setIsEditingProfile(false);
    } catch (error) {
      console.error('Failed to save profile:', error);
      alert('Failed to save profile. Please try again.');
    }
  };
  const handleInputChange = (field, value) => {
    setProfileData(prev => ({ ...prev, [field]: value }));
  };

  const achievements = [
    { id: 1, name: 'First Fast', icon: '🎯', earned: true },
    { id: 2, name: '7 Day Streak', icon: '🔥', earned: true },
    { id: 3, name: '24h Fast', icon: '⏰', earned: false },
    { id: 4, name: '30 Day Streak', icon: '🌟', earned: false },
    { id: 5, name: '3 Day Streak', icon: '💪', earned: true },
    { id: 6, name: '48h Fast', icon: '⭐', earned: false },
  ];

  return (
    <div className="min-h-screen bg-background dark:bg-background-dark p-6">
      <div className="max-w-[880px] mx-auto">

        {/* 3 Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">

          {/* LEFT - Profile */}
          <div className="bg-background-secondary dark:bg-background-dark-secondary border border-border dark:border-border-dark rounded-2xl p-6 min-h-[520px] flex flex-col">
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xs uppercase tracking-wider text-text-secondary dark:text-text-dark-secondary font-medium">Profile</h2>
              <button
                onClick={isEditingProfile ? handleProfileSave : handleProfileEdit}
                className="px-4 py-1.5 text-xs font-medium text-accent-teal hover:bg-accent-teal/10 rounded-lg transition-colors"
              >
                {isEditingProfile ? 'Save' : 'Edit'}
              </button>
            </div>

            {isEditingProfile ? (
              <div className="space-y-4 flex-1">
                <input
                  type="text"
                  value={profileData.name}
                  onChange={(e) => handleInputChange('name', e.target.value)}
                  className="w-full px-3 py-2 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg text-text dark:text-text-dark"
                  placeholder="Name"
                />
                <input
                  type="text"
                  value={profileData.nickname}
                  onChange={(e) => handleInputChange('nickname', e.target.value)}
                  className="w-full px-3 py-2 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg text-text dark:text-text-dark"
                  placeholder="Nickname (for TopFasters)"
                  maxLength="50"
                />
                <div className="grid grid-cols-2 gap-3">
                  <input type="number" value={profileData.age} onChange={(e) => handleInputChange('age', parseInt(e.target.value))} className="px-3 py-2 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg text-text dark:text-text-dark" placeholder="Age" />
                  <input type="number" value={profileData.height} onChange={(e) => handleInputChange('height', parseInt(e.target.value))} className="px-3 py-2 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg text-text dark:text-text-dark" placeholder="Height" />
                  <input type="number" step="0.1" value={profileData.weight} onChange={(e) => handleInputChange('weight', parseFloat(e.target.value))} className="px-3 py-2 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg text-text dark:text-text-dark" placeholder="Weight" />
                  <input type="number" step="0.1" value={profileData.targetWeight} onChange={(e) => handleInputChange('targetWeight', parseFloat(e.target.value))} className="px-3 py-2 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg text-text dark:text-text-dark" placeholder="Target" />
                </div>
                <input type="text" value={profileData.goal} onChange={(e) => handleInputChange('goal', e.target.value)} className="w-full px-3 py-2 bg-background dark:bg-background-dark border border-border dark:border-border-dark rounded-lg text-text dark:text-text-dark" placeholder="Goal" />
              </div>
            ) : (
              <>
                <div className="mb-6">
                  {profileData.name ? (
                    <h3 className="text-2xl font-bold text-text dark:text-text-dark mb-2">{profileData.name}</h3>
                  ) : (
                    <h3 className="text-2xl font-bold text-text dark:text-text-dark mb-2">Your Profile</h3>
                  )}
                  {profileData.nickname && (
                    <p className="text-sm text-text-secondary dark:text-text-dark-secondary">Nickname: {profileData.nickname}</p>
                  )}
                </div>

                <div className="space-y-3 text-text dark:text-text-dark flex-1">
                  <div className="flex justify-between items-center py-2 border-b border-border-subtle dark:border-border-dark">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Age</span>
                    <span className="text-lg font-semibold">{profileData.age || '-'} {profileData.age ? 'years' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border-subtle dark:border-border-dark">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Height</span>
                    <span className="text-lg font-semibold">{profileData.height || '-'} {profileData.height ? 'cm' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border-subtle dark:border-border-dark">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Weight</span>
                    <span className="text-lg font-semibold">{profileData.weight || '-'} {profileData.weight ? 'kg' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center py-2 border-b border-border-subtle dark:border-border-dark">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Target</span>
                    <span className="text-lg font-semibold">{profileData.targetWeight || '-'} {profileData.targetWeight ? 'kg' : ''}</span>
                  </div>
                  <div className="flex justify-between items-center py-2">
                    <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Goal</span>
                    <span className="text-sm font-medium text-right max-w-[200px]">{profileData.goal || '-'}</span>
                  </div>
                </div>

                {/* Weight to Go */}
                <div className="mt-auto pt-4 border-t border-border dark:border-border-dark">
                  <div className="flex items-end justify-between">
                    <div>
                      <p className="text-xs text-text-secondary dark:text-text-dark-secondary uppercase tracking-wider mb-1">Weight to go</p>
                      <p className="text-5xl font-light text-accent-teal">
                        {profileData.weight && profileData.targetWeight
                          ? (profileData.weight - profileData.targetWeight).toFixed(1)
                          : '-'
                        }
                      </p>
                    </div>
                    <p className="text-lg text-text-secondary dark:text-text-dark-secondary mb-1">kg</p>
                  </div>
                </div>
              </>
            )}
          </div>

          {/* MIDDLE - Statistics */}
          <div className="bg-background-secondary dark:bg-background-dark-secondary border border-border dark:border-border-dark rounded-2xl p-6 min-h-[520px] flex flex-col">
            <h2 className="text-xs uppercase tracking-wider text-text-secondary dark:text-text-dark-secondary font-medium mb-6">Statistics</h2>

            <div className="space-y-6 flex-1">
              {/* Total Fasts */}
              <div>
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2">Total Fasts</p>
                <p className="text-6xl font-light text-accent-teal mb-1">{statistics.totalFasts}</p>
                <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary">completed sessions</p>
              </div>

              {/* Current Streak */}
              <div className="pt-4 border-t border-border-subtle dark:border-border-dark">
                <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-2">Current Streak</p>
                <p className="text-6xl font-light text-accent-green mb-1">{statistics.currentStreak}</p>
                <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary">days in a row</p>
              </div>

              {/* Other Stats */}
              <div className="pt-4 border-t border-border-subtle dark:border-border-dark space-y-2.5">
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Total Hours</span>
                  <span className="text-2xl font-semibold text-text dark:text-text-dark">{statistics.totalHours}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Longest Fast</span>
                  <span className="text-2xl font-semibold text-text dark:text-text-dark">{statistics.longestFast}h</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-sm text-text-secondary dark:text-text-dark-secondary">Average Fast</span>
                  <span className="text-2xl font-semibold text-text dark:text-text-dark">{statistics.averageFast}h</span>
                </div>
                {/* Debug info - remove after testing */}
                {statistics.totalFasts > 0 && (
                  <div className="mt-4 p-2 bg-background dark:bg-background-dark rounded text-xs text-text-tertiary dark:text-text-dark-tertiary">
                    Debug: L+A={(statistics.longestFast + statistics.averageFast).toFixed(1)}h | Total={statistics.totalHours}h | Fasts={statistics.totalFasts}
                  </div>
                )}
              </div>
            </div>
          </div>

          {/* RIGHT - Achievements */}
          <div className="bg-background-secondary dark:bg-background-dark-secondary border border-border dark:border-border-dark rounded-2xl p-6 min-h-[520px] flex flex-col">
            <h2 className="text-xs uppercase tracking-wider text-text-secondary dark:text-text-dark-secondary font-medium mb-6">Achievements</h2>

            <div className="flex-1 grid grid-cols-2 gap-2.5 content-start">
              {achievements.map(achievement => (
                <div
                  key={achievement.id}
                  className={`
                    rounded-xl p-4 border transition-all
                    ${achievement.earned
                      ? 'bg-accent-teal/10 border-accent-teal/30'
                      : 'bg-background dark:bg-background-dark border-border-subtle dark:border-border-dark opacity-40'
                    }
                  `}
                >
                  <div className="text-center">
                    <div className="text-4xl mb-2">{achievement.icon}</div>
                    <p className={`text-xs font-medium ${achievement.earned ? 'text-accent-teal' : 'text-text-secondary dark:text-text-dark-secondary'}`}>
                      {achievement.name}
                    </p>
                  </div>
                </div>
              ))}
            </div>

            {/* Bottom Summary */}
            <div className="mt-4 pt-4 border-t border-border dark:border-border-dark">
              <div className="flex justify-between items-end">
                <div>
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-1">Earned</p>
                  <p className="text-4xl font-light text-accent-teal">{achievements.filter(a => a.earned).length}/{achievements.length}</p>
                </div>
                <div className="text-right">
                  <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-1">Progress</p>
                  <p className="text-2xl font-semibold text-text dark:text-text-dark">{Math.round((achievements.filter(a => a.earned).length / achievements.length) * 100)}%</p>
                </div>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
