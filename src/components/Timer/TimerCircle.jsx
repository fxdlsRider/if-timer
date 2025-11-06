// components/Timer/TimerCircle.jsx
import React from 'react';

/**
 * TimerCircle Component
 *
 * Displays the circular timer interface
 * Shows different UI when timer is running vs not running
 *
 * IMPORTANT: All three states use identical container structure to prevent layout shift
 * 1. Pre-run state (not running, no completion)
 * 2. Running state (timer active)
 * 3. Completion state (after fast ends)
 */
export default function TimerCircle({
  isRunning,
  isExtended = false,
  showCompletionSummary = false,
  completedFastData = null,
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
      width: '224px',
      height: '224px',
      margin: '0 auto 32px auto'
    },
    handle: {
      position: 'absolute',
      width: '20px',
      height: '20px',
      background: '#d32f2f',
      borderRadius: '50%',
      boxShadow: '0 2px 8px rgba(0,0,0,0.2)',
      transition: isDragging ? 'none' : '0s',
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
    button: {
      minWidth: '160px',
      padding: '16px 48px',
      fontSize: '16px',
      fontWeight: '600',
      border: 'none',
      borderRadius: '24px',
      cursor: 'pointer',
      letterSpacing: '1px',
      transition: 'all 0.2s'
    },
    startButton: {
      background: '#4ECDC4',
      color: 'white',
      boxShadow: '0 2px 12px rgba(78, 205, 196, 0.3)'
    },
    cancelButton: {
      background: 'transparent',
      color: '#666',
      border: '1px solid #ddd'
    },
    timeDisplay: {
      fontSize: '18px',
      fontWeight: '700',
      fontFamily: '"Courier New", "Consolas", "Monaco", monospace',
      color: 'var(--color-text, #333)',
      letterSpacing: '2px',
      marginBottom: '8px',
      fontVariantNumeric: 'tabular-nums'
    },
    statusText: {
      fontSize: '16px',
      color: '#999',
      marginTop: '12px',
      textTransform: 'uppercase',
      letterSpacing: '2px'
    },
    // CRITICAL: Fixed height container used in ALL states - reduced for closer button placement
    contentContainer: {
      height: '40px',
      marginBottom: '0px',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'flex-start'
    }
  };

  // STATE 1: Completion summary (after fast ends)
  if (showCompletionSummary && !isRunning && completedFastData) {
    const totalDuration = completedFastData.duration;

    return (
      <>
        <div style={styles.circleContainer}>
          <svg width="224" height="224" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <circle
              cx="112"
              cy="112"
              r="96"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="6"
            />
            <circle
              cx="112"
              cy="112"
              r="96"
              fill="none"
              stroke="#34C759"
              strokeWidth="6"
              strokeDasharray={`${2 * Math.PI * 96} 0`}
              strokeLinecap="round"
            />
          </svg>

          <div style={styles.hoursDisplay}>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#34C759', marginBottom: '8px' }}>
              Well done!
            </div>
            <div style={{ fontSize: '32px', fontWeight: '300', color: 'var(--color-text, #333)', marginBottom: '4px' }}>
              {totalDuration}
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)' }}>
              {completedFastData.unit} fasted
            </div>
          </div>
        </div>

        {/* Fixed container - same height as other states */}
        <div style={styles.contentContainer}>
          <div style={styles.statusText}>
            FASTING COMPLETE
          </div>
        </div>

        <button
          onClick={onStartTimer}
          style={{ ...styles.button, ...styles.startButton }}
          onMouseEnter={(e) => e.target.style.background = '#3DBDB5'}
          onMouseLeave={(e) => e.target.style.background = '#4ECDC4'}
        >
          START
        </button>
      </>
    );
  }

  // STATE 2: Pre-run (before starting timer)
  if (!isRunning) {
    return (
      <>
        <div ref={circleRef} style={styles.circleContainer}>
          <svg width="224" height="224" style={{ position: 'absolute', top: 0, left: 0 }}>
            <circle
              cx="112"
              cy="112"
              r="96"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="6"
            />

            <g transform="rotate(-90 112 112)">
              <defs>
                <linearGradient id="trailGradient" x1="0%" y1="100%" x2="100%" y2="0%" gradientTransform="rotate(0)">
                  <stop offset="0%" stopColor="#34C759" />
                  <stop offset="33%" stopColor="#FFE66D" />
                  <stop offset="66%" stopColor="#FF6B6B" />
                  <stop offset="100%" stopColor="#A855F7" />
                </linearGradient>
              </defs>
              <circle
                cx="112"
                cy="112"
                r="96"
                fill="none"
                stroke="url(#trailGradient)"
                strokeWidth="6"
                strokeDasharray={`${(angle / 360) * (2 * Math.PI * 96)} ${2 * Math.PI * 96}`}
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

        {/* Fixed container - same height as other states */}
        <div style={styles.contentContainer}>
          {typeof window !== 'undefined' && 'Notification' in window && Notification.permission === 'default' && (
            <div style={{
              background: '#FFF9E6',
              border: '1px solid #FFE066',
              borderRadius: '8px',
              padding: '12px 16px',
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
        </div>

        <button
          onClick={onStartTimer}
          style={{ ...styles.button, ...styles.startButton }}
          onMouseEnter={(e) => e.target.style.background = '#3DBDB5'}
          onMouseLeave={(e) => e.target.style.background = '#4ECDC4'}
        >
          START
        </button>
      </>
    );
  }

  // STATE 3: Running (timer active)
  return (
    <>
      <div style={styles.circleContainer}>
        <svg width="224" height="224" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
          <defs>
            <linearGradient id="progressGradient" x1="0%" y1="0%" x2="100%" y2="0%">
              <stop offset="0%" stopColor="#34C759" />
              <stop offset="33%" stopColor="#FFE66D" />
              <stop offset="66%" stopColor="#FF6B6B" />
              <stop offset="100%" stopColor="#A855F7" />
            </linearGradient>
          </defs>

          <circle
            cx="112"
            cy="112"
            r="96"
            fill="none"
            stroke="#e0e0e0"
            strokeWidth="6"
          />
          <circle
            cx="112"
            cy="112"
            r="96"
            fill="none"
            stroke="url(#progressGradient)"
            strokeWidth="6"
            strokeDasharray={circumference}
            strokeDashoffset={progressOffset}
            strokeLinecap="round"
            style={{ transition: 'stroke-dashoffset 1s linear' }}
          />
        </svg>

        <div style={styles.hoursDisplay}>
          {isExtended ? (
            <>
              <div style={{ fontSize: '18px', fontWeight: '500', color: '#34C759', marginBottom: '8px' }}>
                Well done!
              </div>
              <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)', marginBottom: '12px' }}>
                {hours} {TIME_UNIT} fasted
              </div>
              <div style={styles.timeDisplay}>
                +{formatTime(Math.abs(timeLeft))}
              </div>
              <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary, #94A3B8)', marginTop: '4px' }}>
                additional time
              </div>
            </>
          ) : (
            <div style={styles.timeDisplay}>
              {formatTime(timeLeft)}
            </div>
          )}
        </div>
      </div>

      {/* Fixed container - same height as other states */}
      <div style={styles.contentContainer}>
        <div style={styles.statusText}>
          {isExtended ? 'EXTENDED MODE' : (timeLeft === 0 ? 'COMPLETE!' : `${hours} ${TIME_UNIT} FAST`)}
        </div>
      </div>

      <button
        onClick={onCancelTimer}
        style={{ ...styles.button, ...styles.cancelButton }}
        onMouseEnter={(e) => {
          e.target.style.borderColor = '#999';
          e.target.style.color = '#333';
        }}
        onMouseLeave={(e) => {
          e.target.style.borderColor = '#ddd';
          e.target.style.color = '#666';
        }}
      >
        STOP
      </button>
    </>
  );
}
