// components/Profile/ProfilePage.jsx
import React from 'react';
import { useTheme } from '../../ThemeContext';
import { useAuth } from '../../AuthContext';

/**
 * ProfilePage Component
 *
 * User profile settings and preferences
 * - Theme selection (System | Light | Dark)
 * - User account info
 * - Settings management
 */
export default function ProfilePage() {
  const { themePreference, setTheme } = useTheme();
  const { user, signOut } = useAuth();

  const themeOptions = [
    { id: 'auto', label: 'System', description: 'Follows your device settings' },
    { id: 'light', label: 'Light', description: 'Always use light mode' },
    { id: 'dark', label: 'Dark', description: 'Always use dark mode' }
  ];

  const styles = {
    container: {
      maxWidth: '600px',
      margin: '0 auto',
      padding: '40px 20px'
    },
    section: {
      marginBottom: '48px'
    },
    sectionTitle: {
      fontSize: '14px',
      fontWeight: '600',
      letterSpacing: '1px',
      textTransform: 'uppercase',
      color: 'var(--color-text-secondary, #94A3B8)',
      marginBottom: '20px'
    },
    card: {
      background: 'var(--color-card-bg, #ffffff)',
      border: '1px solid var(--color-border, #e5e7eb)',
      borderRadius: '12px',
      padding: '24px',
      marginBottom: '16px'
    },
    optionButton: {
      width: '100%',
      padding: '16px 20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center',
      background: 'none',
      border: '2px solid var(--color-border, #e5e7eb)',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '12px',
      transition: 'all 0.2s',
      outline: 'none'
    },
    optionButtonActive: {
      borderColor: '#4ECDC4',
      background: 'rgba(78, 205, 196, 0.05)'
    },
    optionLeft: {
      textAlign: 'left'
    },
    optionLabel: {
      fontSize: '15px',
      fontWeight: '500',
      color: 'var(--color-text, #0F172A)',
      marginBottom: '4px'
    },
    optionDescription: {
      fontSize: '13px',
      color: 'var(--color-text-secondary, #94A3B8)'
    },
    optionCheck: {
      width: '20px',
      height: '20px',
      borderRadius: '50%',
      border: '2px solid #4ECDC4',
      background: '#4ECDC4',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      color: 'white',
      fontSize: '12px',
      fontWeight: 'bold'
    },
    optionCheckInactive: {
      background: 'transparent',
      borderColor: 'var(--color-border, #e5e7eb)'
    },
    accountInfo: {
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between',
      padding: '16px 20px',
      background: 'var(--color-card-bg, #ffffff)',
      border: '1px solid var(--color-border, #e5e7eb)',
      borderRadius: '8px',
      marginBottom: '12px'
    },
    email: {
      fontSize: '15px',
      color: 'var(--color-text, #0F172A)',
      fontWeight: '500'
    },
    signOutButton: {
      padding: '8px 20px',
      fontSize: '14px',
      color: '#e57373',
      background: 'transparent',
      border: '1px solid #e57373',
      borderRadius: '6px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      outline: 'none'
    },
    notSignedIn: {
      padding: '20px',
      textAlign: 'center',
      color: 'var(--color-text-secondary, #94A3B8)',
      fontSize: '14px',
      background: 'var(--color-card-bg, #ffffff)',
      border: '1px solid var(--color-border, #e5e7eb)',
      borderRadius: '8px'
    }
  };

  return (
    <div style={styles.container}>
      {/* Theme Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Appearance</h2>

        {themeOptions.map((option) => {
          const isActive = themePreference === option.id;
          return (
            <button
              key={option.id}
              onClick={() => setTheme(option.id)}
              style={{
                ...styles.optionButton,
                ...(isActive ? styles.optionButtonActive : {})
              }}
              onMouseEnter={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = '#4ECDC4';
                  e.currentTarget.style.background = 'rgba(78, 205, 196, 0.02)';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive) {
                  e.currentTarget.style.borderColor = 'var(--color-border, #e5e7eb)';
                  e.currentTarget.style.background = 'none';
                }
              }}
            >
              <div style={styles.optionLeft}>
                <div style={styles.optionLabel}>{option.label}</div>
                <div style={styles.optionDescription}>{option.description}</div>
              </div>

              <div style={{
                ...styles.optionCheck,
                ...(isActive ? {} : styles.optionCheckInactive)
              }}>
                {isActive && '✓'}
              </div>
            </button>
          );
        })}
      </div>

      {/* Account Section */}
      <div style={styles.section}>
        <h2 style={styles.sectionTitle}>Account</h2>

        {user ? (
          <div style={styles.accountInfo}>
            <div style={styles.email}>{user.email}</div>
            <button
              style={styles.signOutButton}
              onClick={signOut}
              onMouseEnter={(e) => {
                e.target.style.background = '#e57373';
                e.target.style.color = 'white';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'transparent';
                e.target.style.color = '#e57373';
              }}
            >
              Sign Out
            </button>
          </div>
        ) : (
          <div style={styles.notSignedIn}>
            Not signed in
          </div>
        )}
      </div>
    </div>
  );
}
