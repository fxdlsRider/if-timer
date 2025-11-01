// components/Dashboard/DashboardPanel.jsx
import React from 'react';

/**
 * DashboardPanel Component
 *
 * Left sidebar with user profile and statistics
 * Tacho-style dashboard design
 *
 * @param {object} userData - User profile data (name, weight, height, etc.)
 */
export default function DashboardPanel({ userData = {} }) {
  // Dummy data for testing
  const profile = {
    name: userData.name || 'Max Mustermann',
    age: userData.age || 32,
    currentWeight: userData.currentWeight || 85.5,
    targetWeight: userData.targetWeight || 75.0,
    height: userData.height || 178,
    goal: userData.goal || 'Weight Loss & Health',
    motivation: userData.motivation || 'Feel better, live longer',
    currentStreak: userData.currentStreak || 12,
    totalFasts: userData.totalFasts || 47,
    totalHours: userData.totalHours || 824,
    longestFast: userData.longestFast || 42
  };

  const weightToGo = (profile.currentWeight - profile.targetWeight).toFixed(1);

  const styles = {
    container: {
      width: '300px',
      background: 'var(--color-background-secondary, #F8FAFC)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--color-border, #E2E8F0)',
      display: 'flex',
      flexDirection: 'column',
      gap: '24px'
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
    profileSection: {
      display: 'flex',
      flexDirection: 'column',
      gap: '12px'
    },
    statRow: {
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      padding: '10px 0',
      borderBottom: '1px solid var(--color-border-subtle, #F1F5F9)'
    },
    statLabel: {
      fontSize: '13px',
      color: 'var(--color-text-secondary, #64748B)',
      fontWeight: '500'
    },
    statValue: {
      fontSize: '15px',
      color: 'var(--color-text, #0F172A)',
      fontWeight: '600'
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
      gap: '12px'
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
    motivationText: {
      fontSize: '14px',
      color: 'var(--color-text, #0F172A)',
      fontStyle: 'italic',
      textAlign: 'center',
      lineHeight: '1.5'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>{profile.name}</div>
        <div style={styles.subtitle}>Dashboard</div>
      </div>

      {/* Profile Info */}
      <div style={styles.profileSection}>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Age</span>
          <span style={styles.statValue}>{profile.age} years</span>
        </div>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Height</span>
          <span style={styles.statValue}>{profile.height} cm</span>
        </div>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Current Weight</span>
          <span style={styles.statValue}>{profile.currentWeight} kg</span>
        </div>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Target Weight</span>
          <span style={styles.statValue}>{profile.targetWeight} kg</span>
        </div>
      </div>

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
          <div style={styles.statCardValue}>{profile.currentStreak}</div>
          <div style={styles.statCardLabel}>Day Streak</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statCardValue}>{profile.totalFasts}</div>
          <div style={styles.statCardLabel}>Total Fasts</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statCardValue}>{profile.totalHours}h</div>
          <div style={styles.statCardLabel}>Total Hours</div>
        </div>
        <div style={styles.statCard}>
          <div style={styles.statCardValue}>{profile.longestFast}h</div>
          <div style={styles.statCardLabel}>Longest Fast</div>
        </div>
      </div>

      {/* Goal */}
      <div style={styles.profileSection}>
        <div style={styles.statRow}>
          <span style={styles.statLabel}>Goal</span>
          <span style={{ ...styles.statValue, fontSize: '13px' }}>{profile.goal}</span>
        </div>
      </div>

      {/* Motivation */}
      <div style={styles.motivationBox}>
        <div style={styles.motivationText}>
          "{profile.motivation}"
        </div>
      </div>
    </div>
  );
}
