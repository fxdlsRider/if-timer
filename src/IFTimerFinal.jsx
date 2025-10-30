// src/IFTimerFinal.jsx
import React, { useState, useRef } from 'react';
import { useAuth } from './AuthContext';

// Hooks
import { useTimerState } from './hooks/useTimerState';
import { useTimerStorage } from './hooks/useTimerStorage';
import { useDragHandle } from './hooks/useDragHandle';

// Utils
import {
  formatTime,
  getProgress as calculateProgress,
  getFastingLevel as calculateFastingLevel,
  getBodyMode as calculateBodyMode,
} from './utils/timeCalculations';
import { getCelebrationContent } from './utils/celebrationContent';

// Config
import {
  TIMER_CONSTANTS,
  CIRCLE_CONFIG,
  FASTING_LEVELS,
  BODY_MODES,
  getProgressColor,
} from './config/constants';

export default function IFTimerFinal() {
  const { user, signOut, authError } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const circleRef = useRef(null);

  // Custom Hooks - Timer state and logic
  const timerState = useTimerState(TIMER_CONSTANTS.DEFAULT_HOURS);
  const {
    hours,
    setHours,
    isRunning,
    targetTime,
    timeLeft,
    isExtended,
    showCelebration,
    completedFastData,
    TEST_MODE,
    TIME_UNIT,
    startTimer,
    cancelTimer,
    continueFasting,
    stopFasting,
    startNewFast,
  } = timerState;

  // Custom Hook - Drag handling
  const dragHandle = useDragHandle(
    circleRef,
    isRunning,
    TIMER_CONSTANTS.DEFAULT_ANGLE,
    hours
  );
  const {
    isDragging,
    angle,
    handlePointerDown,
    handleLevelClick,
  } = dragHandle;

  // Sync dragHandle hours with timerState hours
  React.useEffect(() => {
    if (!isRunning && dragHandle.hours !== hours) {
      setHours(dragHandle.hours);
    }
  }, [dragHandle.hours, hours, isRunning, setHours]);

  // Custom Hook - Storage and sync
  const { syncing } = useTimerStorage(
    user,
    {
      hours: dragHandle.hours,
      angle: dragHandle.angle,
      isRunning,
      targetTime,
      isExtended,
      originalGoalTime: timerState.originalGoalTime,
    },
    (loadedState) => {
      // Callback when state is loaded from storage
      if (loadedState.hours !== undefined) dragHandle.setHours(loadedState.hours);
      if (loadedState.angle !== undefined) dragHandle.setAngle(loadedState.angle);
      // Timer state is managed by useTimerState
    }
  );

  // All timer logic, storage, and drag handling now managed by custom hooks above

  // Helper functions now imported from utils/ and config/
  // getCelebrationContent → utils/celebrationContent.js
  // formatTime → utils/timeCalculations.js
  // getProgress → calculateProgress (imported)
  // getFastingLevel → calculateFastingLevel (imported)
  // getBodyMode → calculateBodyMode (imported)
  // getProgressColor → imported from config/constants.js

  // Use imported constants for fasting levels and body modes
  const fastingLevels = FASTING_LEVELS;
  const bodyModes = BODY_MODES;

  const handleX = angle * (Math.PI / 180);
  const handleY = angle * (Math.PI / 180);
  const radius = CIRCLE_CONFIG.HANDLE_RADIUS;
  const handlePosX = CIRCLE_CONFIG.CENTER_X + Math.sin(handleX) * radius;
  const handlePosY = CIRCLE_CONFIG.CENTER_Y - Math.cos(handleY) * radius;

  const circumference = 2 * Math.PI * CIRCLE_CONFIG.RADIUS;
  const progress = isRunning && targetTime ? calculateProgress(hours, timeLeft) : 0;
  const progressOffset = circumference - (progress / 100) * circumference;

  const styles = {
    container: {
      minHeight: '100vh',
      background: '#fafafa',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '40px 20px',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      position: 'relative'
    },
    topBar: {
      position: 'absolute',
      top: '20px',
      left: '20px',
      right: '20px',
      display: 'flex',
      justifyContent: 'space-between',
      alignItems: 'center'
    },
    syncIndicator: {
      fontSize: '12px',
      color: '#999',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    authButtons: {
      display: 'flex',
      gap: '12px'
    },
    button: {
      background: 'transparent',
      color: '#666',
      border: '2px solid #ddd',
      padding: '10px 24px',
      fontSize: '13px',
      borderRadius: '50px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      fontWeight: '500'
    },
    app: {
      display: 'flex',
      gap: '80px',
      maxWidth: '900px',
      alignItems: 'center',
      flexWrap: 'wrap',
      justifyContent: 'center'
    },
    timerSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: '320px'
    },
    title: {
      fontSize: '24px',
      fontWeight: '300',
      color: '#555',
      marginBottom: '50px',
      letterSpacing: '1px',
      textShadow: '0 4px 12px rgba(0,0,0,0.18)',
      WebkitTextStroke: '0.8px rgba(85, 85, 85, 0.25)'
    },
    circleContainer: {
      position: 'relative',
      width: '280px',
      height: '280px',
      marginBottom: '40px'
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
      fontSize: '72px',
      fontWeight: '300',
      color: '#333',
      lineHeight: '1'
    },
    hoursLabel: {
      fontSize: '18px',
      color: '#999',
      marginTop: '5px'
    },
    handle: {
      position: 'absolute',
      width: '20px',
      height: '20px',
      background: '#d32f2f',
      borderRadius: '50%',
      boxShadow: '0 2px 4px rgba(211, 47, 47, 0.25)',
      touchAction: 'none',
      userSelect: 'none',
      WebkitUserSelect: 'none',
      MozUserSelect: 'none'
    },
    startButton: {
      background: '#333',
      color: 'white',
      border: 'none',
      padding: '16px 60px',
      fontSize: '16px',
      borderRadius: '50px',
      letterSpacing: '1px',
      cursor: 'pointer',
      transition: 'background 0.2s'
    },
    countdownDisplay: {
      position: 'absolute',
      top: '50%',
      left: '50%',
      transform: 'translate(-50%, -50%)',
      textAlign: 'center',
      pointerEvents: 'none'
    },
    countdownTime: {
      fontSize: '48px',
      fontWeight: '300',
      color: '#333',
      marginBottom: '8px'
    },
    countdownLabel: {
      fontSize: '14px',
      color: '#999'
    },
    controls: {
      display: 'flex',
      gap: '16px',
      justifyContent: 'center'
    },
    controlButton: {
      background: 'transparent',
      color: '#666',
      border: '2px solid #ddd',
      padding: '12px 32px',
      fontSize: '14px',
      borderRadius: '50px',
      letterSpacing: '0.5px',
      cursor: 'pointer',
      transition: 'all 0.2s',
      display: 'flex',
      alignItems: 'center',
      gap: '8px'
    },
    infoSection: {
      minWidth: '240px'
    },
    infoTitle: {
      fontSize: '12px',
      fontWeight: '500',
      letterSpacing: '2px',
      color: '#aaa',
      marginBottom: '24px',
      textTransform: 'uppercase',
      position: 'relative',
      paddingBottom: '12px'
    },
    infoTitleLine: {
      position: 'absolute',
      bottom: '0',
      left: '0',
      width: '140%',
      height: '1px',
      background: '#e0e0e0'
    },
    infoList: {
      listStyle: 'none',
      padding: '0',
      margin: '0'
    },
    infoItem: {
      padding: '12px 0',
      fontSize: '15px',
      transition: 'color 0.2s',
      lineHeight: '1.6',
      cursor: 'pointer'
    },
    infoHours: {
      display: 'inline-block',
      minWidth: '80px',
      fontWeight: '500'
    },
    loginModal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    loginCard: {
      background: 'white',
      padding: '40px',
      borderRadius: '12px',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center'
    },
    loginTitle: {
      fontSize: '24px',
      fontWeight: '300',
      marginBottom: '12px',
      color: '#333'
    },
    loginSubtitle: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '30px',
      lineHeight: '1.6'
    },
    loginInput: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '16px',
      outline: 'none'
    },
    loginButton: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      background: '#333',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '12px'
    },
    loginCancel: {
      background: 'transparent',
      color: '#666',
      border: 'none',
      padding: '12px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    loginMessage: {
      marginTop: '16px',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '14px'
    }
  };

  return (
    <div style={styles.container}>
      {/* CELEBRATION SCREEN - Fullscreen overlay when fast completes */}
      {showCelebration && completedFastData && (() => {
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
              {/* Color Bar at top */}
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
                  onClick={continueFasting}
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
                  onClick={stopFasting}
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
                  {user ? 'Stop & Save' : 'Stop Fasting'}
                </button>
                
                <button
                  onClick={startNewFast}
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

              {/* Sign-in hint for non-logged users */}
              {!user && (
                <div style={{
                  marginTop: '20px',
                  padding: '12px 16px',
                  background: '#F0F7FF',
                  border: '1px solid #B3D9FF',
                  borderRadius: '8px',
                  fontSize: '13px',
                  color: '#666',
                  textAlign: 'center',
                  lineHeight: '1.5'
                }}>
                  💡 <strong>Sign in</strong> to save your progress and track stats!
                </div>
              )}
            </div>
          </div>
        );
      })()}

      {/* AUTH ERROR BANNER */}
      {authError && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#FFE5E5',
          border: '1px solid #FF6B6B',
          color: '#C92A2A',
          padding: '12px 16px',
          textAlign: 'center',
          fontSize: '14px',
          zIndex: 10000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between'
        }}>
          <div style={{ flex: 1 }}>
            <strong>Authentication Error:</strong> {
              authError.type === 'otp_expired' 
                ? 'Email link expired. Please request a new one.' 
                : authError.description || 'Please try signing in again.'
            }
          </div>
          <button
            onClick={() => setShowLogin(true)}
            style={{
              background: '#C92A2A',
              color: 'white',
              border: 'none',
              padding: '6px 12px',
              borderRadius: '4px',
              fontSize: '13px',
              cursor: 'pointer',
              marginLeft: '12px'
            }}
          >
            Sign In
          </button>
        </div>
      )}

      {/* TEST MODE INDICATOR */}
      {TEST_MODE && (
        <div style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          background: '#FF4444',
          color: 'white',
          padding: '8px',
          textAlign: 'center',
          fontSize: '14px',
          fontWeight: 'bold',
          zIndex: 9999
        }}>
          🧪 TEST MODE: Timer uses SECONDS instead of HOURS
        </div>
      )}
      
      <div style={styles.topBar}>
        <div style={styles.syncIndicator}>
          {user && (
            <>
              <span>{syncing ? '⏳' : '✓'}</span>
              <span>{syncing ? 'Syncing...' : 'Synced'}</span>
            </>
          )}
        </div>

        <div style={styles.authButtons}>
          {user ? (
            <button
              onClick={signOut}
              style={styles.button}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#999';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.color = '#666';
              }}
            >
              Logout
            </button>
          ) : (
            <button
              onClick={() => setShowLogin(true)}
              style={styles.button}
              onMouseEnter={(e) => {
                e.currentTarget.style.borderColor = '#999';
                e.currentTarget.style.color = '#333';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.borderColor = '#ddd';
                e.currentTarget.style.color = '#666';
              }}
            >
              Sign in to sync
            </button>
          )}
        </div>
      </div>

      <div style={styles.app}>
        <div style={styles.timerSection}>
          <h1 style={styles.title}>IF Timer</h1>

          {/* TEST MODE Banner */}
          {TEST_MODE && (
            <div style={{
              background: '#FF6B6B',
              color: 'white',
              padding: '8px 16px',
              borderRadius: '6px',
              fontSize: '12px',
              fontWeight: '500',
              marginBottom: '20px',
              textAlign: 'center'
            }}>
              🧪 TEST MODE: Using seconds instead of hours
            </div>
          )}

          {!isRunning ? (
            <>
              <div 
                ref={circleRef}
                style={styles.circleContainer}
              >
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
                    left: `${handlePosX - 10}px`,
                    top: `${handlePosY - 10}px`,
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

              {/* Notification Info Banner - only show if permission not granted */}
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
                  🔔 <strong>Get notified</strong> when your fast completes!<br/>
                  <span style={{ fontSize: '12px' }}>We'll ask for permission when you start</span>
                </div>
              )}

              <button
                onClick={startTimer}
                style={styles.startButton}
                onMouseEnter={(e) => e.target.style.background = '#555'}
                onMouseLeave={(e) => e.target.style.background = '#333'}
              >
                START
              </button>
            </>
          ) : (
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
                    style={{ transition: 'stroke-dashoffset 1s linear, stroke 0.5s ease' }}
                  />
                </svg>

                <div style={styles.countdownDisplay}>
                  {isExtended ? (
                    <>
                      {/* Extended Mode Display */}
                      <div style={{
                        fontSize: '14px',
                        color: '#4CAF50',
                        fontWeight: '600',
                        marginBottom: '8px',
                        letterSpacing: '0.5px'
                      }}>
                        {hours}{TEST_MODE ? 'sec' : 'h'} ✓ GOAL REACHED
                      </div>
                      <div style={styles.countdownTime}>
                        +{formatTime(timeLeft)}
                      </div>
                      <div style={{
                        ...styles.countdownLabel,
                        color: '#FF6B6B',
                        fontWeight: '600'
                      }}>
                        extended
                      </div>
                    </>
                  ) : (
                    <>
                      {/* Normal Mode Display */}
                      <div style={styles.countdownTime}>{formatTime(timeLeft)}</div>
                      <div style={styles.countdownLabel}>remaining</div>
                    </>
                  )}
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'center', marginTop: '20px' }}>
                <button
                  onClick={cancelTimer}
                  style={{
                    ...styles.controlButton,
                    background: 'transparent',
                    color: '#999',
                    border: '2px solid #e0e0e0',
                    padding: '12px 40px',
                    fontSize: '14px',
                    borderRadius: '50px',
                    letterSpacing: '0.5px',
                    cursor: 'pointer',
                    transition: 'all 0.2s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.borderColor = '#d32f2f';
                    e.currentTarget.style.color = '#d32f2f';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.borderColor = '#e0e0e0';
                    e.currentTarget.style.color = '#999';
                  }}
                >
                  ✕ STOP FASTING
                </button>
              </div>
            </>
          )}
        </div>

        <div style={styles.infoSection}>
          <div style={styles.infoTitle}>
            {!isRunning ? 'Fasting Levels' : 'Body Mode'}
            <div style={styles.infoTitleLine} />
          </div>

          <ul style={styles.infoList}>
            {(!isRunning ? fastingLevels : bodyModes).map((item, index) => (
              <li
                key={index}
                style={{
                  ...styles.infoItem,
                  color: (!isRunning ? calculateFastingLevel(hours) : calculateBodyMode(hours, timeLeft)) === index ? '#333' : '#999',
                  fontWeight: (!isRunning ? calculateFastingLevel(hours) : calculateBodyMode(hours, timeLeft)) === index ? '500' : 'normal'
                }}
                onClick={() => !isRunning && item.startHour && handleLevelClick(item.startHour)}
                onMouseEnter={(e) => {
                  if (!isRunning && item.startHour) {
                    e.currentTarget.style.color = '#333';
                    e.currentTarget.style.fontWeight = '500';
                  }
                }}
                onMouseLeave={(e) => {
                  if (!isRunning && item.startHour && calculateFastingLevel(hours) !== index) {
                    e.currentTarget.style.color = '#999';
                    e.currentTarget.style.fontWeight = 'normal';
                  }
                }}
              >
                <span style={styles.infoHours}>{item.range}</span>
                {item.label}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {showLogin && !user && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}

function LoginModal({ onClose }) {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const [message, setMessage] = useState('');
  const { signInWithEmail } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email) {
      setMessage('Please enter your email');
      return;
    }

    setLoading(true);
    setMessage('');

    try {
      await signInWithEmail(email);
      setSuccess(true);
      setMessage('');
      // No auto-close - user decides when to close
    } catch (error) {
      setSuccess(false);
      setMessage('❌ Error: ' + error.message);
    } finally {
      setLoading(false);
    }
  };

  const styles = {
    modal: {
      position: 'fixed',
      top: 0,
      left: 0,
      right: 0,
      bottom: 0,
      background: 'rgba(0,0,0,0.5)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 1000
    },
    card: {
      background: 'white',
      padding: '40px',
      borderRadius: '12px',
      maxWidth: '400px',
      width: '90%',
      textAlign: 'center'
    },
    title: {
      fontSize: '24px',
      fontWeight: '300',
      marginBottom: '12px',
      color: '#333'
    },
    subtitle: {
      fontSize: '14px',
      color: '#666',
      marginBottom: '30px',
      lineHeight: '1.6'
    },
    input: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      border: '2px solid #e0e0e0',
      borderRadius: '8px',
      marginBottom: '16px',
      outline: 'none',
      boxSizing: 'border-box'
    },
    button: {
      width: '100%',
      padding: '16px',
      fontSize: '16px',
      background: '#333',
      color: 'white',
      border: 'none',
      borderRadius: '8px',
      cursor: 'pointer',
      marginBottom: '12px'
    },
    cancel: {
      background: 'transparent',
      color: '#666',
      border: 'none',
      padding: '12px',
      cursor: 'pointer',
      fontSize: '14px'
    },
    message: {
      marginTop: '16px',
      padding: '12px',
      borderRadius: '6px',
      fontSize: '14px',
      background: message.includes('✅') ? '#e8f5e9' : '#ffebee',
      color: message.includes('✅') ? '#2e7d32' : '#c62828'
    }
  };

  return (
    <div style={styles.modal} onClick={onClose}>
      <div style={styles.card} onClick={(e) => e.stopPropagation()}>
        {!success ? (
          <>
            <h2 style={styles.title}>Sign in to sync</h2>
            <p style={styles.subtitle}>
              Enter your email to sync your timer<br />
              across all your devices. No password needed!
            </p>

            <form onSubmit={handleSubmit}>
              <input
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={loading}
                style={styles.input}
              />

              <button
                type="submit"
                disabled={loading}
                style={styles.button}
              >
                {loading ? 'Sending...' : 'Send Magic Link'}
              </button>

              <button
                type="button"
                onClick={onClose}
                style={styles.cancel}
              >
                Cancel
              </button>
            </form>

            {message && (
              <div style={styles.message}>
                {message}
              </div>
            )}
          </>
        ) : (
          <>
            {/* Success Screen */}
            <div style={{ fontSize: '48px', marginBottom: '20px' }}>📧</div>
            <h2 style={styles.title}>Check your inbox!</h2>
            <p style={{ 
              fontSize: '15px', 
              color: '#666', 
              lineHeight: '1.6',
              marginBottom: '8px'
            }}>
              We sent a magic link to<br />
              <strong style={{ color: '#333' }}>{email}</strong>
            </p>
            <p style={{ 
              fontSize: '14px', 
              color: '#999', 
              lineHeight: '1.6',
              marginBottom: '20px'
            }}>
              Click the link in the email to sign in.
            </p>

            {/* HIGHLIGHTED: Close tab instruction */}
            <div style={{
              background: '#FFF9E6',
              border: '2px solid #FFE066',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '24px'
            }}>
              <p style={{ 
                fontSize: '14px', 
                color: '#333',
                fontWeight: '600',
                margin: 0
              }}>
                ✓ You can close this tab now
              </p>
            </div>

            <button
              onClick={onClose}
              style={{
                ...styles.button,
                background: '#4CAF50'
              }}
            >
              Got it!
            </button>

            <p style={{ 
              fontSize: '12px', 
              color: '#999',
              marginTop: '16px'
            }}>
              💡 The link works on all your devices
            </p>
          </>
        )}
      </div>
    </div>
  );
}