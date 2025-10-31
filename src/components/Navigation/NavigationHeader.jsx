// components/Navigation/NavigationHeader.jsx
import React from 'react';

/**
 * NavigationHeader Component
 *
 * Horizontal tab navigation with streak display
 * Tabs: Timer | Stats | Learn | Profile
 *
 * @param {string} activeTab - Currently active tab ('timer', 'stats', 'learn', 'profile')
 * @param {function} onTabChange - Handler for tab switching
 * @param {number} streakDays - Current streak in days (optional)
 */
export default function NavigationHeader({ activeTab, onTabChange, streakDays = 0 }) {
  const tabs = [
    { id: 'timer', label: 'Timer' },
    { id: 'stats', label: 'Stats' },
    { id: 'learn', label: 'Learn' },
    { id: 'profile', label: 'Profile' }
  ];

  const styles = {
    container: {
      width: '100%',
      borderBottom: '1px solid var(--color-border, #e5e7eb)',
      background: 'var(--color-background, #ffffff)',
      position: 'sticky',
      top: 0,
      zIndex: 100
    },
    wrapper: {
      maxWidth: '1200px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '0 40px',
      height: '64px'
    },
    leftSection: {
      display: 'flex',
      alignItems: 'center',
      gap: '48px'
    },
    logo: {
      fontSize: '18px',
      fontWeight: '500',
      color: 'var(--color-text, #0F172A)',
      letterSpacing: '0.5px'
    },
    tabsContainer: {
      display: 'flex',
      gap: '32px',
      alignItems: 'center'
    },
    tab: {
      position: 'relative',
      padding: '20px 0',
      fontSize: '15px',
      fontWeight: '400',
      color: 'var(--color-text-secondary, #94A3B8)',
      cursor: 'pointer',
      transition: 'color 0.2s',
      border: 'none',
      background: 'none',
      outline: 'none'
    },
    tabActive: {
      color: 'var(--color-text, #0F172A)',
      fontWeight: '500'
    },
    tabUnderline: {
      position: 'absolute',
      bottom: 0,
      left: 0,
      right: 0,
      height: '2px',
      background: '#4ECDC4',
      borderRadius: '2px 2px 0 0'
    },
    streakBadge: {
      padding: '6px 16px',
      fontSize: '13px',
      fontWeight: '500',
      color: 'var(--color-text-secondary, #94A3B8)',
      background: 'transparent',
      borderRadius: '20px'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Left: Logo + Tabs */}
        <div style={styles.leftSection}>
          <div style={styles.logo}>IF Timer</div>

          <div style={styles.tabsContainer}>
            {tabs.map((tab) => {
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => onTabChange(tab.id)}
                  style={{
                    ...styles.tab,
                    ...(isActive ? styles.tabActive : {})
                  }}
                  onMouseEnter={(e) => {
                    if (!isActive) {
                      e.target.style.color = 'var(--color-text, #0F172A)';
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (!isActive) {
                      e.target.style.color = 'var(--color-text-secondary, #94A3B8)';
                    }
                  }}
                >
                  {tab.label}
                  {isActive && <div style={styles.tabUnderline} />}
                </button>
              );
            })}
          </div>
        </div>

        {/* Right: Streak Badge */}
        {streakDays > 0 && (
          <div style={styles.streakBadge}>
            {streakDays} {streakDays === 1 ? 'day' : 'days'}
          </div>
        )}
      </div>
    </div>
  );
}
