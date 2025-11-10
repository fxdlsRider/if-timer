// components/Modes/ModesPage.jsx
import React from 'react';

/**
 * ModesPage - Different UI/Content Modes
 *
 * Scientific, Hippie, Pro Mode (sarcasm)
 */
export default function ModesPage() {
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

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-text mb-4">Modes</h1>
      <p className="text-lg text-text-secondary mb-8">
        Choose your preferred content style
      </p>

      <div className="grid gap-6">
        {modes.map((mode) => (
          <div
            key={mode.id}
            className="p-6 border border-border rounded-lg hover:border-accent-teal transition-all cursor-pointer"
          >
            <h3 className={`text-2xl font-semibold mb-2 ${mode.color}`}>
              {mode.name}
            </h3>
            <p className="text-text-secondary">{mode.description}</p>
          </div>
        ))}
      </div>

      <p className="text-sm text-text-tertiary mt-8 text-center">
        Mode selection coming soon - will change app tone and content style
      </p>
    </div>
  );
}
