// components/About/AboutPage.jsx
import React from 'react';

/**
 * AboutPage - About the Project
 *
 * Mission, story, team, tech stack
 */
export default function AboutPage() {
  return (
    <div className="max-w-3xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-text mb-4">About IF-Timer</h1>
      <p className="text-lg text-text-secondary mb-8">
        A modern, open-source intermittent fasting timer
      </p>

      <div className="prose prose-lg max-w-none">
        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-text mb-4">Our Mission</h2>
          <p className="text-text-secondary leading-relaxed">
            To provide a simple, beautiful, and effective tool for anyone practicing intermittent fasting.
            No ads, no tracking, no premium paywalls for basic features.
          </p>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-text mb-4">Core Values</h2>
          <ul className="space-y-3 text-text-secondary">
            <li>🎯 <strong>Simplicity First</strong> - No unnecessary complexity</li>
            <li>🔒 <strong>Privacy Focused</strong> - Your data stays yours</li>
            <li>💚 <strong>Free Forever</strong> - Core features always free</li>
            <li>🌍 <strong>Open Source</strong> - Transparent and community-driven</li>
          </ul>
        </section>

        <section className="mb-10">
          <h2 className="text-2xl font-semibold text-text mb-4">Tech Stack</h2>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="p-3 bg-background-secondary rounded">
              <div className="font-semibold text-text mb-1">Frontend</div>
              <div className="text-text-tertiary">React 19, Tailwind CSS</div>
            </div>
            <div className="p-3 bg-background-secondary rounded">
              <div className="font-semibold text-text mb-1">Backend</div>
              <div className="text-text-tertiary">Supabase</div>
            </div>
            <div className="p-3 bg-background-secondary rounded">
              <div className="font-semibold text-text mb-1">Hosting</div>
              <div className="text-text-tertiary">Vercel</div>
            </div>
            <div className="p-3 bg-background-secondary rounded">
              <div className="font-semibold text-text mb-1">Auth</div>
              <div className="text-text-tertiary">Magic Link</div>
            </div>
          </div>
        </section>

        <section>
          <h2 className="text-2xl font-semibold text-text mb-4">Contact</h2>
          <p className="text-text-secondary">
            Questions, feedback, or want to contribute? Reach out through our support channels.
          </p>
        </section>
      </div>
    </div>
  );
}
