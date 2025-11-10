// components/Training/TrainingPage.jsx
import React from 'react';

/**
 * TrainingPage - Learn about Intermittent Fasting
 *
 * Educational content about IF concepts, benefits, science
 */
export default function TrainingPage() {
  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-text mb-4">Training</h1>
      <p className="text-lg text-text-secondary mb-8">
        Learn everything about Intermittent Fasting
      </p>

      <div className="prose prose-lg max-w-none">
        <h2 className="text-2xl font-semibold text-text mt-8 mb-4">Coming Soon</h2>
        <p className="text-text-secondary">
          This section will contain comprehensive training materials about:
        </p>
        <ul className="space-y-2 text-text-secondary mt-4">
          <li>• What is Intermittent Fasting?</li>
          <li>• Health benefits and science</li>
          <li>• Different fasting protocols</li>
          <li>• Tips for beginners</li>
          <li>• Common mistakes to avoid</li>
          <li>• FAQ and troubleshooting</li>
        </ul>
      </div>
    </div>
  );
}
