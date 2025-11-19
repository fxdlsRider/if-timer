// components/Learn/LearnPage.jsx
import React from 'react';

/**
 * LearnPage Component
 *
 * Educational content about intermittent fasting
 * Three cards: The Foundation, Choose Your Method, Advanced Insights
 */
export default function LearnPage() {
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

          {/* Card 1: The Foundation */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>THE FOUNDATION</h2>

            <h3 style={titleStyle}>What is Intermittent Fasting?</h3>
            <p style={textStyle}>
              Intermittent fasting (IF) is an eating pattern that cycles between periods of fasting and eating.
              It doesn't specify which foods to eat, but rather when you should eat them.
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>How It Works</h3>
            <p style={textStyle}>
              When you fast, several things happen in your body on the cellular and molecular level:
            </p>
            <ul style={{ ...textStyle, paddingLeft: '20px', listStyle: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>Human Growth Hormone (HGH) increases dramatically</li>
              <li style={{ marginBottom: '8px' }}>Insulin levels drop, facilitating fat burning</li>
              <li style={{ marginBottom: '8px' }}>Cellular repair processes are initiated</li>
              <li style={{ marginBottom: '8px' }}>Gene expression changes to promote longevity</li>
            </ul>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Health Benefits</h3>
            <p style={textStyle}>
              Research shows intermittent fasting may help with weight loss, improve metabolic health,
              protect against disease, and potentially extend lifespan.
            </p>
          </div>

          {/* Card 2: Choose Your Method */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>CHOOSE YOUR METHOD</h2>

            <h3 style={titleStyle}>16:8 Method</h3>
            <p style={textStyle}>
              Fast for 16 hours and eat within an 8-hour window. This is the most popular method
              and easiest to maintain long-term.
            </p>
            <p style={{ ...textStyle, color: '#4ECDC4', fontWeight: '600' }}>
              Best for: Beginners and daily routine
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>18:6 Method</h3>
            <p style={textStyle}>
              Fast for 18 hours with a 6-hour eating window. Offers more pronounced benefits
              than 16:8 while remaining manageable.
            </p>
            <p style={{ ...textStyle, color: '#4ECDC4', fontWeight: '600' }}>
              Best for: Experienced fasters seeking more results
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>OMAD (One Meal A Day)</h3>
            <p style={textStyle}>
              Fast for 23 hours and eat one large meal. This is an advanced method that
              maximizes autophagy and fat burning.
            </p>
            <p style={{ ...textStyle, color: '#4ECDC4', fontWeight: '600' }}>
              Best for: Advanced fasters with specific goals
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Extended Fasting</h3>
            <p style={textStyle}>
              Fasts lasting 24-48+ hours. Should only be attempted by experienced fasters
              with proper preparation and guidance.
            </p>
            <p style={{ ...textStyle, color: '#4ECDC4', fontWeight: '600' }}>
              Best for: Deep healing and metabolic reset
            </p>
          </div>

          {/* Card 3: Advanced Insights */}
          <div style={cardStyle}>
            <h2 style={headerStyle}>ADVANCED INSIGHTS</h2>

            <h3 style={titleStyle}>Autophagy</h3>
            <p style={textStyle}>
              Autophagy is your body's cellular recycling program. It kicks in after 12-16 hours
              of fasting and peaks around 24-48 hours. During this process, damaged cells are
              broken down and recycled.
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Ketosis</h3>
            <p style={textStyle}>
              After 12-16 hours of fasting, your body enters ketosis, burning fat for fuel instead
              of glucose. This metabolic state enhances mental clarity and sustained energy.
            </p>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Breaking Your Fast</h3>
            <p style={textStyle}>
              How you break your fast matters. Start with:
            </p>
            <ul style={{ ...textStyle, paddingLeft: '20px', listStyle: 'disc' }}>
              <li style={{ marginBottom: '8px' }}>Light, easily digestible foods</li>
              <li style={{ marginBottom: '8px' }}>Bone broth or vegetable soup</li>
              <li style={{ marginBottom: '8px' }}>Avoid processed foods and sugar</li>
              <li style={{ marginBottom: '8px' }}>Stay hydrated</li>
            </ul>

            <h3 style={{ ...titleStyle, marginTop: '24px' }}>Important Notes</h3>
            <p style={textStyle}>
              Fasting is not suitable for everyone. Consult your healthcare provider before
              starting, especially if you have medical conditions, are pregnant, or taking medications.
            </p>
          </div>

        </div>
      </div>
    </div>
  );
}
