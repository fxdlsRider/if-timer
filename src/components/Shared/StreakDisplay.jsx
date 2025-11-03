// components/Shared/StreakDisplay.jsx
import React from 'react';

/**
 * StreakDisplay Component
 *
 * Displays current fasting streak
 * Shown above the timer circle
 *
 * @param {number} streakDays - Current streak in consecutive days
 */
export default function StreakDisplay({ streakDays = 0 }) {
  if (streakDays === 0) return null;

  const styles = {
    container: {
      textAlign: 'center',
      marginBottom: '32px'
    },
    text: {
      fontSize: '15px',
      fontWeight: '400',
      color: 'var(--color-text-secondary, #94A3B8)',
      letterSpacing: '0.5px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.text}>
        {streakDays} day streak
      </div>
    </div>
  );
}
