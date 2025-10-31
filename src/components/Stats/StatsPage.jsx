// components/Stats/StatsPage.jsx
import React from 'react';

/**
 * StatsPage Component
 *
 * Statistics and fasting history dashboard
 * Shows charts, trends, and analytics
 * (Currently placeholder - will be implemented in Phase 2)
 */
export default function StatsPage() {
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
      <h1 style={styles.title}>Stats & Analytics</h1>
      <p style={styles.subtitle}>
        Track your fasting progress, view trends, and analyze your journey.
        <br />
        Charts, graphs, and detailed statistics will be available here.
      </p>
      <div style={styles.comingSoon}>
        Coming Soon
      </div>
    </div>
  );
}
