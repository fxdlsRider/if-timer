// components/Timer/FastingInfo.jsx
import React, { useState } from 'react';
import DateTimePicker from '../Shared/DateTimePicker';

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
  const [tempStartTime, setTempStartTime] = useState(null);

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
    console.log('=== FastingInfo handleStartTimeEdit ===');
    console.log('startTime:', startTime);
    console.log('Current date:', new Date());
    setTempStartTime(startTime);
    setIsEditingStartTime(true);
  };

  const handleStartTimeSave = (newStartTime) => {
    if (newStartTime) {
      onStartTimeChange(newStartTime);
    }
    setIsEditingStartTime(false);
  };

  const handleStartTimeCancel = () => {
    setIsEditingStartTime(false);
    setTempStartTime(null);
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
    <>
      <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap' }}>
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
      </div>

      {/* DateTimePicker Modal */}
      {isEditingStartTime && tempStartTime && (
        <DateTimePicker
          value={tempStartTime}
          onChange={setTempStartTime}
          onSave={handleStartTimeSave}
          onCancel={handleStartTimeCancel}
          goalHours={hours}
        />
      )}
    </>
  );
}
