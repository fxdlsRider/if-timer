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
 * @param {object} user - Current user object (null if not logged in)
 * @param {function} onSignIn - Handler for sign in button
 */
export default function NavigationHeader({ activeTab, onTabChange, user = null, onSignIn = null }) {
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
      maxWidth: '1400px',
      margin: '0 auto',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '0 40px',
      height: '64px',
      position: 'relative'
    },
    tabsContainer: {
      display: 'flex',
      gap: '48px',
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
    donateLink: {
      position: 'absolute',
      right: '40px',
      padding: '8px 20px',
      fontSize: '13px',
      fontWeight: '500',
      color: '#FFFFFF',
      background: '#FFDD00',
      borderRadius: '20px',
      textDecoration: 'none',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(255, 221, 0, 0.3)',
      display: 'flex',
      alignItems: 'center',
      gap: '6px'
    },
    loginButton: {
      position: 'absolute',
      left: '40px',
      padding: '8px 20px',
      fontSize: '13px',
      fontWeight: '500',
      color: '#FFFFFF',
      background: '#4ECDC4',
      borderRadius: '20px',
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s',
      boxShadow: '0 2px 8px rgba(78, 205, 196, 0.3)'
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.wrapper}>
        {/* Left: Login Button (if not logged in) */}
        {!user && onSignIn && (
          <button
            onClick={onSignIn}
            style={styles.loginButton}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = '#3DBDB5';
              e.currentTarget.style.transform = 'translateY(-1px)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = '#4ECDC4';
              e.currentTarget.style.transform = 'translateY(0)';
            }}
          >
            Sign In
          </button>
        )}

        {/* Center: Tabs */}
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

        {/* Right: Donate Button */}
        <a
          href="https://www.buymeacoffee.com/yourhandle"
          target="_blank"
          rel="noopener noreferrer"
          style={styles.donateLink}
          onMouseEnter={(e) => {
            e.currentTarget.style.background = '#FFD000';
            e.currentTarget.style.transform = 'translateY(-1px)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.background = '#FFDD00';
            e.currentTarget.style.transform = 'translateY(0)';
          }}
        >
          ☕ Buy me a coffee
        </a>
      </div>
    </div>
  );
}
