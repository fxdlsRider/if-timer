// components/Hub/HubPage.jsx
import React from 'react';

/**
 * HubPage - User Hub
 *
 * For logged-in users: Statistics, Profile, Settings
 * For guests: Sign Up / Sign In prompt
 */
export default function HubPage({ user, onSignIn }) {
  if (!user) {
    return (
      <div className="max-w-2xl mx-auto px-6 py-16 text-center">
        <h1 className="text-4xl font-bold text-text mb-4">Welcome to Your Hub</h1>
        <p className="text-lg text-text-secondary mb-8">
          Sign in to access your personal statistics, achievements, and profile
        </p>

        <button
          onClick={onSignIn}
          className="px-8 py-3 bg-accent-teal text-white rounded-lg font-medium hover:bg-accent-teal/90 transition-colors"
        >
          Sign In / Sign Up
        </button>

        <div className="mt-12 grid gap-4 text-left">
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-text mb-2">📊 Your Statistics</h3>
            <p className="text-sm text-text-secondary">Track your fasting progress, streaks, and achievements</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-text mb-2">🎯 Personal Goals</h3>
            <p className="text-sm text-text-secondary">Set and monitor your health and fasting goals</p>
          </div>
          <div className="p-4 border border-border rounded-lg">
            <h3 className="font-semibold text-text mb-2">⚙️ Settings</h3>
            <p className="text-sm text-text-secondary">Customize notifications, themes, and preferences</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-text mb-4">Your Hub</h1>
      <p className="text-lg text-text-secondary mb-8">
        Welcome back, {user.email?.split('@')[0] || 'Faster'}!
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <div className="p-6 border border-border rounded-lg">
          <h3 className="text-xl font-semibold text-text mb-4">Statistics</h3>
          <p className="text-text-secondary">Your fasting stats will appear here</p>
        </div>
        <div className="p-6 border border-border rounded-lg">
          <h3 className="text-xl font-semibold text-text mb-4">Achievements</h3>
          <p className="text-text-secondary">Your badges and milestones</p>
        </div>
        <div className="p-6 border border-border rounded-lg">
          <h3 className="text-xl font-semibold text-text mb-4">Profile</h3>
          <p className="text-text-secondary">Manage your account settings</p>
        </div>
        <div className="p-6 border border-border rounded-lg">
          <h3 className="text-xl font-semibold text-text mb-4">Goals</h3>
          <p className="text-text-secondary">Track your fasting goals</p>
        </div>
      </div>
    </div>
  );
}
