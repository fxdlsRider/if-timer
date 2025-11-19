// components/Dashboard/DashboardPanel.jsx
import React, { useState, useEffect } from 'react';
import { useAuth } from '../../AuthContext';
import { fetchProfile, calculateWeightToGo } from '../../services/profileService';
import { getLastFast, getStatistics } from '../../services/fastsService';

/**
 * DashboardPanel Component
 *
 * Left sidebar with user profile and statistics
 * Tacho-style dashboard design
 *
 * @param {object} userData - User profile data (name, weight, height, etc.)
 */
export default function DashboardPanel({ userData = {} }) {
  const { user } = useAuth();
  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [lastFast, setLastFast] = useState(null);
  const [statistics, setStatistics] = useState(null);

  // Load profile, last fast, and statistics from Supabase
  useEffect(() => {
    if (user?.id) {
      loadProfile();
      loadLastFast();
      loadStatistics();
    } else {
      setLoading(false);
    }
  }, [user?.id]);

  const loadProfile = async () => {
    setLoading(true);
    const data = await fetchProfile(user.id);
    setProfile(data);
    setLoading(false);
  };

  const loadLastFast = async () => {
    const fast = await getLastFast(user.id);
    setLastFast(fast);
  };

  const loadStatistics = async () => {
    const stats = await getStatistics(user.id);
    setStatistics(stats);
  };

  // Use profile data or fallback to dummy data
  const displayProfile = {
    name: profile?.name || user?.email?.split('@')[0] || 'User',
    age: profile?.age || null,
    currentWeight: profile?.weight || null,
    targetWeight: profile?.target_weight || null,
    height: profile?.height || null,
    goal: profile?.goal || null,
    nickname: profile?.nickname || null,
    // Stats - loaded from Supabase
    currentStreak: statistics?.currentStreak || 0,
    totalFasts: statistics?.totalFasts || 0,
    totalHours: statistics?.totalHours ? Math.round(statistics.totalHours * 10) / 10 : 0,
    longestFast: statistics?.longestFast ? Math.round(statistics.longestFast * 10) / 10 : 0
  };

  const weightToGo = calculateWeightToGo(displayProfile.currentWeight, displayProfile.targetWeight);

  const styles = {
    container: {
      width: '300px',
      background: 'var(--color-background-secondary, #F8FAFC)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--color-border, #E2E8F0)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px',
      overflow: 'hidden',
      msOverflowStyle: 'none',  // IE and Edge
      scrollbarWidth: 'none'  // Firefox
    },
    header: {
      textAlign: 'center',
      borderBottom: '2px solid var(--color-border, #E2E8F0)',
      paddingBottom: '16px'
    },
    title: {
      fontSize: '18px',
      fontWeight: '600',
      color: 'var(--color-text, #0F172A)',
      marginBottom: '4px',
      letterSpacing: '0.5px'
    },
    subtitle: {
      fontSize: '13px',
      color: 'var(--color-text-secondary, #64748B)',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    gaugeSection: {
      background: 'var(--color-background, #FFFFFF)',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid var(--color-border-subtle, #F1F5F9)'
    },
    gaugeTitle: {
      fontSize: '12px',
      color: 'var(--color-text-secondary, #64748B)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '12px',
      textAlign: 'center'
    },
    gaugeValue: {
      fontSize: '32px',
      fontWeight: '300',
      color: 'var(--color-accent-teal, #4ECDC4)',
      textAlign: 'center',
      marginBottom: '8px'
    },
    gaugeLabel: {
      fontSize: '11px',
      color: 'var(--color-text-tertiary, #94A3B8)',
      textAlign: 'center'
    },
    progressBar: {
      width: '100%',
      height: '8px',
      background: 'var(--color-border-subtle, #F1F5F9)',
      borderRadius: '4px',
      overflow: 'hidden',
      marginTop: '8px'
    },
    progressFill: {
      height: '100%',
      background: 'linear-gradient(90deg, #34C759, #4ECDC4)',
      borderRadius: '4px',
      transition: 'width 0.3s ease'
    },
    statsGrid: {
      display: 'grid',
      gridTemplateColumns: '1fr 1fr',
      gap: '12px',
      overflow: 'hidden'
    },
    statCard: {
      background: 'var(--color-background, #FFFFFF)',
      borderRadius: '10px',
      padding: '12px',
      textAlign: 'center',
      border: '1px solid var(--color-border-subtle, #F1F5F9)'
    },
    statCardValue: {
      fontSize: '24px',
      fontWeight: '600',
      color: 'var(--color-text, #0F172A)',
      marginBottom: '4px'
    },
    statCardLabel: {
      fontSize: '11px',
      color: 'var(--color-text-secondary, #64748B)',
      textTransform: 'uppercase',
      letterSpacing: '0.5px'
    },
    motivationBox: {
      background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(52, 199, 89, 0.1))',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid var(--color-accent-teal, #4ECDC4)',
      borderStyle: 'dashed'
    },
    motivationLabel: {
      fontSize: '11px',
      color: '#34C759',
      textTransform: 'uppercase',
      letterSpacing: '0.5px',
      marginBottom: '8px',
      textAlign: 'center',
      fontWeight: '700'
    },
    motivationText: {
      fontSize: '14px',
      color: 'var(--color-text, #0F172A)',
      fontStyle: 'italic',
      textAlign: 'center',
      lineHeight: '1.5'
    },
    lastFastCard: {
      background: 'var(--color-background, #FFFFFF)',
      borderRadius: '12px',
      padding: '16px',
      border: '1px solid var(--color-border-subtle, #F1F5F9)'
    },
    lastFastTitle: {
      fontSize: '12px',
      color: 'var(--color-text-secondary, #64748B)',
      textTransform: 'uppercase',
      letterSpacing: '1px',
      marginBottom: '12px'
    },
    lastFastDuration: {
      fontSize: '28px',
      fontWeight: '300',
      color: 'var(--color-accent-teal, #4ECDC4)',
      marginBottom: '8px'
    },
    lastFastDate: {
      fontSize: '12px',
      color: 'var(--color-text-tertiary, #94A3B8)',
      marginBottom: '4px'
    },
    lastFastStatus: {
      fontSize: '11px',
      color: 'var(--color-text-secondary, #64748B)',
      padding: '4px 8px',
      background: 'var(--color-background-secondary, #F8FAFC)',
      borderRadius: '6px',
      display: 'inline-block',
      marginTop: '8px'
    }
  };

  return (
    <div style={styles.container} className="scrollbar-hide">
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>{displayProfile.name}</div>
        <div style={styles.subtitle}>My Journey</div>
      </div>

      {/* Motivation - Goal at the top */}
      {displayProfile.goal && (
        <div style={styles.motivationBox}>
          <div style={styles.motivationLabel}>Goal</div>
          <div style={styles.motivationText}>
            "{displayProfile.goal}"
          </div>
        </div>
      )}

      {/* Last Fast */}
      {lastFast && (
        <div style={styles.lastFastCard}>
          <div style={styles.lastFastTitle}>Last Fast</div>
          <div style={styles.lastFastDuration}>
            {lastFast.unit === 'seconds'
              ? `${(lastFast.duration / 3600).toFixed(1)}h`
              : `${lastFast.duration}h`}
          </div>
          <div style={styles.lastFastDate}>
            {new Date(lastFast.end_time).toLocaleDateString('en-US', {
              month: 'short',
              day: 'numeric',
              year: 'numeric'
            })}
          </div>
          {lastFast.cancelled && (
            <div style={styles.lastFastStatus}>Cancelled</div>
          )}
          {!lastFast.cancelled && lastFast.duration >= lastFast.original_goal && (
            <div style={{...styles.lastFastStatus, color: '#34C759', background: 'rgba(52, 199, 89, 0.1)'}}>
              ✓ Completed
            </div>
          )}
        </div>
      )}

      {/* Weight Gauge */}
      <div style={styles.gaugeSection}>
        <div style={styles.gaugeTitle}>Weight to Go</div>
        <div style={styles.gaugeValue}>{weightToGo}</div>
        <div style={styles.gaugeLabel}>kilograms remaining</div>
        <div style={styles.progressBar}>
          <div style={{ ...styles.progressFill, width: '35%' }} />
        </div>
      </div>

      {/* Stats Grid */}
      <div style={styles.statsGrid}>
        <div style={styles.statCard}>
          <div style={styles.statCardValue}>{displayProfile.currentStreak}</div>
          <div style={styles.statCardLabel}>Day Streak</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statCardValue}>{displayProfile.totalFasts}</div>
          <div style={styles.statCardLabel}>Total Fasts</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statCardValue}>{displayProfile.totalHours}h</div>
          <div style={styles.statCardLabel}>Total Hours</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statCardValue}>{displayProfile.longestFast}h</div>
          <div style={styles.statCardLabel}>Longest Fast</div>
        </div>
      </div>
    </div>
  );
}
