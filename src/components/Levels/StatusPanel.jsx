// components/Levels/StatusPanel.jsx
import React from 'react';
import { FASTING_TIPS } from '../../config/constants';

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
      border: '1px solid var(--color-border-subtle, #F1F5F9)'
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

  // Get ONE random tip for current body mode (only when running)
  const [randomTipIndex] = React.useState(() => Math.floor(Math.random() * 3));
  const currentTip = React.useMemo(() => {
    if (!isRunning || !bodyModes[currentIndex]) return null;
    const tipsForMode = FASTING_TIPS.find(tip => tip.modeId === bodyModes[currentIndex].id)?.tips || [];
    return tipsForMode[randomTipIndex] || null;
  }, [isRunning, currentIndex, randomTipIndex, bodyModes]);

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

      {/* Fasting Tip - Only show when running */}
      {isRunning && currentTip && (
        <div style={{
          marginTop: '20px',
          padding: '16px',
          background: 'linear-gradient(135deg, rgba(78, 205, 196, 0.05), rgba(52, 199, 89, 0.05))',
          borderRadius: '10px',
          border: '1px solid var(--color-accent-teal, #4ECDC4)',
        }}>
          <div style={{
            fontSize: '13px',
            fontWeight: '600',
            color: 'var(--color-accent-teal, #4ECDC4)',
            marginBottom: '8px',
            textTransform: 'uppercase',
            letterSpacing: '1px'
          }}>
            💡 Tip
          </div>
          <div style={{
            fontSize: '13px',
            color: 'var(--color-text, #0F172A)',
            lineHeight: '1.6',
          }}>
            {currentTip}
          </div>
        </div>
      )}
    </div>
  );
}
