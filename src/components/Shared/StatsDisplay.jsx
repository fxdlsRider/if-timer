// components/Shared/StatsDisplay.jsx
import React from 'react';

/**
 * StatsDisplay Component
 *
 * Displays total hours and current goal
 * Shown below the timer circle
 *
 * @param {number} totalHours - Total hours fasted across all sessions
 * @param {number} goalHours - Current goal in hours
 */
export default function StatsDisplay({ totalHours = 0, goalHours = 0 }) {
  const styles = {
    container: {
      display: 'flex',
      gap: '48px',
      justifyContent: 'center',
      marginTop: '32px'
    },
    stat: {
      textAlign: 'center'
    },
    value: {
      fontSize: '16px',
      fontWeight: '500',
      letterSpacing: '0.5px'
    },
    label: {
      fontSize: '14px',
      fontWeight: '400',
      marginLeft: '4px'
    },
    totalValue: {
      color: '#4ECDC4' // Teal
    },
    goalValue: {
      color: 'var(--color-text-secondary, #94A3B8)' // Gray
    }
  };

  return (
    <div style={styles.container}>
      {/* Total Hours */}
      <div style={styles.stat}>
        <span style={{ ...styles.value, ...styles.totalValue }}>
          {totalHours}h
        </span>
        <span style={{ ...styles.label, ...styles.totalValue }}>
          total
        </span>
      </div>

      {/* Goal Hours */}
      <div style={styles.stat}>
        <span style={{ ...styles.value, ...styles.goalValue }}>
          {goalHours}h
        </span>
        <span style={{ ...styles.label, ...styles.goalValue }}>
          goal
        </span>
      </div>
    </div>
  );
}
