// components/Navigation/NavigationHeader.jsx
import React, { useState } from 'react';
import { useTranslation } from '../../hooks/useTranslation';
import { FEATURE_FLAGS } from '../../config/constants';

/**
 * NavigationHeader Component
 *
 * Desktop-First Navigation inspired by zenhabits.net
 * Logo left, 7 menu items, responsive hamburger menu on mobile
 *
 * Menu Structure:
 * - Training: Learn about intermittent fasting
 * - Modes: Scientific, Hippie, Pro Mode (sarcasm)
 * - Hub: Sign In/Up (guests) or Statistics (logged in users)
 * - Graph-View: Who's fasting now (Obsidian-style)
 * - Resources: Links to IF resources
 * - About: About the project
 * - Support: Buy Me a Coffee, Affiliate, Merch
 *
 * @param {string} activeTab - Currently active tab
 * @param {function} onTabChange - Handler for tab switching
 * @param {object} user - Current user object (null if not logged in)
 * @param {function} onSignIn - Handler for sign in (used in Hub)
 */
export default function NavigationHeader({ activeTab, onTabChange, user = null, onSignIn = null }) {
  const { t } = useTranslation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const allMenuItems = [
    { id: 'timer', label: t('nav.timer'), description: 'Intermittent Fasting Timer' },
    { id: 'hub', label: t('nav.dashboard'), description: user ? 'Your Statistics' : 'Sign In / Sign Up' },
    { id: 'training', label: t('nav.learn'), description: 'Learn about IF', enabled: FEATURE_FLAGS.LEARN_ENABLED },
    { id: 'modes', label: t('nav.modes'), description: 'Scientific, Hippie, Pro', enabled: FEATURE_FLAGS.MODES_ENABLED },
    { id: 'community', label: t('nav.community'), description: 'Who\'s fasting now' },
    { id: 'about', label: t('nav.about'), description: 'About this project' },
    { id: 'support', label: t('nav.support'), description: 'Buy Me a Coffee & Shop', enabled: FEATURE_FLAGS.SUPPORT_ENABLED }
  ];

  // Filter menu items based on feature flags
  const menuItems = allMenuItems.filter(item => item.enabled !== false);

  const handleMenuClick = (itemId) => {
    // Special handling for hub when user not logged in or anonymous
    // Same logic as My Journey fix (commit 44f11f6)
    if (itemId === 'hub' && (!user || user.is_anonymous)) {
      // Anonymous users should sign in to access Dashboard
      if (onSignIn) {
        onSignIn();
      }
      setIsMobileMenuOpen(false);
      return; // Prevent navigation
    }

    // Normal navigation for authenticated email users
    onTabChange(itemId);
    setIsMobileMenuOpen(false);
  };

  const handleLogoClick = () => {
    onTabChange('timer'); // Always jump to timer homepage
    setIsMobileMenuOpen(false);
  };

  return (
    <header className="w-full bg-background sticky top-0 z-[100] border-b border-transparent dark:border-border-dark" style={{ background: 'var(--color-background-secondary)' }}>
      <div className="max-w-container mx-auto px-6 lg:px-10 h-16 flex items-center justify-center relative">

        {/* Logo - Left (absolute positioned) */}
        <button
          onClick={handleLogoClick}
          className="absolute left-6 lg:left-10 text-xl font-semibold text-text dark:text-text-dark hover:text-accent-teal transition-colors z-10"
        >
          IF-Timer
        </button>

        {/* Desktop Navigation - Centered */}
        <nav className="hidden md:flex items-center gap-8">
          {menuItems.map((item) => {
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`
                  relative py-5 px-2 text-sm font-normal transition-all duration-200
                  ${isActive
                    ? 'text-text dark:text-text-dark font-medium'
                    : 'text-text-secondary dark:text-text-dark-secondary hover:text-text dark:hover:text-text-dark hover:scale-105'
                  }
                `}
              >
                {item.label}
                {isActive && (
                  <div className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent-teal rounded-t" />
                )}
              </button>
            );
          })}
        </nav>

        {/* Mobile Hamburger Button - Right aligned */}
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="md:hidden absolute right-6 p-2 text-text dark:text-text-dark hover:text-accent-teal transition-colors"
          aria-label="Toggle menu"
        >
          {isMobileMenuOpen ? (
            // Close Icon (X)
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          ) : (
            // Hamburger Icon (3 lines)
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          )}
        </button>
      </div>

      {/* Mobile Menu Dropdown */}
      {isMobileMenuOpen && (
        <nav className="md:hidden bg-background dark:bg-background-dark-secondary border-t border-border dark:border-border-dark">
          <div className="px-6 py-4 space-y-1">
            {menuItems.map((item) => {
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => handleMenuClick(item.id)}
                  className={`
                    w-full text-left px-4 py-3 rounded-lg transition-colors
                    ${isActive
                      ? 'bg-accent-teal/10 text-accent-teal font-medium'
                      : 'text-text-secondary dark:text-text-dark-secondary hover:bg-background-secondary dark:hover:bg-background-dark hover:text-text dark:hover:text-text-dark'
                    }
                  `}
                >
                  <div className="font-medium">{item.label}</div>
                  <div className="text-xs text-text-tertiary dark:text-text-dark-tertiary mt-0.5">{item.description}</div>
                </button>
              );
            })}
          </div>
        </nav>
      )}
    </header>
  );
}
