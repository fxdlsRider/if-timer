// components/Shared/TopBar.jsx
import React from 'react';

/**
 * TopBar Component
 *
 * Shows sync status and auth buttons at the top of the page
 *
 * @param {object} user - Current user object (null if not logged in)
 * @param {boolean} syncing - Whether currently syncing with server
 * @param {function} onSignOut - Handler for sign out button
 * @param {function} onSignIn - Handler for sign in button
 */
export default function TopBar({ user, syncing, onSignOut, onSignIn }) {
  const styles = {
    topBar: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      right: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    syncIndicator: {
      fontSize: '12px',
      color: '#999',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    button: {
      padding: '8px 16px',
      fontSize: '13px',
      border: '1px solid #ddd',
      borderRadius: '6px',
      background: 'transparent',
      color: '#666',
      cursor: 'pointer',
      transition: 'all 0.2s'
    }
  };

  return (
    <div style={styles.topBar}>
      <div style={styles.syncIndicator}>
        {user && (
          <>
            <span>{syncing ? '⏳' : '✓'}</span>
            <span>{syncing ? 'Syncing...' : 'Synced'}</span>
          </>
        )}
      </div>

      <div>
        {user ? (
          <button
            onClick={onSignOut}
            style={styles.button}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#999';
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#ddd';
              e.currentTarget.style.color = '#666';
            }}
          >
            Logout
          </button>
        ) : (
          <button
            onClick={onSignIn}
            style={styles.button}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#999';
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#ddd';
              e.currentTarget.style.color = '#666';
            }}
          >
            Sign in to sync
          </button>
        )}
      </div>
    </div>
  );
}
