// components/Resources/ResourcesPage.jsx
import React from 'react';

/**
 * ResourcesPage - External Resources
 *
 * Links to articles, research, books, videos about IF
 */
export default function ResourcesPage() {
  const categories = [
    {
      title: '📚 Research Papers',
      description: 'Scientific studies about intermittent fasting',
      items: ['Coming soon...']
    },
    {
      title: '📖 Books',
      description: 'Recommended reading about IF and health',
      items: ['Coming soon...']
    },
    {
      title: '🎥 Videos',
      description: 'Educational videos and documentaries',
      items: ['Coming soon...']
    },
    {
      title: '🔗 Websites',
      description: 'Useful websites and communities',
      items: ['Coming soon...']
    }
  ];

  return (
    <div className="max-w-4xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-text mb-4">Resources</h1>
      <p className="text-lg text-text-secondary mb-8">
        Curated collection of IF resources, research, and tools
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        {categories.map((category, index) => (
          <div key={index} className="p-6 border border-border rounded-lg">
            <h3 className="text-xl font-semibold text-text mb-2">{category.title}</h3>
            <p className="text-sm text-text-secondary mb-4">{category.description}</p>
            <ul className="space-y-2">
              {category.items.map((item, i) => (
                <li key={i} className="text-text-tertiary text-sm">• {item}</li>
              ))}
            </ul>
          </div>
        ))}
      </div>
    </div>
  );
}
