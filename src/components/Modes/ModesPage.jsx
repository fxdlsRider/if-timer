// components/Modes/ModesPage.jsx
import React, { useEffect } from 'react';
import { useTheme } from '../../ThemeContext';

/**
 * ModesPage - Different UI/Content Modes
 *
 * Scientific, Hippie, Pro Mode (sarcasm)
 * Includes Light/Dark/System Theme Switcher
 */
export default function ModesPage() {
  const { themePreference, setTheme: setThemePreference, theme: activeTheme } = useTheme();

  // Update the DOM class based on active theme
  useEffect(() => {
    const root = document.documentElement;
    if (activeTheme === 'dark') {
      root.classList.add('dark');
    } else {
      root.classList.remove('dark');
    }
  }, [activeTheme]);

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

  const titleStyle = {
    fontSize: '24px',
    fontWeight: '600',
    color: 'var(--color-text, #0F172A)',
    marginBottom: '16px'
  };

  const textStyle = {
    fontSize: '14px',
    color: 'var(--color-text-secondary, #64748B)',
    lineHeight: '1.6',
    marginBottom: '16px'
  };

  const themeOptions = [
    { id: 'light', name: 'Light', icon: '☀️', description: 'Always use light theme' },
    { id: 'dark', name: 'Dark', icon: '🌙', description: 'Always use dark theme' },
    { id: 'auto', name: 'System', icon: '💻', description: 'Match system preference' }
  ];

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--color-background, #FFFFFF)' }}>
      <div className="max-w-5xl mx-auto">
        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Card 1: Scientific Mode */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>SCIENTIFIC MODE</h2>

            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '24px' }}>🔬</div>

            <h3 style={titleStyle}>Evidence-Based Approach</h3>
            <p style={textStyle}>
              Get information backed by peer-reviewed research and scientific studies.
              Perfect for those who want facts, data, and citations.
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>What You Get</h3>
            <ul style={{ ...textStyle, paddingLeft: '20px', listStyle: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>Research citations and sources</li>
              <li style={{ marginBottom: '8px' }}>Evidence-based recommendations</li>
              <li style={{ marginBottom: '8px' }}>Clinical study references</li>
              <li style={{ marginBottom: '8px' }}>Data-driven insights</li>
            </ul>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Best For</h3>
            <p style={textStyle}>
              Health professionals, data enthusiasts, skeptics who need proof,
              and anyone who prefers a scientific approach to wellness.
            </p>

            <div style={{
              marginTop: '32px',
              padding: '16px',
              background: 'rgba(59, 130, 246, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(59, 130, 246, 0.3)'
            }}>
              <p style={{ ...textStyle, marginBottom: 0, color: '#2563EB', fontWeight: '600' }}>
                Coming Soon
              </p>
            </div>
          </div>

          {/* Card 2: Hippie Mode */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>HIPPIE MODE</h2>

            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '24px' }}>🌿</div>

            <h3 style={titleStyle}>Holistic & Mindful</h3>
            <p style={textStyle}>
              Experience fasting as a spiritual journey. Focus on mindfulness,
              natural wellness, and connection with your body.
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>What You Get</h3>
            <ul style={{ ...textStyle, paddingLeft: '20px', listStyle: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>Mindfulness exercises</li>
              <li style={{ marginBottom: '8px' }}>Natural healing tips</li>
              <li style={{ marginBottom: '8px' }}>Holistic approach to wellness</li>
              <li style={{ marginBottom: '8px' }}>Positive vibes and encouragement</li>
            </ul>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Best For</h3>
            <p style={textStyle}>
              Yoga enthusiasts, meditation practitioners, nature lovers,
              and those seeking a gentler, more spiritual approach.
            </p>

            <div style={{
              marginTop: '32px',
              padding: '16px',
              background: 'rgba(34, 197, 94, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(34, 197, 94, 0.3)'
            }}>
              <p style={{ ...textStyle, marginBottom: 0, color: '#16A34A', fontWeight: '600' }}>
                Coming Soon
              </p>
            </div>

            {/* Theme Switcher */}
            <div style={{ marginTop: '32px' }}>
              <h3 style={{ ...titleStyle, fontSize: '16px', marginBottom: '12px' }}>🌓 Theme</h3>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                {themeOptions.map((option) => (
                  <button
                    key={option.id}
                    onClick={() => setThemePreference(option.id)}
                    style={{
                      padding: '12px',
                      borderRadius: '8px',
                      border: themePreference === option.id
                        ? '2px solid #4ECDC4'
                        : '1px solid var(--color-border, #E2E8F0)',
                      background: themePreference === option.id
                        ? 'rgba(78, 205, 196, 0.1)'
                        : 'var(--color-background, #FFFFFF)',
                      cursor: 'pointer',
                      textAlign: 'left',
                      transition: 'all 0.2s'
                    }}
                  >
                    <div style={{ fontSize: '16px', marginBottom: '4px' }}>{option.icon} {option.name}</div>
                    <div style={{ fontSize: '11px', color: 'var(--color-text-secondary, #64748B)' }}>
                      {option.description}
                    </div>
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Card 3: Pro Mode */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>PRO MODE</h2>

            <div style={{ fontSize: '48px', textAlign: 'center', marginBottom: '24px' }}>💀</div>

            <h3 style={titleStyle}>No-Nonsense Truth</h3>
            <p style={textStyle}>
              For masochists who want brutally honest, sarcastic feedback.
              No sugar-coating, no hand-holding, just raw truth.
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>What You Get</h3>
            <ul style={{ ...textStyle, paddingLeft: '20px', listStyle: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>Brutally honest feedback</li>
              <li style={{ marginBottom: '8px' }}>Sarcastic motivational messages</li>
              <li style={{ marginBottom: '8px' }}>No excuses, no BS approach</li>
              <li style={{ marginBottom: '8px' }}>Dark humor and tough love</li>
            </ul>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Best For</h3>
            <p style={textStyle}>
              People who respond to tough love, sarcasm enthusiasts,
              those who hate sugarcoating, and masochists.
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Warning</h3>
            <p style={textStyle}>
              This mode will call you out on your excuses. It won't pat you on
              the back for doing the bare minimum. You've been warned.
            </p>

            <div style={{
              marginTop: '32px',
              padding: '16px',
              background: 'rgba(239, 68, 68, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(239, 68, 68, 0.3)'
            }}>
              <p style={{ ...textStyle, marginBottom: 0, color: '#DC2626', fontWeight: '600' }}>
                Coming Soon (If you dare)
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
