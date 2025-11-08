// components/Leaderboard/Leaderboard.jsx
import React, { useState, useEffect } from 'react';
import { fetchLeaderboard, subscribeToLeaderboard } from '../../services/leaderboardService';

/**
 * Leaderboard Component
 *
 * Shows top active fasters for non-authenticated users
 * Displays real-time leaderboard with rank, username, level, and time
 *
 * @param {function} onSignUp - Callback when user clicks "Sign Up to Compete"
 */
export default function Leaderboard({ onSignUp }) {
  const [leaderboardData, setLeaderboardData] = useState([]);
  const [totalUsers, setTotalUsers] = useState(0);
  const [isLoading, setIsLoading] = useState(true);

  // Fetch leaderboard data from Supabase
  useEffect(() => {
    loadLeaderboard();

    // Auto-refresh every 30 seconds
    const interval = setInterval(() => {
      loadLeaderboard();
    }, 30000);

    // Subscribe to real-time updates
    const subscription = subscribeToLeaderboard(() => {
      console.log('Leaderboard updated via real-time subscription');
      loadLeaderboard();
    });

    return () => {
      clearInterval(interval);
      subscription.unsubscribe();
    };
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await fetchLeaderboard(10);
      setLeaderboardData(data.users);
      setTotalUsers(data.totalActive);
      setIsLoading(false);
    } catch (error) {
      console.error('Error loading leaderboard:', error);
      setIsLoading(false);
    }
  };

  const formatTime = (hours, minutes) => {
    if (hours >= 24) {
      const days = Math.floor(hours / 24);
      const remainingHours = hours % 24;
      return `${days}d ${remainingHours}h`;
    }
    return `${hours}h ${minutes}m`;
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
    leaderboardList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '8px',
      maxHeight: '480px',
      overflowY: 'auto'
    },
    leaderboardItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '12px',
      background: 'var(--color-background, #FFFFFF)',
      borderRadius: '10px',
      border: '1px solid var(--color-border-subtle, #F1F5F9)',
      transition: 'all 0.2s'
    },
    rank: {
      fontSize: '16px',
      fontWeight: '700',
      color: 'var(--color-text-tertiary, #94A3B8)',
      minWidth: '24px',
      textAlign: 'center'
    },
    rankTop: {
      fontSize: '18px',
      fontWeight: '700',
      background: 'linear-gradient(135deg, #FFD700, #FFA500)',
      WebkitBackgroundClip: 'text',
      WebkitTextFillColor: 'transparent',
      backgroundClip: 'text'
    },
    userInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '4px'
    },
    userName: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--color-text, #0F172A)'
    },
    userLevel: {
      fontSize: '12px',
      color: 'var(--color-text-secondary, #64748B)'
    },
    userTime: {
      fontSize: '14px',
      fontWeight: '600',
      color: 'var(--color-accent-teal, #4ECDC4)',
      minWidth: '70px',
      textAlign: 'right'
    },
    badge: {
      fontSize: '20px'
    },
    footer: {
      borderTop: '2px solid var(--color-border, #E2E8F0)',
      paddingTop: '16px',
      display: 'flex',
      flexDirection: 'column',
      gap: '16px',
      alignItems: 'center'
    },
    totalCount: {
      fontSize: '14px',
      color: 'var(--color-text-secondary, #64748B)',
      textAlign: 'center'
    },
    totalNumber: {
      fontSize: '24px',
      fontWeight: '700',
      color: 'var(--color-accent-teal, #4ECDC4)',
      marginRight: '4px'
    },
    ctaButton: {
      width: '100%',
      padding: '14px 24px',
      fontSize: '15px',
      fontWeight: '600',
      color: '#FFFFFF',
      background: 'linear-gradient(135deg, #4ECDC4, #34C759)',
      border: 'none',
      borderRadius: '10px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      textAlign: 'center',
      boxShadow: '0 4px 12px rgba(78, 205, 196, 0.3)'
    },
    loading: {
      textAlign: 'center',
      padding: '40px 20px',
      fontSize: '14px',
      color: 'var(--color-text-secondary, #64748B)'
    }
  };

  const getRankStyle = (rank) => {
    return rank <= 3 ? { ...styles.rank, ...styles.rankTop } : styles.rank;
  };

  if (isLoading) {
    return (
      <div style={styles.container}>
        <div style={styles.loading}>Loading leaderboard...</div>
      </div>
    );
  }

  return (
    <div style={styles.container}>
      {/* Header */}
      <div style={styles.header}>
        <div style={styles.title}>Top Fasters</div>
        <div style={styles.subtitle}>Right Now</div>
      </div>

      {/* Leaderboard List */}
      <div style={styles.leaderboardList}>
        {leaderboardData.map((user, index) => (
          <div
            key={user.id}
            style={styles.leaderboardItem}
            onMouseEnter={(e) => {
              e.currentTarget.style.background = 'var(--color-background-secondary, #F8FAFC)';
              e.currentTarget.style.borderColor = 'var(--color-border, #E2E8F0)';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.background = 'var(--color-background, #FFFFFF)';
              e.currentTarget.style.borderColor = 'var(--color-border-subtle, #F1F5F9)';
            }}
          >
            <span style={getRankStyle(index + 1)}>
              {index + 1}
            </span>
            <span style={styles.badge}>{user.badge}</span>
            <div style={styles.userInfo}>
              <div style={styles.userName}>{user.name}</div>
              <div style={styles.userLevel}>{user.level} Fast</div>
            </div>
            <div style={styles.userTime}>
              {formatTime(user.hours, user.minutes)}
            </div>
          </div>
        ))}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <div style={styles.totalCount}>
          <span style={styles.totalNumber}>{totalUsers}</span>
          people fasting now
        </div>
        <button
          style={styles.ctaButton}
          onClick={onSignUp}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 6px 16px rgba(78, 205, 196, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = '0 4px 12px rgba(78, 205, 196, 0.3)';
          }}
        >
          Sign Up to Compete
        </button>
      </div>
    </div>
  );
}
