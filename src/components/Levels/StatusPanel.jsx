// components/Levels/StatusPanel.jsx
import React from 'react';

/**
 * StatusPanel Component
 *
 * Shows Fasting Levels and Body States
 * Always displays both sections for all users
 *
 * @param {boolean} isRunning - Whether timer is currently running
 * @param {number} hours - Current hours value
 * @param {number} timeLeft - Time left in seconds
 * @param {function} onLevelClick - Handler for level click (quick select)
 */
export default function StatusPanel({
  isRunning,
  hours,
  onLevelClick
}) {
  const fastingLevelsData = [
    { time: '14-16h', name: 'Gentle', popular: false, value: 14 },
    { time: '16-18h', name: 'Classic', popular: true, value: 16 },
    { time: '18-20h', name: 'Intensive', popular: false, value: 18 },
    { time: '20-24h', name: 'Warrior', popular: false, value: 20 },
    { time: '24-36h', name: 'Monk', popular: false, value: 24 },
    { time: '36+h', name: 'Extended', popular: false, value: 36 }
  ];

  const bodyStatesData = [
    {
      title: 'Fat Burning',
      time: '8-16 hours',
      description: 'Your body uses fat reserves as energy',
      color: '#00b894'
    },
    {
      title: 'Cell Renewal',
      time: '16-24 hours',
      description: 'Autophagy begins - cells repair themselves',
      color: '#fdcb6e'
    },
    {
      title: 'Deep Healing',
      time: '24+ hours',
      description: 'Maximum autophagy and stem cell activation',
      color: '#a29bfe'
    }
  ];

  const styles = {
    container: {
      width: '300px',
      background: '#fff',
      borderRadius: '20px',
      padding: '40px',
      border: 'none',
      boxShadow: '0 2px 20px rgba(0, 0, 0, 0.08)',
      display: 'flex',
      flexDirection: 'column',
      gap: '30px'
    },
    header: {
      textAlign: 'center',
      borderBottom: 'none',
      paddingBottom: '0',
      marginBottom: '0'
    },
    title: {
      fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '28px',
      fontWeight: '600',
      color: '#2d3436',
      marginBottom: '8px',
      letterSpacing: '0'
    },
    subtitle: {
      fontSize: '12px',
      color: '#b2bec3',
      textTransform: 'uppercase',
      letterSpacing: '2px',
      fontWeight: '400'
    },
    levelsList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '0'
    },
    levelItem: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '18px 20px',
      marginBottom: '12px',
      background: '#f8f9fa',
      borderRadius: '12px',
      border: '2px solid transparent',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      position: 'relative'
    },
    levelItemPopular: {
      background: 'rgba(9, 132, 227, 0.1)',
      borderColor: '#0984e3'
    },
    levelTime: {
      fontSize: '16px',
      fontWeight: '700',
      color: '#636e72',
      minWidth: '70px'
    },
    levelName: {
      flex: 1,
      fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '20px',
      fontWeight: '700',
      color: '#2d3436',
      marginLeft: '15px'
    },
    levelNamePopular: {
      color: '#0984e3'
    },
    popularBadge: {
      fontSize: '12px',
      background: '#0984e3',
      color: '#fff',
      padding: '4px 12px',
      borderRadius: '12px',
      fontWeight: '600',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    bodyStatesSection: {
      borderTop: '1px solid #e1e8ed',
      paddingTop: '20px'
    },
    bodyStatesTitle: {
      fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '18px',
      fontWeight: '600',
      color: '#2d3436',
      marginBottom: '15px',
      textAlign: 'center'
    },
    bodyStatesList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '15px'
    },
    bodyStateItem: {
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '12px',
      border: 'none',
      position: 'relative',
      paddingLeft: '20px'
    },
    bodyStateBar: {
      position: 'absolute',
      left: '0',
      top: '0',
      bottom: '0',
      width: '4px',
      borderTopLeftRadius: '12px',
      borderBottomLeftRadius: '12px'
    },
    bodyStateTitle: {
      fontSize: '14px',
      fontWeight: '700',
      color: '#2d3436',
      marginBottom: '4px'
    },
    bodyStateTime: {
      fontSize: '12px',
      color: '#636e72',
      marginBottom: '6px',
      fontWeight: '600'
    },
    bodyStateDescription: {
      fontSize: '12px',
      color: '#636e72',
      lineHeight: '1.4'
    }
  };

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>⏱️ Fasting Levels</div>
        <div style={styles.subtitle}>Choose Your Challenge</div>
      </div>

      {/* Fasting Levels */}
      <div style={styles.levelsList}>
        {fastingLevelsData.map((level, index) => (
          <div
            key={index}
            style={{
              ...styles.levelItem,
              ...(level.popular ? styles.levelItemPopular : {})
            }}
            onClick={() => !isRunning && onLevelClick && onLevelClick(level.value)}
            onMouseEnter={(e) => {
              if (!isRunning) {
                e.currentTarget.style.background = '#e9ecef';
                e.currentTarget.style.borderColor = '#0984e3';
                e.currentTarget.style.transform = 'translateX(5px)';
              }
            }}
            onMouseLeave={(e) => {
              if (!isRunning) {
                e.currentTarget.style.background = level.popular ? 'rgba(9, 132, 227, 0.1)' : '#f8f9fa';
                e.currentTarget.style.borderColor = level.popular ? '#0984e3' : 'transparent';
                e.currentTarget.style.transform = 'translateX(0)';
              }
            }}
          >
            <span style={styles.levelTime}>{level.time}</span>
            <span style={{
              ...styles.levelName,
              ...(level.popular ? styles.levelNamePopular : {})
            }}>
              {level.name}
            </span>
            {level.popular && (
              <span style={styles.popularBadge}>Popular</span>
            )}
          </div>
        ))}
      </div>

      {/* Body States Section */}
      <div style={styles.bodyStatesSection}>
        <h3 style={styles.bodyStatesTitle}>Body States</h3>
        <div style={styles.bodyStatesList}>
          {bodyStatesData.map((state, index) => (
            <div key={index} style={styles.bodyStateItem}>
              <div style={{ ...styles.bodyStateBar, background: state.color }} />
              <div style={styles.bodyStateTitle}>{state.title}</div>
              <div style={styles.bodyStateTime}>{state.time}</div>
              <div style={styles.bodyStateDescription}>{state.description}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
