// components/Support/SupportPage.jsx
import React from 'react';

/**
 * SupportPage - Support the Project
 *
 * Buy Me a Coffee, Affiliate Links, Merch Shop
 */
export default function SupportPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-text mb-4">Support IF-Timer</h1>
      <p className="text-lg text-text-secondary mb-8">
        Help keep this project free and ad-free
      </p>

      <div className="grid md:grid-cols-3 gap-6">
        {/* Buy Me a Coffee */}
        <div className="p-6 border border-border rounded-lg hover:border-accent-yellow transition-all">
          <div className="text-4xl mb-4">☕</div>
          <h3 className="text-xl font-semibold text-text mb-2">Buy Me a Coffee</h3>
          <p className="text-sm text-text-secondary mb-4">
            Support development with a one-time donation
          </p>
          <a
            href="https://www.buymeacoffee.com/yourhandle"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block px-4 py-2 bg-accent-yellow text-white rounded-lg hover:bg-accent-yellow/90 transition-colors text-sm font-medium"
          >
            Donate Now
          </a>
        </div>

        {/* Affiliate Links */}
        <div className="p-6 border border-border rounded-lg hover:border-accent-teal transition-all">
          <div className="text-4xl mb-4">🔗</div>
          <h3 className="text-xl font-semibold text-text mb-2">Affiliate Links</h3>
          <p className="text-sm text-text-secondary mb-4">
            Products we recommend (we earn a small commission)
          </p>
          <button
            disabled
            className="inline-block px-4 py-2 bg-border text-text-tertiary rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>

        {/* Merch Shop */}
        <div className="p-6 border border-border rounded-lg hover:border-accent-purple transition-all">
          <div className="text-4xl mb-4">👕</div>
          <h3 className="text-xl font-semibold text-text mb-2">Merch Shop</h3>
          <p className="text-sm text-text-secondary mb-4">
            T-shirts, mugs, and more IF-themed merch
          </p>
          <button
            disabled
            className="inline-block px-4 py-2 bg-border text-text-tertiary rounded-lg text-sm font-medium cursor-not-allowed"
          >
            Coming Soon
          </button>
        </div>
      </div>

      <div className="mt-12 p-6 bg-background-secondary rounded-lg text-center">
        <h3 className="text-lg font-semibold text-text mb-2">Thank You! 🙏</h3>
        <p className="text-text-secondary">
          Your support helps keep IF-Timer free, open-source, and ad-free for everyone.
        </p>
      </div>
    </div>
  );
}
