// components/Celebration/CelebrationScreen.jsx
import React from 'react';

// Utils
import { getCelebrationContent } from '../../utils/celebrationContent';

/**
 * CelebrationScreen Component
 *
 * Fullscreen overlay shown when a fast is completed
 * Displays celebration message, stats, and action buttons
 *
 * @param {object} completedFastData - Data about the completed fast
 * @param {function} onContinue - Handler for "Continue Fasting" button
 * @param {function} onStop - Handler for "Stop Fasting" button
 * @param {function} onStartNew - Handler for "Start New Fast" button
 * @param {boolean} isLoggedIn - Whether user is logged in
 */
export default function CelebrationScreen({
  completedFastData,
  onContinue,
  onStop,
  onStartNew,
  isLoggedIn
}) {
  if (!completedFastData) return null;

  const content = getCelebrationContent(completedFastData.duration);

  return (
    <div style={{
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0, 0, 0, 0.85)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 10000,
      animation: 'fadeIn 0.3s ease'
    }}>
      <div style={{
        background: 'white',
        borderRadius: '16px',
        padding: '50px 40px',
        maxWidth: '500px',
        width: '90%',
        textAlign: 'center',
        boxShadow: '0 20px 60px rgba(0,0,0,0.3)'
      }}>
        {/* Color Bar */}
        <div style={{
          height: '4px',
          background: content.color,
          marginBottom: '40px',
          borderRadius: '2px'
        }} />

        {/* Title */}
        <h1 style={{
          fontSize: '32px',
          fontWeight: '300',
          color: '#333',
          margin: '0 0 16px 0',
          letterSpacing: '1px'
        }}>
          {content.title}
        </h1>

        {/* Subtitle */}
        <p style={{
          fontSize: '18px',
          color: '#666',
          margin: '0 0 12px 0',
          fontWeight: '400'
        }}>
          {content.subtitle}
        </p>

        {/* Message */}
        <p style={{
          fontSize: '15px',
          color: '#999',
          margin: '0 0 30px 0',
          fontStyle: 'italic',
          lineHeight: '1.6'
        }}>
          {content.message}
        </p>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: '#e0e0e0',
          margin: '30px 0'
        }} />

        {/* Stats */}
        <div style={{
          textAlign: 'left',
          marginBottom: '30px',
          fontSize: '14px',
          color: '#666',
          lineHeight: '2',
          background: '#f9f9f9',
          padding: '20px',
          borderRadius: '8px'
        }}>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#999' }}>Started</span>
            <span style={{ fontWeight: '500', color: '#333' }}>
              {completedFastData.startTime.toLocaleString('en-US', {
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#999' }}>Ended</span>
            <span style={{ fontWeight: '500', color: '#333' }}>
              {completedFastData.endTime.toLocaleString('en-US', {
                weekday: 'short',
                hour: '2-digit',
                minute: '2-digit'
              })}
            </span>
          </div>
          <div style={{ display: 'flex', justifyContent: 'space-between' }}>
            <span style={{ color: '#999' }}>Duration</span>
            <span style={{ fontWeight: '600', color: content.color }}>
              {completedFastData.duration} {completedFastData.unit}
            </span>
          </div>
        </div>

        {/* Divider */}
        <div style={{
          height: '1px',
          background: '#e0e0e0',
          margin: '30px 0'
        }} />

        {/* Question */}
        <p style={{
          fontSize: '15px',
          color: '#666',
          marginBottom: '20px',
          fontWeight: '500'
        }}>
          What's next?
        </p>

        {/* Action Buttons */}
        <div style={{
          display: 'flex',
          flexDirection: 'column',
          gap: '12px'
        }}>
          <button
            onClick={onContinue}
            style={{
              padding: '16px',
              fontSize: '15px',
              fontWeight: '500',
              background: content.color,
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => e.target.style.opacity = '0.9'}
            onMouseLeave={(e) => e.target.style.opacity = '1'}
          >
            Continue Fasting (Extended)
          </button>

          <button
            onClick={onStop}
            style={{
              padding: '16px',
              fontSize: '15px',
              fontWeight: '500',
              background: '#333',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => e.target.style.background = '#555'}
            onMouseLeave={(e) => e.target.style.background = '#333'}
          >
            {isLoggedIn ? 'Stop & Save' : 'Stop Fasting'}
          </button>

          <button
            onClick={onStartNew}
            style={{
              padding: '16px',
              fontSize: '15px',
              fontWeight: '500',
              background: 'transparent',
              color: '#666',
              border: '2px solid #e0e0e0',
              borderRadius: '8px',
              cursor: 'pointer',
              transition: 'all 0.2s',
              letterSpacing: '0.5px'
            }}
            onMouseEnter={(e) => {
              e.target.style.borderColor = '#999';
              e.target.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.target.style.borderColor = '#e0e0e0';
              e.target.style.color = '#666';
            }}
          >
            Start New Fast
          </button>
        </div>
      </div>
    </div>
  );
}
