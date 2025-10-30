// components/Timer/TimerCircle.jsx
import React from 'react';

/**
 * TimerCircle Component
 *
 * Displays the circular timer interface
 * Shows different UI when timer is running vs not running
 *
 * @param {boolean} isRunning - Whether timer is currently running
 * @param {number} hours - Current hours value
 * @param {number} angle - Current angle for drag handle
 * @param {number} timeLeft - Time left in seconds (when running)
 * @param {number} progress - Progress percentage (0-100)
 * @param {string} TIME_UNIT - Time unit (hours/seconds)
 * @param {object} circleRef - Ref to circle container
 * @param {boolean} isDragging - Whether currently dragging
 * @param {function} handlePointerDown - Handler for drag start
 * @param {function} formatTime - Function to format time display
 * @param {function} getProgressColor - Function to get progress color
 * @param {function} onStartTimer - Handler for start button
 * @param {function} onCancelTimer - Handler for cancel button
 * @param {object} handlePosition - {x, y} position of drag handle
 * @param {number} circumference - Circle circumference
 * @param {number} progressOffset - Progress offset for stroke
 */
export default function TimerCircle({
  isRunning,
  hours,
  angle,
  timeLeft,
  progress,
  TIME_UNIT,
  circleRef,
  isDragging,
  handlePointerDown,
  formatTime,
  getProgressColor,
  onStartTimer,
  onCancelTimer,
  handlePosition,
  circumference,
  progressOffset
}) {
  const styles = {
    circleContainer: {
      position: 'relative',
      width: '280px',
      height: '280px',
      margin: '0 auto 40px auto'
    },
    handle: {
      position: 'absolute',
      width: '20px',
      height: '20px',
      background: '#d32f2f',
      borderRadius: '50%',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      transition: isDragging ? 'none' : 'all 0.3s ease',
      zIndex: 10
    },
    hoursDisplay: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      pointerEvents: 'none'
    },
    hoursNumber: {
      fontSize: '48px',
      fontWeight: '300',
      color: '#333',
      marginBottom: '4px'
    },
    hoursLabel: {
      fontSize: '14px',
      color: '#999',
      textTransform: 'uppercase',
      letterSpacing: '1px'
    },
    startButton: {
      padding: '16px 48px',
      fontSize: '16px',
      fontWeight: '600',
      background: '#333',
      color: 'white',
      border: 'none',
      borderRadius: '24px',
      cursor: 'pointer',
      letterSpacing: '1px',
      transition: 'background 0.2s'
    },
    cancelButton: {
      padding: '12px 32px',
      fontSize: '14px',
      background: 'transparent',
      color: '#666',
      border: '1px solid #ddd',
      borderRadius: '20px',
      cursor: 'pointer',
      marginTop: '16px',
      transition: 'all 0.2s'
    },
    timeDisplay: {
      fontSize: '64px',
      fontWeight: '200',
      color: '#333',
      marginBottom: '8px',
      fontVariantNumeric: 'tabular-nums'
    },
    statusText: {
      fontSize: '16px',
      color: '#999',
      marginTop: '12px',
      textTransform: 'uppercase',
      letterSpacing: '2px'
    }
  };

  if (!isRunning) {
    // Pre-run state: draggable circle
    return (
      <>
        <div ref={circleRef} style={styles.circleContainer}>
          <svg width="280" height="280" style={{ position: 'absolute', top: 0, left: 0 }}>
            <circle
              cx="140"
              cy="140"
              r="130"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="3"
            />

            <g transform="rotate(-90 140 140)">
              <defs>
                <linearGradient id="trailGradient" gradientUnits="userSpaceOnUse">
                  <stop offset="0%" stopColor="#d32f2f" stopOpacity="0.15" />
                  <stop offset="100%" stopColor="#d32f2f" stopOpacity="0.4" />
                </linearGradient>
              </defs>
              <circle
                cx="140"
                cy="140"
                r="130"
                fill="none"
                stroke="url(#trailGradient)"
                strokeWidth="3"
                strokeDasharray={`${(angle / 360) * (2 * Math.PI * 130)} ${2 * Math.PI * 130}`}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 0.3s ease' }}
              />
            </g>
          </svg>

          <div
            style={{
              ...styles.handle,
              left: `${handlePosition.x - 10}px`,
              top: `${handlePosition.y - 10}px`,
              cursor: isDragging ? 'grabbing' : 'grab'
            }}
            onMouseDown={handlePointerDown}
            onTouchStart={handlePointerDown}
          />

          <div style={styles.hoursDisplay}>
            <div style={styles.hoursNumber}>{hours}</div>
            <div style={styles.hoursLabel}>{TIME_UNIT}</div>
          </div>
        </div>

        {/* Notification Info Banner */}
        {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && (
          <div style={{
            background: '#FFF9E6',
            border: '1px solid #FFE066',
            borderRadius: '8px',
            padding: '12px 16px',
            marginBottom: '20px',
            fontSize: '13px',
            color: '#666',
            textAlign: 'center',
            lineHeight: '1.5',
            maxWidth: '320px'
          }}>
            🔔 <strong>Get notified</strong> when your fast completes!<br />
            <span style={{ fontSize: '12px' }}>We'll ask for permission when you start</span>
          </div>
        )}

        <button
          onClick={onStartTimer}
          style={styles.startButton}
          onMouseEnter={(e) => e.target.style.background = '#555'}
          onMouseLeave={(e) => e.target.style.background = '#333'}
        >
          START
        </button>
      </>
    );
  }

  // Running state: progress circle
  return (
    <>
      <div style={styles.circleContainer}>
        <svg width="280" height="280" style={{ transform: 'rotate(-90deg)' }}>
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="8"
          />
          <circle
            cx="140"
            cy="140"
            r="120"
            fill="none"
            stroke={getProgressColor(progress)}
            strokeWidth="8"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.3s' }}
          />
        </svg>

        <div style={styles.hoursDisplay}>
          <div style={styles.timeDisplay}>
            {formatTime(timeLeft)}
          </div>
        </div>
      </div>

      <div style={styles.statusText}>
        {timeLeft === 0 ? 'COMPLETE!' : `${hours} ${TIME_UNIT} FAST`}
      </div>

      <button
        onClick={onCancelTimer}
        style={styles.cancelButton}
        onMouseEnter={(e) => {
          e.target.style.borderColor = '#999';
          e.target.style.color = '#333';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = '#ddd';
          e.target.style.color = '#666';
        }}
      >
        Cancel Timer
      </button>
    </>
  );
}
