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

  // Badge mapping based on rank (not hours)
  const getBadgeByRank = (rank) => {
    const badges = {
      1: '🔥',
      2: '💪',
      3: '⚡',
      4: '✨',
      5: '👤',
      6: '🎯'
    };
    return badges[rank] || '👤';
  };

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
      gap: '0'
    },
    header: {
      textAlign: 'center',
      borderBottom: 'none',
      paddingBottom: '0',
      marginBottom: '30px'
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
    leaderboardList: {
      display: 'flex',
      flexDirection: 'column',
      gap: '10px',
      maxHeight: '480px',
      overflowY: 'auto',
      marginBottom: '0'
    },
    leaderboardItem: {
      display: 'flex',
      alignItems: 'center',
      gap: '15px',
      padding: '15px',
      background: '#f8f9fa',
      borderRadius: '12px',
      border: 'none',
      transition: 'all 0.3s ease',
      cursor: 'default'
    },
    rank: {
      fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '20px',
      fontWeight: '700',
      color: '#636e72',
      minWidth: '30px',
      textAlign: 'center'
    },
    rankGold: {
      color: '#ffd32a',
      fontSize: '24px'
    },
    rankSilver: {
      color: '#b2bec3',
      fontSize: '22px'
    },
    rankBronze: {
      color: '#cd7f32',
      fontSize: '22px'
    },
    userInfo: {
      flex: 1,
      display: 'flex',
      flexDirection: 'column',
      gap: '3px'
    },
    userName: {
      fontSize: '15px',
      fontWeight: '600',
      color: '#2d3436',
      margin: 0
    },
    userLevel: {
      fontSize: '12px',
      color: '#636e72',
      margin: 0
    },
    userTime: {
      fontFamily: "'Space Grotesk', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif",
      fontSize: '18px',
      fontWeight: '700',
      color: '#0984e3',
      minWidth: '70px',
      textAlign: 'right'
    },
    userTimeGold: {
      color: '#ffd32a'
    },
    badge: {
      fontSize: '20px'
    },
    footer: {
      textAlign: 'center',
      marginTop: '20px',
      paddingTop: '20px',
      borderTop: '1px solid #e1e8ed',
      display: 'flex',
      flexDirection: 'column',
      gap: '15px',
      alignItems: 'center'
    },
    totalCount: {
      fontSize: '14px',
      color: '#636e72',
      textAlign: 'center',
      margin: 0
    },
    totalNumber: {
      fontSize: 'inherit',
      fontWeight: '700',
      color: '#0984e3',
      marginRight: '4px'
    },
    ctaButton: {
      width: '100%',
      padding: '12px 30px',
      fontSize: '14px',
      fontWeight: '700',
      color: '#fff',
      background: 'linear-gradient(135deg, #0984e3, #74b9ff)',
      border: 'none',
      borderRadius: '25px',
      cursor: 'pointer',
      transition: 'all 0.3s ease',
      textAlign: 'center'
    },
    loading: {
      textAlign: 'center',
      padding: '40px 20px',
      fontSize: '14px',
      color: '#636e72'
    }
  };

  const getRankStyle = (rank) => {
    if (rank === 1) return { ...styles.rank, ...styles.rankGold };
    if (rank === 2) return { ...styles.rank, ...styles.rankSilver };
    if (rank === 3) return { ...styles.rank, ...styles.rankBronze };
    return styles.rank;
  };

  const getTimeStyle = (rank) => {
    if (rank === 1) return { ...styles.userTime, ...styles.userTimeGold };
    return styles.userTime;
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
        <div style={styles.title}>🏆 Top Fasters</div>
        <div style={styles.subtitle}>Right Now</div>
      </div>

      {/* Leaderboard List */}
      <div style={styles.leaderboardList}>
        {leaderboardData.map((user, index) => {
          const rank = index + 1;
          return (
            <div
              key={user.id}
              style={styles.leaderboardItem}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = '#e9ecef';
                e.currentTarget.style.transform = 'translateX(5px)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = '#f8f9fa';
                e.currentTarget.style.transform = 'translateX(0)';
              }}
            >
              <span style={getRankStyle(rank)}>
                {rank}
              </span>
              <span style={styles.badge}>{getBadgeByRank(rank)}</span>
              <div style={styles.userInfo}>
                <div style={styles.userName}>{user.name}</div>
                <div style={styles.userLevel}>{user.level} Fast</div>
              </div>
              <div style={getTimeStyle(rank)}>
                {formatTime(user.hours, user.minutes)}
              </div>
            </div>
          );
        })}
      </div>

      {/* Footer */}
      <div style={styles.footer}>
        <p style={styles.totalCount}>
          <strong style={styles.totalNumber}>{totalUsers}</strong>
          people fasting now
        </p>
        <button
          style={styles.ctaButton}
          onClick={onSignUp}
          onMouseEnter={(e) => {
            e.currentTarget.style.transform = 'translateY(-2px)';
            e.currentTarget.style.boxShadow = '0 5px 20px rgba(9, 132, 227, 0.4)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.transform = 'translateY(0)';
            e.currentTarget.style.boxShadow = 'none';
          }}
        >
          Sign Up to Compete
        </button>
      </div>
    </div>
  );
}
