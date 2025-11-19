// components/Support/SupportPage.jsx
import React from 'react';

/**
 * SupportPage - Support the Project
 *
 * Buy Me a Coffee, Affiliate Links, Merch Shop
 */
export default function SupportPage() {
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

          {/* Card 1: Buy Me a Coffee */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>ONE-TIME DONATION</h2>

            <div style={{ fontSize: '80px', textAlign: 'center', marginBottom: '24px' }}>☕</div>

            <h3 style={titleStyle}>Buy Me a Coffee</h3>
            <p style={textStyle}>
              Support development with a one-time donation. Every coffee helps keep
              IF-Timer free, ad-free, and constantly improving.
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Why Support?</h3>
            <ul style={{ ...textStyle, paddingLeft: '20px', listStyle: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>Keeps the app free for everyone</li>
              <li style={{ marginBottom: '8px' }}>No ads or tracking</li>
              <li style={{ marginBottom: '8px' }}>Funds server costs</li>
              <li style={{ marginBottom: '8px' }}>Supports new features</li>
            </ul>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Your Impact</h3>
            <p style={textStyle}>
              With your support, we can continue adding features, improving performance,
              and keeping IF-Timer accessible to everyone worldwide.
            </p>

            <a
              href="https://www.buymeacoffee.com/yourhandle"
              target="_blank"
              rel="noopener noreferrer"
              style={{
                display: 'block',
                marginTop: '32px',
                padding: '16px 24px',
                background: '#FFDD00',
                color: '#000000',
                textAlign: 'center',
                borderRadius: '8px',
                textDecoration: 'none',
                fontWeight: '600',
                fontSize: '16px',
                transition: 'all 0.2s'
              }}
            >
              ☕ Buy Me a Coffee
            </a>
          </div>

          {/* Card 2: Affiliate Links */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>AFFILIATE LINKS</h2>

            <div style={{ fontSize: '80px', textAlign: 'center', marginBottom: '24px' }}>🔗</div>

            <h3 style={titleStyle}>Recommended Products</h3>
            <p style={textStyle}>
              Products we personally use and recommend for your intermittent fasting
              journey. We earn a small commission at no extra cost to you.
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Coming Soon</h3>
            <ul style={{ ...textStyle, paddingLeft: '20px', listStyle: 'none' }}>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  📚 Books
                </div>
                <div style={{ fontSize: '13px' }}>IF guides and nutrition books</div>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  🧪 Supplements
                </div>
                <div style={{ fontSize: '13px' }}>Electrolytes, vitamins, etc.</div>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  ⚖️ Health Tracking
                </div>
                <div style={{ fontSize: '13px' }}>Smart scales and monitors</div>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  🥤 Fasting Aids
                </div>
                <div style={{ fontSize: '13px' }}>Zero-calorie drinks and more</div>
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
              <p style={{ ...textStyle, marginBottom: '8px', color: '#4ECDC4', fontWeight: '600' }}>
                Launching Soon
              </p>
              <p style={{ ...textStyle, marginBottom: 0, fontSize: '13px' }}>
                We're curating the best products for your IF journey
              </p>
            </div>
          </div>

          {/* Card 3: Merch Shop */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>MERCH SHOP</h2>

            <div style={{ fontSize: '80px', textAlign: 'center', marginBottom: '24px' }}>👕</div>

            <h3 style={titleStyle}>IF-Themed Merch</h3>
            <p style={textStyle}>
              Show your love for intermittent fasting with our exclusive merchandise.
              T-shirts, mugs, stickers, and more.
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Coming Soon</h3>
            <ul style={{ ...textStyle, paddingLeft: '20px', listStyle: 'none' }}>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  👕 T-Shirts
                </div>
                <div style={{ fontSize: '13px' }}>Funny IF quotes and designs</div>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  ☕ Mugs
                </div>
                <div style={{ fontSize: '13px' }}>Perfect for your fasting coffee</div>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  🎒 Accessories
                </div>
                <div style={{ fontSize: '13px' }}>Stickers, water bottles, etc.</div>
              </li>
              <li style={{ marginBottom: '12px' }}>
                <div style={{ fontWeight: '600', color: 'var(--color-text, #0F172A)', marginBottom: '4px' }}>
                  🎁 Gift Sets
                </div>
                <div style={{ fontSize: '13px' }}>Perfect for fellow fasters</div>
              </li>
            </ul>

            <div style={{
              marginTop: '32px',
              padding: '16px',
              background: 'rgba(168, 85, 247, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(168, 85, 247, 0.3)',
              textAlign: 'center'
            }}>
              <p style={{ ...textStyle, marginBottom: '8px', color: '#A855F7', fontWeight: '600' }}>
                Shop Opening Soon
              </p>
              <p style={{ ...textStyle, marginBottom: 0, fontSize: '13px' }}>
                Designing exclusive IF-Timer merch
              </p>
            </div>
          </div>

        </div>

        {/* Thank You Section */}
        <div style={{
          marginTop: '32px',
          padding: '24px',
          background: 'var(--color-background-secondary, #F8FAFC)',
          borderRadius: '16px',
          textAlign: 'center',
          border: '1px solid var(--color-border, #E2E8F0)'
        }}>
          <h3 style={{ ...titleStyle, marginBottom: '8px' }}>Thank You! 🙏</h3>
          <p style={{ ...textStyle, marginBottom: 0 }}>
            Your support helps keep IF-Timer free, open-source, and ad-free for everyone.
          </p>
        </div>
      </div>
    </div>
  );
}
