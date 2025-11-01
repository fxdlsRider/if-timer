// components/Levels/StatusPanel.jsx
import React from 'react';

/**
 * StatusPanel Component
 *
 * Shows either Fasting Levels (when not running) or Body Modes (when running)
 * Allows clicking on levels to quick-select fasting duration
 *
 * @param {boolean} isRunning - Whether timer is currently running
 * @param {number} hours - Current hours value
 * @param {number} timeLeft - Time left in seconds
 * @param {array} fastingLevels - Array of fasting level objects
 * @param {array} bodyModes - Array of body mode objects
 * @param {function} onLevelClick - Handler for level click (quick select)
 * @param {function} calculateFastingLevel - Function to calculate current fasting level
 * @param {function} calculateBodyMode - Function to calculate current body mode
 */
export default function StatusPanel({
  isRunning,
  hours,
  timeLeft,
  fastingLevels,
  bodyModes,
  onLevelClick,
  calculateFastingLevel,
  calculateBodyMode
}) {
  const styles = {
    infoSection: {
      marginTop: '40px'
    },
    infoTitle: {
      fontSize: '13px',
      fontWeight: '600',
      color: 'var(--color-text-secondary, #999)',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      marginBottom: '16px',
      position: 'relative',
      paddingBottom: '12px'
    },
    infoTitleLine: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '1px',
      background: 'linear-gradient(to right, #e0e0e0 0%, transparent 100%)'
    },
    infoList: {
      listStyle: 'none',
      padding: 0,
      margin: 0
    },
    infoItem: {
      fontSize: '14px',
      padding: '12px 0',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '12px'
    },
    infoHours: {
      fontSize: '12px',
      color: 'var(--color-text-tertiary, #999)',
      minWidth: '60px'
    }
  };

  const items = !isRunning ? fastingLevels : bodyModes;
  const currentIndex = !isRunning
    ? calculateFastingLevel(hours)
    : calculateBodyMode(hours, timeLeft);

  return (
    <div style={styles.infoSection}>
      <div style={styles.infoTitle}>
        {!isRunning ? 'Fasting Levels' : 'Body Mode'}
        <div style={styles.infoTitleLine} />
      </div>

      <ul style={styles.infoList}>
        {items.map((item, index) => {
          const isActive = currentIndex === index;
          const isClickable = !isRunning && item.startHour;

          return (
            <li
              key={index}
              style={{
                ...styles.infoItem,
                color: isActive ? 'var(--color-text, #333)' : 'var(--color-text-secondary, #999)',
                fontWeight: isActive ? '500' : 'normal',
                cursor: isClickable ? 'pointer' : 'default'
              }}
              onClick={() => isClickable && onLevelClick(item.startHour)}
              onMouseEnter={(e) => {
                if (isClickable) {
                  e.currentTarget.style.color = 'var(--color-text, #333)';
                  e.currentTarget.style.fontWeight = '500';
                }
              }}
              onMouseLeave={(e) => {
                if (isClickable && !isActive) {
                  e.currentTarget.style.color = 'var(--color-text-secondary, #999)';
                  e.currentTarget.style.fontWeight = 'normal';
                }
              }}
            >
              <span style={styles.infoHours}>{item.range}</span>
              {item.label}
            </li>
          );
        })}
      </ul>
    </div>
  );
}
