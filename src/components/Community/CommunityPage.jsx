// components/Community/CommunityPage.jsx
import React, { useState, useEffect } from 'react';
import { getActiveFasters, getCommunityStats } from '../../services/communityService';
import { FASTING_LEVELS } from '../../config/constants';

/**
 * CommunityPage - Live Fasting Community
 *
 * Shows active fasters in a 3-card layout:
 * - Card 1: Community Overview (total count, stats)
 * - Card 2: Fasting Levels (breakdown by level)
 * - Card 3: Active Fasters (live user list)
 */
export default function CommunityPage() {
  const [activeUsers, setActiveUsers] = useState([]);
  const [stats, setStats] = useState({ totalActive: 0, byLevel: {} });
  const [loading, setLoading] = useState(true);

  // Load active fasters from Supabase
  useEffect(() => {
    async function loadCommunityData() {
      setLoading(true);
      const users = await getActiveFasters();
      const communityStats = await getCommunityStats();
      setActiveUsers(users);
      setStats(communityStats);
      setLoading(false);
    }

    loadCommunityData();

    // Refresh every 30 seconds
    const interval = setInterval(loadCommunityData, 30000);
    return () => clearInterval(interval);
  }, []);

  const cardStyle = {
    width: '300px',
    height: '650px',
    background: 'var(--color-background-secondary, #F8FAFC)',
    border: '1px solid var(--color-border, #E2E8F0)',
    borderRadius: '16px',
    padding: '40px',
    overflow: 'auto'
  };

  const headerStyle = {
    fontSize: '12px',
    fontWeight: '600',
    color: 'var(--color-text-secondary, #64748B)',
    letterSpacing: '1px',
    textTransform: 'uppercase',
    marginBottom: '24px'
  };

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--color-background, #FFFFFF)' }}>
      <div className="max-w-5xl mx-auto">
        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Card 1: Community Overview */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>LIVE COMMUNITY</h2>

            {loading ? (
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)' }}>
                Loading...
              </p>
            ) : (
              <>
                {/* Total Active Count */}
                <div style={{ textAlign: 'center', marginBottom: '32px' }}>
                  <div style={{
                    fontSize: '72px',
                    fontWeight: '300',
                    color: '#4ECDC4',
                    lineHeight: '1'
                  }}>
                    {stats.totalActive}
                  </div>
                  <p style={{
                    fontSize: '14px',
                    color: 'var(--color-text-secondary, #64748B)',
                    marginTop: '8px'
                  }}>
                    Active Fasters
                  </p>
                  <p style={{
                    fontSize: '12px',
                    color: 'var(--color-text-tertiary, #94A3B8)',
                    marginTop: '4px'
                  }}>
                    Right now around the world
                  </p>
                </div>

                <div style={{ borderTop: '1px solid var(--color-border-subtle, #F1F5F9)', paddingTop: '24px' }} />

                {/* Quick Stats */}
                <div style={{ marginTop: '24px' }}>
                  <h3 style={{
                    fontSize: '16px',
                    fontWeight: '600',
                    color: 'var(--color-text, #0F172A)',
                    marginBottom: '16px'
                  }}>
                    Community Overview
                  </h3>

                  {stats.totalActive === 0 ? (
                    <div style={{
                      textAlign: 'center',
                      padding: '32px 0',
                      color: 'var(--color-text-tertiary, #94A3B8)'
                    }}>
                      <div style={{ fontSize: '48px', marginBottom: '16px' }}>🌙</div>
                      <p style={{ fontSize: '14px' }}>No one is fasting right now</p>
                      <p style={{ fontSize: '12px', marginTop: '8px' }}>Be the first to start!</p>
                    </div>
                  ) : (
                    <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)', lineHeight: '1.6' }}>
                      <p style={{ marginBottom: '12px' }}>
                        Join {stats.totalActive} {stats.totalActive === 1 ? 'faster' : 'fasters'} who {stats.totalActive === 1 ? 'is' : 'are'} currently on their fasting journey.
                      </p>
                      <p style={{ marginBottom: '12px' }}>
                        Track your progress, sync across devices, and see real-time community updates.
                      </p>
                      <div style={{
                        marginTop: '24px',
                        padding: '16px',
                        background: 'var(--color-background, #FFFFFF)',
                        borderRadius: '8px',
                        border: '1px solid var(--color-border-subtle, #F1F5F9)'
                      }}>
                        <p style={{ fontSize: '12px', color: 'var(--color-text-tertiary, #94A3B8)' }}>
                          💡 Live updates every 30 seconds
                        </p>
                      </div>
                    </div>
                  )}
                </div>
              </>
            )}
          </div>

          {/* Card 2: Fasting Levels */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>FASTING LEVELS</h2>

            <p style={{
              fontSize: '14px',
              color: 'var(--color-text-secondary, #64748B)',
              marginBottom: '24px',
              lineHeight: '1.6'
            }}>
              Active fasters by their current fasting level
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
              {FASTING_LEVELS.map(level => {
                const count = stats.byLevel[level.id] || 0;

                return (
                  <div
                    key={level.id}
                    style={{
                      background: 'var(--color-background, #FFFFFF)',
                      border: count > 0 ? `2px solid ${level.color}` : '1px solid var(--color-border-subtle, #F1F5F9)',
                      borderRadius: '12px',
                      padding: '16px',
                      opacity: count > 0 ? 1 : 0.5,
                      transition: 'all 0.2s'
                    }}
                  >
                    {/* Level Header */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: '12px', marginBottom: '8px' }}>
                      <div
                        style={{
                          width: '12px',
                          height: '12px',
                          borderRadius: '50%',
                          background: level.color,
                          flexShrink: 0
                        }}
                      />
                      <div style={{ flex: 1 }}>
                        <div style={{
                          fontSize: '14px',
                          fontWeight: '600',
                          color: 'var(--color-text, #0F172A)'
                        }}>
                          {level.label}
                        </div>
                        <div style={{
                          fontSize: '12px',
                          color: 'var(--color-text-tertiary, #94A3B8)'
                        }}>
                          {level.range}
                        </div>
                      </div>
                      <div style={{
                        fontSize: '20px',
                        fontWeight: '600',
                        color: count > 0 ? level.color : 'var(--color-text-tertiary, #94A3B8)'
                      }}>
                        {count}
                      </div>
                    </div>

                    {/* Level Description */}
                    <p style={{
                      fontSize: '12px',
                      color: 'var(--color-text-tertiary, #94A3B8)',
                      lineHeight: '1.5',
                      marginLeft: '24px'
                    }}>
                      {level.description}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Card 3: Active Fasters List */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>ACTIVE FASTERS</h2>

            {loading ? (
              <p style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)' }}>
                Loading users...
              </p>
            ) : activeUsers.length === 0 ? (
              <div style={{
                textAlign: 'center',
                padding: '32px 0',
                color: 'var(--color-text-tertiary, #94A3B8)'
              }}>
                <div style={{ fontSize: '48px', marginBottom: '16px' }}>👥</div>
                <p style={{ fontSize: '14px' }}>No active fasters yet</p>
                <p style={{ fontSize: '12px', marginTop: '8px' }}>Start your timer to join!</p>
              </div>
            ) : (
              <>
                <p style={{
                  fontSize: '14px',
                  color: 'var(--color-text-secondary, #64748B)',
                  marginBottom: '24px',
                  lineHeight: '1.6'
                }}>
                  {activeUsers.length} {activeUsers.length === 1 ? 'person is' : 'people are'} fasting right now
                </p>

                {/* User List */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  {activeUsers.map((user, index) => {
                    const level = FASTING_LEVELS.find(l => l.id === user.level);
                    const levelColor = level?.color || '#4ECDC4';

                    return (
                      <div
                        key={user.id || index}
                        style={{
                          display: 'flex',
                          alignItems: 'center',
                          gap: '12px',
                          padding: '12px',
                          background: 'var(--color-background, #FFFFFF)',
                          border: '1px solid var(--color-border-subtle, #F1F5F9)',
                          borderRadius: '8px',
                          transition: 'all 0.2s'
                        }}
                      >
                        {/* Avatar */}
                        <div
                          style={{
                            width: '40px',
                            height: '40px',
                            borderRadius: '50%',
                            background: levelColor,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            color: 'white',
                            fontWeight: '600',
                            fontSize: '16px',
                            flexShrink: 0
                          }}
                        >
                          {user.nickname[0]?.toUpperCase() || 'A'}
                        </div>

                        {/* User Info */}
                        <div style={{ flex: 1, minWidth: 0 }}>
                          <div style={{
                            fontSize: '14px',
                            fontWeight: '500',
                            color: 'var(--color-text, #0F172A)',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            whiteSpace: 'nowrap'
                          }}>
                            {user.nickname}
                          </div>
                          <div style={{
                            fontSize: '12px',
                            color: 'var(--color-text-tertiary, #94A3B8)'
                          }}>
                            {level?.label || 'Fasting'}
                          </div>
                        </div>

                        {/* Hours */}
                        <div style={{
                          fontSize: '16px',
                          fontWeight: '600',
                          color: levelColor,
                          flexShrink: 0
                        }}>
                          {user.fastingHours}h
                        </div>
                      </div>
                    );
                  })}
                </div>
              </>
            )}
          </div>

        </div>
      </div>
    </div>
  );
}
