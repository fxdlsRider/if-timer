// components/Timer/TimerCircle.jsx
import React, { useState, useEffect } from 'react';
import { hasUserRespondedToPermission } from '../../services/notificationService';
import StopFastingModal from './StopFastingModal';
import FastingInfo from './FastingInfo';
import ChangeGoalModal from './ChangeGoalModal';
import DateTimePicker from '../Shared/DateTimePicker';

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
  startTime,
  TIME_UNIT,
  circleRef,
  isDragging,
  handlePointerDown,
  formatTime,
  getProgressColor,
  onStartTimer,
  onCancelTimer,
  onChangeGoal,
  onChangeStartTime,
  onCompletedDataChange,
  fastingLevels,
  handlePosition,
  circumference,
  progressOffset
}) {
  // Motivational quotes - 15 powerful movie quotes
  const motivationalQuotes = [
    { text: "Do. Or do not. There is no try.", author: "Yoda" },
    { text: "Why do we fall? So we can learn to pick ourselves up.", author: "Batman Begins" },
    { text: "It's not who I am underneath, but what I do that defines me.", author: "Batman" },
    { text: "The only thing standing between you and your goal is the story you keep telling yourself.", author: "Wolf of Wall Street" },
    { text: "Life's simple. You make choices and you don't look back.", author: "Fast & Furious" },
    { text: "Every man dies, not every man really lives.", author: "Braveheart" },
    { text: "Great men are not born great, they grow great.", author: "The Godfather" },
    { text: "The brave may not live forever, but the cautious do not live at all.", author: "The Princess Diaries" },
    { text: "You mustn't be afraid to dream a little bigger.", author: "Inception" },
    { text: "Get busy living, or get busy dying.", author: "Shawshank Redemption" },
    { text: "I'm not in this world to live up to your expectations.", author: "Bruce Lee" },
    { text: "The hardest choices require the strongest wills.", author: "Thanos, Infinity War" },
    { text: "Don't let anyone ever make you feel like you don't deserve what you want.", author: "10 Things I Hate About You" },
    { text: "Life moves pretty fast. If you don't stop and look around once in a while, you could miss it.", author: "Ferris Bueller" },
    { text: "Carpe diem. Seize the day.", author: "Dead Poets Society" }
  ];

  // Random quote on component mount - stays consistent during session
  const [randomQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  });
  // State to track if notification banner should be shown
  const [showNotificationBanner, setShowNotificationBanner] = useState(() => {
    // Check localStorage first (persists across sessions)
    const dismissed = localStorage.getItem('notificationBannerDismissed');
    if (dismissed === 'true') return false;

    // Check if user has already responded to permission
    return !hasUserRespondedToPermission();
  });

  // State for stop fasting confirmation modal
  const [showStopModal, setShowStopModal] = useState(false);

  // State for change goal modal
  const [showChangeGoalModal, setShowChangeGoalModal] = useState(false);

  // State for editing end time in completion screen
  const [isEditingEndTime, setIsEditingEndTime] = useState(false);
  const [tempEndTime, setTempEndTime] = useState(null);

  // Hide banner when timer starts (permission will be requested)
  useEffect(() => {
    if (isRunning && showNotificationBanner) {
      setShowNotificationBanner(false);
      localStorage.setItem('notificationBannerDismissed', 'true');
    }
  }, [isRunning, showNotificationBanner]);

  // Handle ESC key to close modal
  useEffect(() => {
    const handleEsc = (e) => {
      if (e.key === 'Escape' && showStopModal) {
        setShowStopModal(false);
      }
    };
    window.addEventListener('keydown', handleEsc);
    return () => window.removeEventListener('keydown', handleEsc);
  }, [showStopModal]);

  // Calculate elapsed time for modal
  const getElapsedTime = () => {
    if (!isRunning) return '';

    let totalSeconds;
    if (isExtended) {
      // In extended mode: timeLeft is time BEYOND goal
      // Total elapsed = original goal + additional time
      totalSeconds = (hours * 3600) + timeLeft;
    } else {
      // Normal mode: calculate from remaining time
      totalSeconds = hours * 3600 - timeLeft;
    }

    const h = Math.floor(totalSeconds / 3600);
    const m = Math.floor((totalSeconds % 3600) / 60);
    if (h > 0) {
      return `${h}h ${m}m`;
    }
    return `${m}m`;
  };

  // Handlers for stop confirmation
  const handleStopClick = () => {
    setShowStopModal(true);
  };

  const handleConfirmStop = () => {
    setShowStopModal(false);
    onCancelTimer();
  };

  const handleCancelStop = () => {
    setShowStopModal(false);
  };

  // Handlers for goal change
  const handleGoalClick = () => {
    setShowChangeGoalModal(true);
  };

  const handleGoalChange = (newHours) => {
    onChangeGoal(newHours);
    setShowChangeGoalModal(false);
  };

  // Handlers for end time editing in completion screen
  const handleEndTimeEdit = () => {
    if (completedFastData && completedFastData.endTime) {
      setTempEndTime(completedFastData.endTime);
      setIsEditingEndTime(true);
    }
  };

  const handleEndTimeSave = (newEndTime) => {
    if (!newEndTime || !completedFastData) return;

    const startTime = completedFastData.startTime;

    // Calculate new duration
    const durationMs = newEndTime.getTime() - startTime.getTime();
    const durationUnits = durationMs / (completedFastData.unit === 'seconds' ? 1000 : 3600000);

    // Update completed data
    const updatedData = {
      ...completedFastData,
      endTime: newEndTime,
      duration: durationUnits.toFixed(1)
    };

    // Call parent callback to update state
    if (onCompletedDataChange) {
      onCompletedDataChange(updatedData);
    }

    setIsEditingEndTime(false);
  };

  const handleEndTimeCancel = () => {
    setIsEditingEndTime(false);
    setTempEndTime(null);
  };

  // Format time for display in buttons
  const formatDateTime = (date) => {
    if (!date) return '';
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    return `${hours}:${minutes}`;
  };

  const formatDate = (date) => {
    if (!date) return '';
    const day = date.getDate().toString().padStart(2, '0');
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    return `${day}.${month}`;
  };

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
      border: '1px solid #666',
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
      border: '2px solid rgba(0, 0, 0, 0.15)',
      boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1), 0 10px 10px -5px rgba(0, 0, 0, 0.04)'
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

  // STATE 1: Pre-run (before starting timer)
  if (!isRunning && !showCompletionSummary) {
    return (
      <>
        {/* Motivational Quote */}
        <div style={{ textAlign: 'center', marginBottom: '20px', minHeight: '60px' }}>
          <p style={{ fontSize: '15px', fontStyle: 'italic', color: '#666', marginBottom: '4px', lineHeight: '1.4' }}>
            "{randomQuote.text}"
          </p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            — {randomQuote.author}
          </p>
        </div>

        <div ref={circleRef} style={styles.circleContainer}>
          <svg width="224" height="224" style={{ position: 'absolute', top: 0, left: 0 }}>
            {/* Background circle */}
            <circle
              cx="112"
              cy="112"
              r="96"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="18"
            />

            <g transform="rotate(-90 112 112)">
              {/* Thick teal progress trail */}
              <circle
                cx="112"
                cy="112"
                r="96"
                fill="none"
                stroke="#4ECDC4"
                strokeWidth="18"
                strokeDasharray={`${(angle / 360) * (2 * Math.PI * 96)} ${2 * Math.PI * 96}`}
                strokeLinecap="butt"
                style={{ transition: 'stroke-dasharray 0.3s ease' }}
              />
            </g>

            {/* Frame circles */}
            <circle cx="112" cy="112" r="105" fill="none" stroke="#999" strokeWidth="2" opacity="0.6" />
            <circle cx="112" cy="112" r="87" fill="none" stroke="#999" strokeWidth="2" opacity="0.6" />
          </svg>

          {/* 12 o'clock marker line - on top */}
          <svg width="224" height="224" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <line
              x1="112"
              y1="7"
              x2="112"
              y2="32"
              stroke="#333"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
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
          {showNotificationBanner && (
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

  // STATE 2: Running (timer active)
  if (isRunning) {
    return (
      <>
        {/* Motivational Quote */}
        <div style={{ textAlign: 'center', marginBottom: '20px', minHeight: '60px' }}>
          <p style={{ fontSize: '15px', fontStyle: 'italic', color: '#666', marginBottom: '4px', lineHeight: '1.4' }}>
            "{randomQuote.text}"
          </p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            — {randomQuote.author}
          </p>
        </div>

        <div style={styles.circleContainer}>
          <svg width="224" height="224" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            {/* Background circle */}
            <circle
              cx="112"
              cy="112"
              r="96"
              fill="none"
              stroke="#e0e0e0"
              strokeWidth="18"
            />
            {/* Thick teal progress circle */}
            <circle
              cx="112"
              cy="112"
              r="96"
              fill="none"
              stroke="#4ECDC4"
              strokeWidth="18"
              strokeDasharray={circumference}
              strokeDashoffset={progressOffset}
              strokeLinecap="butt"
              style={{ transition: 'stroke-dashoffset 1s linear' }}
            />
            {/* Frame circles */}
            <circle cx="112" cy="112" r="105" fill="none" stroke="#999" strokeWidth="2" opacity="0.6" />
            <circle cx="112" cy="112" r="87" fill="none" stroke="#999" strokeWidth="2" opacity="0.6" />
          </svg>

          {/* 12 o'clock marker line - on top */}
          <svg width="224" height="224" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <line
              x1="112"
              y1="7"
              x2="112"
              y2="32"
              stroke="#333"
              strokeWidth="1.5"
              strokeLinecap="round"
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
          {startTime ? (
            <div style={{ marginTop: '-10px' }}>
              <FastingInfo
                startTime={startTime}
                hours={hours}
                onStartTimeChange={onChangeStartTime}
                onGoalClick={handleGoalClick}
                isExtended={isExtended}
              />
            </div>
          ) : (
            <div style={styles.statusText}>
              {isExtended ? 'EXTENDED MODE' : (timeLeft === 0 ? 'COMPLETE!' : '')}
            </div>
          )}
        </div>

        <button
          onClick={handleStopClick}
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

      {/* Stop Fasting Modal */}
      <StopFastingModal
        isOpen={showStopModal}
        onConfirm={handleConfirmStop}
        onCancel={handleCancelStop}
        currentDuration={getElapsedTime()}
      />

      {/* Change Goal Modal */}
      <ChangeGoalModal
        isOpen={showChangeGoalModal}
        currentHours={hours}
        onConfirm={handleGoalChange}
        onCancel={() => setShowChangeGoalModal(false)}
        fastingLevels={fastingLevels}
      />
      </>
    );
  }

  // STATE 3: Complete (after fast ends)
  if (showCompletionSummary && completedFastData) {
    const totalDuration = completedFastData.duration;

    return (
      <>
        {/* Motivational Quote */}
        <div style={{ textAlign: 'center', marginBottom: '20px', minHeight: '60px' }}>
          <p style={{ fontSize: '15px', fontStyle: 'italic', color: '#666', marginBottom: '4px', lineHeight: '1.4' }}>
            "{randomQuote.text}"
          </p>
          <p style={{ fontSize: '12px', color: '#999' }}>
            — {randomQuote.author}
          </p>
        </div>

        <div style={styles.circleContainer}>
          <svg width="224" height="224" style={{ position: 'absolute', top: 0, left: 0, transform: 'rotate(-90deg)' }}>
            <defs>
              <filter id="completeShadow">
                <feDropShadow dx="0" dy="2" stdDeviation="3" floodOpacity="0.3" />
              </filter>
            </defs>
            {/* Thick teal completion circle - only stroke, no fill */}
            <circle
              cx="112"
              cy="112"
              r="96"
              fill="none"
              stroke="#4ECDC4"
              strokeWidth="18"
              strokeLinecap="butt"
              filter="url(#completeShadow)"
            />
            {/* Frame circles */}
            <circle cx="112" cy="112" r="105" fill="none" stroke="#999" strokeWidth="2" opacity="0.6" />
            <circle cx="112" cy="112" r="87" fill="none" stroke="#999" strokeWidth="2" opacity="0.6" />
          </svg>

          {/* 12 o'clock marker line - on top */}
          <svg width="224" height="224" style={{ position: 'absolute', top: 0, left: 0, pointerEvents: 'none' }}>
            <line
              x1="112"
              y1="7"
              x2="112"
              y2="32"
              stroke="#333"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>

          <div style={styles.hoursDisplay}>
            <div style={{ fontSize: '18px', fontWeight: '500', color: '#34C759', marginBottom: '8px' }}>
              Well done!
            </div>
            <div style={{ fontSize: '14px', color: 'var(--color-text-secondary, #64748B)', marginBottom: '12px' }}>
              {completedFastData.originalGoal} {completedFastData.unit} fasted
            </div>
            <div style={styles.timeDisplay}>
              +{formatTime(Math.round((parseFloat(totalDuration) - completedFastData.originalGoal) * (completedFastData.unit === 'hours' ? 3600 : 1)))}
            </div>
            <div style={{ fontSize: '12px', color: 'var(--color-text-tertiary, #94A3B8)', marginTop: '4px' }}>
              additional time
            </div>
          </div>
        </div>

        {/* Fixed container - same height as other states */}
        <div style={styles.contentContainer}>
          {/* Started / Stopped buttons */}
          <div style={{ display: 'flex', justifyContent: 'center', gap: '12px', flexWrap: 'wrap', marginTop: '-5px' }}>
            {/* Started button - non-editable display */}
            <button
              style={{
                padding: '8px 16px',
                fontSize: '13px',
                color: '#666',
                border: '1px solid #ddd',
                borderRadius: '20px',
                background: 'transparent',
                cursor: 'default',
                transition: 'all 0.2s',
                fontWeight: '400',
                minWidth: '140px'
              }}
            >
              Started: {formatDateTime(completedFastData.startTime)} {formatDate(completedFastData.startTime)}
            </button>

            {/* Stopped button - editable */}
            <button
              onClick={handleEndTimeEdit}
              style={{
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
              }}
              onMouseEnter={(e) => {
                e.target.style.borderColor = '#999';
                e.target.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.target.style.borderColor = '#ddd';
                e.target.style.color = '#666';
              }}
            >
              Stopped: {formatDateTime(completedFastData.endTime)} {formatDate(completedFastData.endTime)}
            </button>
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

        {/* DateTimePicker Modal */}
        {isEditingEndTime && tempEndTime && (
          <DateTimePicker
            value={tempEndTime}
            onChange={setTempEndTime}
            onSave={handleEndTimeSave}
            onCancel={handleEndTimeCancel}
          />
        )}
      </>
    );
  }

  // Fallback (should never reach here)
  return null;
}
