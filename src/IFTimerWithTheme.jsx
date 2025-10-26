import React, { useState } from 'react';
import { useTheme } from './ThemeContext';
import { getThemeColors } from './themeConfig';
import Settings from './Settings';

const IFTimerWithTheme = () => {
  const { theme } = useTheme();
  const colors = getThemeColors(theme === 'dark');
  const [activeTab, setActiveTab] = useState('timer');

  const navItems = [
    { id: 'timer', label: 'Timer' },
    { id: 'stats', label: 'Stats' },
    { id: 'learn', label: 'Learn' },
    { id: 'settings', label: 'Settings' }
  ];

  const renderContent = () => {
    if (activeTab === 'settings') {
      return <Settings />;
    }

    switch(activeTab) {
      case 'timer':
        return (
          <div style={{ 
            textAlign: 'center', 
            padding: '80px 40px',
            maxWidth: '500px',
            margin: '0 auto'
          }}>
            {/* Subtle streak indicator */}
            <div style={{
              fontSize: '13px',
              color: colors.textTertiary,
              marginBottom: '60px',
              fontWeight: '400',
              letterSpacing: '0.5px'
            }}>
              12 day streak
            </div>

            {/* Timer Ring */}
            <div style={{ 
              width: '280px', 
              height: '280px', 
              margin: '0 auto 50px',
              position: 'relative'
            }}>
              <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
                <defs>
                  <linearGradient id="timerGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                    <stop offset="0%" style={{ stopColor: colors.accentRed, stopOpacity: 1 }} />
                    <stop offset="100%" style={{ stopColor: colors.accentTeal, stopOpacity: 1 }} />
                  </linearGradient>
                </defs>
                <circle 
                  cx="140" 
                  cy="140" 
                  r="130" 
                  fill="none" 
                  stroke={colors.ringBackground} 
                  strokeWidth="12"
                />
                <circle 
                  cx="140" 
                  cy="140" 
                  r="130" 
                  fill="none" 
                  stroke="url(#timerGradient)" 
                  strokeWidth="12"
                  strokeLinecap="round"
                  strokeDasharray="817"
                  strokeDashoffset="204"
                  style={{ transition: 'stroke-dashoffset 1s linear' }}
                />
              </svg>
              <div style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                textAlign: 'center'
              }}>
                <div style={{ 
                  fontSize: '48px', 
                  fontWeight: '400', 
                  color: colors.text,
                  marginBottom: '8px',
                  letterSpacing: '-1px',
                  fontVariantNumeric: 'tabular-nums'
                }}>
                  12:45:30
                </div>
                <div style={{ 
                  fontSize: '13px', 
                  color: colors.textTertiary,
                  fontWeight: '400',
                  letterSpacing: '1px'
                }}>
                  remaining
                </div>
              </div>
            </div>

            {/* Minimal stats */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              gap: '60px',
              marginBottom: '50px',
              fontSize: '14px',
              color: colors.textSecondary
            }}>
              <div>
                <span style={{ fontWeight: '500', color: colors.accentTeal }}>247h</span> total
              </div>
              <div>
                <span style={{ fontWeight: '500', color: colors.accentTeal }}>16h</span> goal
              </div>
            </div>

            {/* Simple action */}
            <button style={{
              background: 'transparent',
              border: 'none',
              color: colors.textSecondary,
              padding: '12px 24px',
              fontSize: '14px',
              fontWeight: '400',
              cursor: 'pointer',
              fontFamily: 'Poppins, sans-serif',
              transition: 'color 0.2s',
              letterSpacing: '0.3px'
            }}
            onMouseEnter={(e) => e.target.style.color = colors.accentRed}
            onMouseLeave={(e) => e.target.style.color = colors.textSecondary}
            >
              Cancel
            </button>
          </div>
        );

      case 'stats':
        return (
          <div style={{ 
            padding: '80px 40px',
            maxWidth: '800px',
            margin: '0 auto'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '400', 
              color: colors.text,
              marginBottom: '60px',
              letterSpacing: '-0.3px'
            }}>
              Statistics
            </h2>
            
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: window.innerWidth > 600 ? 'repeat(2, 1fr)' : '1fr',
              gap: '24px'
            }}>
              {[
                { label: 'Total fasted', value: '247', unit: 'hours', color: colors.accentTeal },
                { label: 'Longest fast', value: '24', unit: 'hours', color: colors.accentOrange },
                { label: 'Current streak', value: '12', unit: 'days', color: colors.accentRed },
                { label: 'Completed fasts', value: '18', unit: 'times', color: colors.accentGreen }
              ].map(stat => (
                <div key={stat.label} style={{
                  padding: '32px',
                  borderBottom: `1px solid ${colors.borderSubtle}`
                }}>
                  <div style={{ 
                    fontSize: '48px', 
                    fontWeight: '400',
                    color: stat.color,
                    marginBottom: '8px',
                    letterSpacing: '-1px'
                  }}>
                    {stat.value}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: colors.textTertiary,
                    marginBottom: '4px',
                    letterSpacing: '0.5px'
                  }}>
                    {stat.unit}
                  </div>
                  <div style={{ 
                    fontSize: '14px', 
                    fontWeight: '400', 
                    color: colors.textSecondary,
                    letterSpacing: '0.3px'
                  }}>
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
          </div>
        );

      case 'learn':
        return (
          <div style={{ 
            padding: '80px 40px',
            maxWidth: '700px',
            margin: '0 auto'
          }}>
            <h2 style={{ 
              fontSize: '24px', 
              fontWeight: '400', 
              color: colors.text,
              marginBottom: '60px',
              letterSpacing: '-0.3px'
            }}>
              Learn
            </h2>
            
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1px' }}>
              {[
                { title: 'What is intermittent fasting', time: '5 min' },
                { title: 'Benefits of 16:8 fasting', time: '3 min' },
                { title: 'Tips for beginners', time: '4 min' },
                { title: 'Breaking your fast correctly', time: '6 min' },
                { title: 'Common mistakes to avoid', time: '5 min' }
              ].map(article => (
                <div key={article.title} style={{
                  padding: '24px 0',
                  borderBottom: `1px solid ${colors.borderSubtle}`,
                  cursor: 'pointer',
                  transition: 'padding-left 0.2s'
                }}
                onMouseEnter={(e) => e.currentTarget.style.paddingLeft = '8px'}
                onMouseLeave={(e) => e.currentTarget.style.paddingLeft = '0'}
                >
                  <div style={{ 
                    fontSize: '16px', 
                    fontWeight: '400', 
                    color: colors.text,
                    marginBottom: '6px',
                    letterSpacing: '-0.2px'
                  }}>
                    {article.title}
                  </div>
                  <div style={{ 
                    fontSize: '13px', 
                    color: colors.textTertiary,
                    letterSpacing: '0.3px'
                  }}>
                    {article.time} read
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
    }
  };

  return (
    <div style={{
      fontFamily: 'Poppins, sans-serif',
      background: colors.background,
      minHeight: '100vh',
      color: colors.text
    }}>
      {/* Top Bar */}
      {activeTab !== 'settings' && (
        <div style={{
          borderBottom: `1px solid ${colors.border}`,
          padding: '20px 40px',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          position: 'sticky',
          top: 0,
          background: colors.background,
          zIndex: 100
        }}>
          {/* Logo */}
          <div style={{ 
            fontSize: '16px', 
            fontWeight: '500', 
            color: colors.text,
            letterSpacing: '-0.3px'
          }}>
            IF Timer
          </div>

          {/* Navigation */}
          <nav style={{ 
            display: 'flex',
            gap: '32px'
          }}>
            {navItems.map(item => (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id)}
                style={{
                  background: 'transparent',
                  border: 'none',
                  color: activeTab === item.id ? colors.text : colors.textSecondary,
                  padding: '8px 0',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontWeight: activeTab === item.id ? '500' : '400',
                  fontFamily: 'Poppins, sans-serif',
                  transition: 'color 0.2s',
                  borderBottom: activeTab === item.id ? `2px solid ${colors.accentTeal}` : '2px solid transparent',
                  letterSpacing: '0.2px'
                }}
              >
                {item.label}
              </button>
            ))}
          </nav>

          {/* Subtle streak */}
          <div style={{
            fontSize: '13px',
            color: colors.textTertiary,
            fontWeight: '400',
            letterSpacing: '0.3px'
          }}>
            12 days
          </div>
        </div>
      )}

      {/* Content */}
      <div>
        {renderContent()}
      </div>
    </div>
  );
};

export default IFTimerWithTheme;
