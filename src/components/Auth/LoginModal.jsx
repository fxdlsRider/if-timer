// components/Auth/LoginModal.jsx
import React, { useState } from 'react';
import { useAuth } from '../../AuthContext';

/**
 * LoginModal Component
 *
 * Modal for magic link email authentication
 * Shows email input form and success screen
 *
 * @param {function} onClose - Handler to close the modal
 */
export default function LoginModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const { signInWithEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter your email');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await signInWithEmail(email);
      setSuccess(true);
      setMessage('');
    } catch (error) {
      setSuccess(false);
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    card: {
      background: 'white',
      padding: '40px',
      borderRadius: '12px',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center'
    },
    title: {
      fontSize: '24px',
      fontWeight: '300',
      marginBottom: '12px',
      color: '#333'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '30px',
      lineHeight: '1.6'
    },
    input: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '16px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      background: '#333',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '12px'
    },
    cancel: {
      background: 'transparent',
      color: '#666',
      border: 'none',
      padding: '12px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    message: {
      marginTop: '16px',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '14px',
      background: message.includes('✅') ? '#e8f5e9' : '#ffebee',
      color: message.includes('✅') ? '#2e7d32' : '#c62828'
    }
  };

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        {!success ? (
          <>
            <h2 style={styles.title}>Sign in to sync</h2>
            <p style={styles.subtitle}>
              Enter your email to sync your timer<br />
              across all your devices. No password needed!
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={styles.input}
              />

              <button
                type="submit"
                disabled={loading}
                style={styles.button}
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>

              <button
                type="button"
                onClick={onClose}
                style={styles.cancel}
              >
                Cancel
              </button>
            </form>

            {message && (
              <div style={styles.message}>
                {message}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Success Screen */}
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
            <h2 style={styles.title}>Check your inbox!</h2>
            <p style={{
              fontSize: '15px',
              color: '#666',
              lineHeight: '1.6',
              marginBottom: '8px'
            }}>
              We sent a magic link to<br />
              <strong style={{ color: '#333' }}>{email}</strong>
            </p>
            <p style={{
              fontSize: '14px',
              color: '#999',
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Click the link in the email to sign in.
            </p>

            {/* Close tab instruction */}
            <div style={{
              background: '#FFF9E6',
              border: '2px solid #FFE066',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px'
            }}>
              <p style={{
                fontSize: '14px',
                color: '#333',
                fontWeight: '600',
                margin: 0
              }}>
                ✓ You can close this tab now
              </p>
            </div>

            <button
              onClick={onClose}
              style={{
                ...styles.button,
                background: '#4CAF50'
              }}
            >
              Got it!
            </button>

            <p style={{
              fontSize: '12px',
              color: '#999',
              marginTop: '16px'
            }}>
              💡 The link works on all your devices
            </p>
          </>
        )}
      </div>
    </div>
  );
}
