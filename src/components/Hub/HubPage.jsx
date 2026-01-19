// components/Hub/HubPage.jsx
import React, { useState, useEffect } from 'react';
import ProfileCard from './ProfileCard';
import { getStatistics, getFasts } from '../../services/fastsService';
import { getAchievementsWithStatus, getAchievementProgress, backfillAchievements } from '../../services/achievementsService';

/**
 * HubPage - User Hub
 *
 * 3-column card layout:
 * - Profile (left)
 * - Statistics (center)
 * - Achievements (right)
 */
export default function HubPage({ user, onSignIn }) {
  // State for statistics
  const [statsData, setStatsData] = useState({
    totalFasts: 0,
    currentStreak: 0,
    totalHours: 0,
    longestFast: 0,
    averageFast: 0
  });
  const [loading, setLoading] = useState(true);

  // State for achievements
  const [achievements, setAchievements] = useState([]);
  const [achievementProgress, setAchievementProgress] = useState({ earned: 0, total: 0, percentage: 0 });

  // Load statistics and achievements when user changes
  useEffect(() => {
    async function loadData() {
      if (!user || !user.id) {
        setLoading(false);
        return;
      }

      setLoading(true);

      // Load statistics and fasts
      const stats = await getStatistics(user.id);
      setStatsData(stats);

      const allFasts = await getFasts(user.id);

      // Backfill achievements from historical fasts
      backfillAchievements(user.id, stats, allFasts);

      // Load achievements with status
      const achievementsWithStatus = getAchievementsWithStatus(user.id);
      setAchievements(achievementsWithStatus);

      // Load achievement progress
      const progress = getAchievementProgress(user.id);
      setAchievementProgress(progress);

      setLoading(false);
    }

    loadData();
  }, [user]);


  // Anonymous users should also see sign-in screen (same logic as My Journey)
  if (!user || user.is_anonymous) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-text dark:text-text-dark mb-4">Welcome to Your Hub</h1>
        <p className="text-lg text-text-secondary dark:text-text-dark-secondary mb-8">
          Sign in to access your personal statistics, achievements, and profile
        </p>

        <button
          onClick={onSignIn}
          className="px-8 py-3 bg-accent-teal text-white rounded-lg font-medium hover:bg-accent-teal/90 transition-colors"
        >
          Sign In / Sign Up
        </button>
      </div>
    );
  }

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--color-background, #FFFFFF)' }}>
      <div className="max-w-5xl mx-auto">
        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* LEFT: Profile Card */}
          <ProfileCard user={user} />

          {/* CENTER: Statistics Card */}
          <div style={{
            width: '300px',
            height: '650px',
            background: 'var(--color-background-secondary, #F8FAFC)',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '16px',
            padding: '40px',
            overflow: 'auto'
          }}>
            <h2 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--color-text-secondary, #64748B)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}>STATISTICS</h2>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
              {/* Total Fasts */}
              <div>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)', marginBottom: '8px' }}>Total Fasts</p>
                <p style={{ fontSize: '48px', fontWeight: '300', color: '#4ECDC4', marginBottom: '4px' }}>{statsData.totalFasts}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary, #94A3B8)' }}>completed sessions</p>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-subtle, #F1F5F9)' }} />

              {/* Current Streak */}
              <div>
                <p style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)', marginBottom: '8px' }}>Current Streak</p>
                <p style={{ fontSize: '48px', fontWeight: '300', color: '#34C759' }}>{statsData.currentStreak}</p>
                <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary, #94A3B8)' }}>days in a row</p>
              </div>

              <div style={{ borderTop: '1px solid var(--color-border-subtle, #F1F5F9)' }} />

              {/* Other Stats */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748B)' }}>Total Hours</span>
                  <span style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text, #0F172A)' }}>{statsData.totalHours}h</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748B)' }}>Longest Fast</span>
                  <span style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text, #0F172A)' }}>{statsData.longestFast}h</span>
                </div>

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748B)' }}>Average Fast</span>
                  <span style={{ fontSize: '20px', fontWeight: '600', color: 'var(--color-text, #0F172A)' }}>{statsData.averageFast}h</span>
                </div>
              </div>
            </div>
          </div>

          {/* RIGHT: Achievements Card */}
          <div style={{
            width: '300px',
            height: '650px',
            background: 'var(--color-background-secondary, #F8FAFC)',
            border: '1px solid var(--color-border, #E2E8F0)',
            borderRadius: '16px',
            padding: '40px',
            overflow: 'auto'
          }}>
            <h2 style={{
              fontSize: '12px',
              fontWeight: '600',
              color: 'var(--color-text-secondary, #64748B)',
              letterSpacing: '1px',
              textTransform: 'uppercase',
              marginBottom: '24px'
            }}>ACHIEVEMENTS</h2>

            {/* Achievement Grid */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(2, 1fr)',
              gap: '12px',
              marginBottom: '24px'
            }}>
              {achievements.map((achievement) => (
                <div
                  key={achievement.id}
                  style={{
                    background: achievement.earned
                      ? 'var(--color-background, #FFFFFF)'
                      : 'var(--color-background, #FFFFFF)',
                    border: achievement.earned
                      ? '2px solid #4ECDC4'
                      : '1px solid var(--color-border-subtle, #F1F5F9)',
                    borderRadius: '12px',
                    padding: '16px',
                    textAlign: 'center',
                    opacity: achievement.earned ? 1 : 0.5,
                    transition: 'all 0.2s'
                  }}
                >
                  <div style={{ fontSize: '32px', marginBottom: '8px' }}>{achievement.icon}</div>
                  <p style={{
                    fontSize: '12px',
                    color: achievement.earned ? '#4ECDC4' : 'var(--color-text-tertiary, #94A3B8)',
                    fontWeight: achievement.earned ? '600' : '400'
                  }}>
                    {achievement.label}
                  </p>
                </div>
              ))}
            </div>

            {/* Progress */}
            <div style={{
              borderTop: '1px solid var(--color-border-subtle, #F1F5F9)',
              paddingTop: '20px'
            }}>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                marginBottom: '8px'
              }}>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748B)' }}>Earned</span>
                <span style={{ fontSize: '13px', color: 'var(--color-text-secondary, #64748B)' }}>Progress</span>
              </div>
              <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'baseline'
              }}>
                <span style={{ fontSize: '28px', fontWeight: '300', color: '#4ECDC4' }}>{achievementProgress.earned}/{achievementProgress.total}</span>
                <span style={{ fontSize: '28px', fontWeight: '300', color: 'var(--color-text, #0F172A)' }}>{achievementProgress.percentage}%</span>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
