// components/GraphView/GraphViewPage.jsx
import React from 'react';

/**
 * GraphViewPage - Live Fasting Graph
 *
 * Obsidian-style graph showing who's fasting right now
 * Visual network of active fasters
 */
export default function GraphViewPage() {
  return (
    <div className="max-w-6xl mx-auto px-6 py-12">
      <h1 className="text-4xl font-bold text-text mb-4">Graph View</h1>
      <p className="text-lg text-text-secondary mb-8">
        See who's fasting right now - Obsidian-style visualization
      </p>

      <div className="border-2 border-dashed border-border rounded-lg h-96 flex items-center justify-center bg-background-secondary">
        <div className="text-center">
          <svg className="w-16 h-16 mx-auto mb-4 text-text-tertiary" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
          </svg>
          <h3 className="text-xl font-semibold text-text mb-2">Interactive Graph Coming Soon</h3>
          <p className="text-text-secondary max-w-md mx-auto">
            A real-time network visualization showing active fasters, their connections, and fasting progress
          </p>
        </div>
      </div>

      <div className="mt-8 grid md:grid-cols-3 gap-4 text-sm">
        <div className="p-4 bg-background-secondary rounded-lg">
          <div className="font-semibold text-text mb-1">Node Size</div>
          <div className="text-text-secondary">Represents fasting duration</div>
        </div>
        <div className="p-4 bg-background-secondary rounded-lg">
          <div className="font-semibold text-text mb-1">Node Color</div>
          <div className="text-text-secondary">Indicates fasting level/stage</div>
        </div>
        <div className="p-4 bg-background-secondary rounded-lg">
          <div className="font-semibold text-text mb-1">Connections</div>
          <div className="text-text-secondary">Shows community relationships</div>
        </div>
      </div>
    </div>
  );
}
