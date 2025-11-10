// components/Timer/FastingInfo.jsx
import React, { useState } from 'react';

/**
 * FastingInfo Component
 *
 * Displays start time and goal during fasting
 * - Shows when user started fasting (editable)
 * - Shows fasting goal (clickable to change mode)
 *
 * @param {Date} startTime - When fasting started
 * @param {number} hours - Goal hours
 * @param {function} onStartTimeChange - Handler for start time change
 * @param {function} onGoalClick - Handler for goal click (change mode)
 * @param {boolean} isExtended - Whether in extended mode
 */
export default function FastingInfo({ startTime, hours, onStartTimeChange, onGoalClick, isExtended }) {
  const [isEditingStartTime, setIsEditingStartTime] = useState(false);
  const [tempStartTime, setTempStartTime] = useState('');

  const formatStartTime = (date) => {
    if (!date) return '';
    const now = new Date();

    // If today, show time only (24h format)
    if (date.toDateString() === now.toDateString()) {
      return `Started at ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
    }
    // If yesterday or older, show date + time (24h format)
    return `Started ${date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })} at ${date.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' })}`;
  };

  const handleStartTimeEdit = () => {
    const dateStr = startTime.toISOString().slice(0, 16);
    setTempStartTime(dateStr);
    setIsEditingStartTime(true);
  };

  const handleStartTimeSave = () => {
    if (tempStartTime) {
      onStartTimeChange(new Date(tempStartTime));
    }
    setIsEditingStartTime(false);
  };

  const handleStartTimeCancel = () => {
    setIsEditingStartTime(false);
    setTempStartTime('');
  };

  if (isExtended) {
    return (
      <div style={{
        fontSize: '14px',
        color: '#34C759',
        fontWeight: '500',
        letterSpacing: '1px',
        textTransform: 'uppercase'
      }}>
        EXTENDED MODE
      </div>
    );
  }

  // Style similar to STOP button but smaller - for symmetric buttons
  const buttonStyle = {
    padding: '8px 16px',
    fontSize: '13px',
    color: '#666',
    border: '1px solid #ddd',
    borderRadius: '20px',
    background: 'transparent',
    cursor: 'pointer',
    transition: 'all 0.2s',
    fontWeight: '400',
    minWidth: '140px'
  };

  return (
    <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
      {isEditingStartTime ? (
        <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
          <input
            type="datetime-local"
            value={tempStartTime}
            onChange={(e) => setTempStartTime(e.target.value)}
            style={{
              padding: '6px 12px',
              border: '1px solid #ddd',
              borderRadius: '20px',
              fontSize: '12px',
              outline: 'none'
            }}
          />
          <button
            onClick={handleStartTimeSave}
            style={{
              padding: '6px 12px',
              background: '#4ECDC4',
              color: 'white',
              border: 'none',
              borderRadius: '20px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Save
          </button>
          <button
            onClick={handleStartTimeCancel}
            style={{
              padding: '6px 12px',
              background: 'transparent',
              color: '#999',
              border: '1px solid #ddd',
              borderRadius: '20px',
              fontSize: '12px',
              cursor: 'pointer'
            }}
          >
            Cancel
          </button>
        </div>
      ) : (
        <>
          {/* Started Button */}
          <button
            onClick={handleStartTimeEdit}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#999';
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#ddd';
              e.currentTarget.style.color = '#666';
            }}
          >
            {formatStartTime(startTime)}
          </button>

          {/* Goal Button */}
          <button
            onClick={onGoalClick}
            style={buttonStyle}
            onMouseEnter={(e) => {
              e.currentTarget.style.borderColor = '#999';
              e.currentTarget.style.color = '#333';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.borderColor = '#ddd';
              e.currentTarget.style.color = '#666';
            }}
          >
            Goal: {hours}h
          </button>
        </>
      )}
    </div>
  );
}
