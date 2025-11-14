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

  const modes = [
    {
      id: 'scientific',
      name: '🔬 Scientific Mode',
      description: 'Evidence-based information with research citations',
      color: 'text-blue-600'
    },
    {
      id: 'hippie',
      name: '🌿 Hippie Mode',
      description: 'Holistic approach, mindfulness, natural vibes',
      color: 'text-green-600'
    },
    {
      id: 'pro',
      name: '💀 Pro Mode',
      description: 'No-nonsense, sarcastic, brutally honest (for masochists)',
      color: 'text-red-600'
    }
  ];

  const themeOptions = [
    { id: 'light', name: 'Light', icon: '☀️', description: 'Always use light theme' },
    { id: 'dark', name: 'Dark', icon: '🌙', description: 'Always use dark theme' },
    { id: 'auto', name: 'System', icon: '💻', description: 'Match system preference' }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-text dark:text-text-dark mb-4">Modes</h1>
      <p className="text-lg text-text-secondary dark:text-text-dark-secondary mb-8">
        Choose your preferred content style and theme
      </p>

      {/* Theme Switcher */}
      <div className="mb-8 p-6 border border-border dark:border-border-dark rounded-lg bg-background dark:bg-background-dark">
        <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-3">
          🌓 Theme
        </h3>
        <p className="text-sm text-text-secondary dark:text-text-dark-secondary mb-4">
          Choose your preferred color scheme
        </p>

        <div className="grid grid-cols-3 gap-3">
          {themeOptions.map((option) => (
            <button
              key={option.id}
              onClick={() => setThemePreference(option.id)}
              className={`
                p-4 rounded-lg border-2 transition-all
                ${themePreference === option.id
                  ? 'border-accent-teal bg-accent-teal/10'
                  : 'border-border dark:border-border-dark hover:border-accent-teal/50'
                }
              `}
            >
              <div className="text-2xl mb-2">{option.icon}</div>
              <div className={`font-semibold mb-1 ${themePreference === option.id ? 'text-accent-teal' : 'text-text dark:text-text-dark'}`}>
                {option.name}
              </div>
              <div className="text-xs text-text-secondary dark:text-text-dark-secondary">
                {option.description}
              </div>
            </button>
          ))}
        </div>

        <p className="text-xs text-text-tertiary dark:text-text-dark-tertiary mt-4">
          Current selection: <strong className="text-accent-teal">{themePreference === 'auto' ? 'System' : themePreference.charAt(0).toUpperCase() + themePreference.slice(1)}</strong>
          {themePreference === 'auto' && (
            <span className="ml-2">
              (Currently: <strong>{activeTheme === 'dark' ? 'Dark' : 'Light'}</strong>)
            </span>
          )}
        </p>
      </div>

      {/* Content Modes */}
      <h3 className="text-xl font-semibold text-text dark:text-text-dark mb-4">
        Content Style
      </h3>
      <div className="grid gap-6">
        {modes.map((mode) => (
          <div
            key={mode.id}
            className="p-6 border border-border dark:border-border-dark rounded-lg hover:border-accent-teal transition-all cursor-pointer bg-background dark:bg-background-dark"
          >
            <h3 className={`text-2xl font-semibold mb-2 ${mode.color}`}>
              {mode.name}
            </h3>
            <p className="text-text-secondary dark:text-text-dark-secondary">{mode.description}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-text-tertiary dark:text-text-dark-tertiary mt-8 text-center">
        Mode selection coming soon - will change app tone and content style
      </p>
    </div>
  );
}
