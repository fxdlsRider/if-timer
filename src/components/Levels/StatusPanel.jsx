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
  // Color mapping for body modes
  const getBodyModeColor = (bodyModeId) => {
    const colorMap = {
      'digesting': '#74b9ff',        // Blue
      'getting-ready': '#ffeaa7',    // Yellow
      'fat-burning': '#00b894',      // Green
      'cell-renewal': '#fdcb6e',     // Orange-Yellow
      'deep-healing': '#a29bfe'      // Purple
    };
    return colorMap[bodyModeId] || null;
  };

  const styles = {
    container: {
      width: '300px',
      background: 'var(--color-background-secondary, #F8FAFC)',
      borderRadius: '16px',
      padding: '24px',
      border: '1px solid var(--color-border, #E2E8F0)',
      display: 'flex',
      flexDirection: 'column',
      gap: '20px'
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
    levelsList: {
      listStyle: 'none',
      padding: 0,
      margin: 0,
      display: 'flex',
      flexDirection: 'column',
      gap: '8px'
    },
    levelItem: {
      fontSize: '14px',
      padding: '12px 16px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      gap: '12px',
      background: 'var(--color-background, #FFFFFF)',
      borderRadius: '10px',
      border: '1px solid var(--color-border-subtle, #F1F5F9)',
      position: 'relative',
      overflow: 'hidden'
    },
    colorBar: {
      position: 'absolute',
      left: 0,
      top: 0,
      bottom: 0,
      width: '4px',
      borderTopLeftRadius: '10px',
      borderBottomLeftRadius: '10px'
    },
    levelHours: {
      fontSize: '12px',
      color: 'var(--color-text-secondary, #64748B)',
      fontWeight: '500',
      minWidth: '60px'
    },
    levelLabel: {
      flex: 1,
      fontSize: '14px'
    }
  };

  const items = !isRunning ? fastingLevels : bodyModes;
  const currentIndex = !isRunning
    ? calculateFastingLevel(hours)
    : calculateBodyMode(hours, timeLeft);

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>{!isRunning ? 'Fasting Levels' : 'Body Mode'}</div>
        <div style={styles.subtitle}>Status</div>
      </div>

      {/* Levels List */}
      <ul style={styles.levelsList}>
        {items.map((item, index) => {
          const isActive = currentIndex === index;
          const isClickable = !isRunning && item.startHour;
          const barColor = isRunning ? getBodyModeColor(item.id) : null;

          return (
            <li
              key={index}
              style={{
                ...styles.levelItem,
                cursor: isClickable ? 'pointer' : 'default',
                background: isActive
                  ? 'linear-gradient(135deg, rgba(78, 205, 196, 0.1), rgba(52, 199, 89, 0.1))'
                  : 'var(--color-background, #FFFFFF)',
                borderColor: isActive
                  ? 'var(--color-accent-teal, #4ECDC4)'
                  : 'var(--color-border-subtle, #F1F5F9)'
              }}
              onClick={() => isClickable && onLevelClick(item.startHour)}
              onMouseEnter={(e) => {
                if (isClickable && !isActive) {
                  e.currentTarget.style.background = 'var(--color-background-secondary, #F8FAFC)';
                  e.currentTarget.style.borderColor = 'var(--color-border, #E2E8F0)';
                }
              }}
              onMouseLeave={(e) => {
                if (isClickable && !isActive) {
                  e.currentTarget.style.background = 'var(--color-background, #FFFFFF)';
                  e.currentTarget.style.borderColor = 'var(--color-border-subtle, #F1F5F9)';
                }
              }}
            >
              {/* Colored bar for body modes */}
              {barColor && (
                <div style={{ ...styles.colorBar, background: barColor }} />
              )}

              <span style={styles.levelHours}>{item.range}</span>
              <span style={{
                ...styles.levelLabel,
                color: isActive ? 'var(--color-text, #0F172A)' : 'var(--color-text-secondary, #64748B)',
                fontWeight: isActive ? '600' : '500'
              }}>
                {item.label}
              </span>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
