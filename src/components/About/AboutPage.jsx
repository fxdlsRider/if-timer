// components/About/AboutPage.jsx
import React from 'react';

/**
 * AboutPage - About the Project
 *
 * Mission, story, team, tech stack
 */
export default function AboutPage() {
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

  return (
    <div className="min-h-screen py-8 px-4" style={{ background: 'var(--color-background, #FFFFFF)' }}>
      <div className="max-w-5xl mx-auto">
        {/* 3-Column Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">

          {/* Card 1: Mission & Values */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>OUR MISSION</h2>

            <h3 style={titleStyle}>Simple & Effective</h3>
            <p style={textStyle}>
              To provide a simple, beautiful, and effective tool for anyone practicing
              intermittent fasting. No ads, no tracking, no premium paywalls for basic features.
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Core Values</h3>
            <ul style={{ ...textStyle, paddingLeft: '20px', listStyle: 'none' }}>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  🎯 Simplicity First
                </div>
                <div style={{ fontSize: '13px' }}>No unnecessary complexity</div>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  🔒 Privacy Focused
                </div>
                <div style={{ fontSize: '13px' }}>Your data stays yours</div>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  💚 Free Forever
                </div>
                <div style={{ fontSize: '13px' }}>Core features always free</div>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  🌍 Open Source
                </div>
                <div style={{ fontSize: '13px' }}>Transparent and community-driven</div>
              </li>
            </ul>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Why IF-Timer?</h3>
            <p style={textStyle}>
              We believe everyone should have access to quality health tools without
              sacrificing privacy or paying for basic features.
            </p>
          </div>

          {/* Card 2: Tech Stack */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>TECH STACK</h2>

            <h3 style={titleStyle}>Built with Modern Tools</h3>
            <p style={textStyle}>
              IF-Timer is built with cutting-edge web technologies to ensure
              speed, reliability, and great user experience.
            </p>

            <div style={{ display: 'flex', flexDirection: 'column', gap: '16px', marginTop: '24px' }}>
              <div style={{
                padding: '16px',
                background: 'var(--color-background, #FFFFFF)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-subtle, #F1F5F9)'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  Frontend
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary, #94A3B8)' }}>
                  React 19, Tailwind CSS
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: 'var(--color-background, #FFFFFF)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-subtle, #F1F5F9)'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  Backend
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary, #94A3B8)' }}>
                  Supabase (PostgreSQL)
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: 'var(--color-background, #FFFFFF)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-subtle, #F1F5F9)'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  Hosting
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary, #94A3B8)' }}>
                  Vercel (Edge Network)
                </div>
              </div>

              <div style={{
                padding: '16px',
                background: 'var(--color-background, #FFFFFF)',
                borderRadius: '8px',
                border: '1px solid var(--color-border-subtle, #F1F5F9)'
              }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  Authentication
                </div>
                <div style={{ fontSize: '13px', color: 'var(--color-text-tertiary, #94A3B8)' }}>
                  Magic Link (passwordless)
                </div>
              </div>
            </div>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Performance</h3>
            <p style={textStyle}>
              Optimized for speed and reliability with edge caching,
              real-time sync, and offline support.
            </p>
          </div>

          {/* Card 3: Open Source & Contact */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>GET INVOLVED</h2>

            <h3 style={titleStyle}>Open Source</h3>
            <p style={textStyle}>
              IF-Timer is fully open source. Anyone can view the code,
              suggest improvements, or contribute features.
            </p>

            <div style={{
              padding: '16px',
              background: 'var(--color-background, #FFFFFF)',
              borderRadius: '8px',
              border: '1px solid var(--color-border-subtle, #F1F5F9)',
              marginBottom: '24px'
            }}>
              <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '8px' }}>
                GitHub Repository
              </div>
              <a
                href="https://github.com/fxdlsRider/if-timer"
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  fontSize: '13px',
                  color: '#4ECDC4',
                  textDecoration: 'none'
                }}
              >
                github.com/fxdlsRider/if-timer →
              </a>
            </div>

            <h3 style={titleStyle}>Contact</h3>
            <p style={textStyle}>
              Questions, feedback, or want to contribute? We'd love to hear from you.
            </p>

            <ul style={{ ...textStyle, paddingLeft: '20px', listStyle: 'none' }}>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  💬 Issues & Bugs
                </div>
                <div style={{ fontSize: '13px' }}>Report on GitHub Issues</div>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  ✨ Feature Requests
                </div>
                <div style={{ fontSize: '13px' }}>Submit ideas on GitHub</div>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  🤝 Contribute
                </div>
                <div style={{ fontSize: '13px' }}>Pull requests welcome</div>
              </li>
            </ul>

            <div style={{
              marginTop: '32px',
              padding: '16px',
              background: 'rgba(78, 205, 196, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(78, 205, 196, 0.3)',
              textAlign: 'center'
            }}>
              <p style={{ ...textStyle, marginBottom: 0, color: '#4ECDC4', fontWeight: '600' }}>
                Built with ❤️ by the community
              </p>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
}
