// components/Learn/LearnPage.jsx
import React from 'react';

/**
 * LearnPage Component
 *
 * Educational content about intermittent fasting
 * Articles, tips, science-backed information
 * (Currently placeholder - will be implemented in Phase 2)
 */
export default function LearnPage() {
  const styles = {
    container: {
      maxWidth: '1200px',
      margin: '0 auto',
      padding: '40px 20px',
      textAlign: 'center'
    },
    title: {
      fontSize: '32px',
      fontWeight: '300',
      color: 'var(--color-text, #0F172A)',
      marginBottom: '16px'
    },
    subtitle: {
      fontSize: '16px',
      color: 'var(--color-text-secondary, #94A3B8)',
      lineHeight: '1.6'
    },
    comingSoon: {
      display: 'inline-block',
      padding: '8px 20px',
      background: 'rgba(78, 205, 196, 0.1)',
      color: '#4ECDC4',
      borderRadius: '20px',
      fontSize: '14px',
      fontWeight: '500',
      marginTop: '24px'
    }
  };

  return (
    <div style={styles.container}>
      <h1 style={styles.title}>Learn About Fasting</h1>
      <p style={styles.subtitle}>
        Discover the science behind intermittent fasting, best practices,
        <br />
        and expert tips to optimize your fasting journey.
      </p>
      <div style={styles.comingSoon}>
        Coming Soon
      </div>
    </div>
  );
}
