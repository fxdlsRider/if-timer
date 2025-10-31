// src/Timer.jsx
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Hooks
import { useTimerState } from './hooks/useTimerState';
import { useTimerStorage } from './hooks/useTimerStorage';
import { useDragHandle } from './hooks/useDragHandle';

// Components
import CelebrationScreen from './components/Celebration/CelebrationScreen';
import TopBar from './components/Shared/TopBar';
import LoginModal from './components/Auth/LoginModal';
import StatusPanel from './components/Levels/StatusPanel';
import TimerCircle from './components/Timer/TimerCircle';

// Utils
import {
  formatTime,
  getProgress as calculateProgress,
  getFastingLevel as calculateFastingLevel,
  getBodyMode as calculateBodyMode,
} from './utils/timeCalculations';

// Config
import {
  TIMER_CONSTANTS,
  CIRCLE_CONFIG,
  FASTING_LEVELS,
  BODY_MODES,
  getProgressColor,
} from './config/constants';

export default function Timer() {
  const { user, signOut, authError } = useAuth();
  const [showLogin, setShowLogin] = useState(false);
  const circleRef = useRef(null);

  // Local state for angle and hours (controlled by parent, not hooks)
  const [angle, setAngle] = useState(TIMER_CONSTANTS.DEFAULT_ANGLE);
  const [hours, setHours] = useState(TIMER_CONSTANTS.DEFAULT_HOURS);

  // Custom Hooks - Timer state and logic
  const timerState = useTimerState(hours);
  const {
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
  } = timerState;

  // Custom Hook - Drag handling (controlled component pattern)
  const { isDragging, handlePointerDown, handleLevelClick } = useDragHandle(
    circleRef,
    isRunning,
    angle,
    setAngle,
    hours,
    setHours
  );

  // Stabilize timerState object to prevent re-renders
  const timerStateForStorage = useMemo(() => ({
    hours,
    angle,
    isRunning,
    targetTime,
    isExtended,
    originalGoalTime: timerState.originalGoalTime,
  }), [hours, angle, isRunning, targetTime, isExtended, timerState.originalGoalTime]);

  // Stabilize callback to prevent re-creation
  const handleStateLoaded = useCallback((loadedState) => {
    if (loadedState.hours !== undefined) setHours(loadedState.hours);
    if (loadedState.angle !== undefined) setAngle(loadedState.angle);
  }, []);

  // Custom Hook - Storage and sync
  const { syncing } = useTimerStorage(
    user,
    timerStateForStorage,
    handleStateLoaded
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

  // Calculate handle position
  const handleX = angle * (Math.PI / 180);
  const handleY = angle * (Math.PI / 180);
  const radius = CIRCLE_CONFIG.HANDLE_RADIUS;
  const handlePosX = CIRCLE_CONFIG.CENTER_X + Math.sin(handleX) * radius;
  const handlePosY = CIRCLE_CONFIG.CENTER_Y - Math.cos(handleY) * radius;

  // Calculate progress
  const circumference = 2 * Math.PI * CIRCLE_CONFIG.RADIUS;
  const progress = isRunning && targetTime ? calculateProgress(hours, timeLeft) : 0;
  const progressOffset = circumference - (progress / 100) * circumference;

  // Styles for main container only (component styles are in their own files)
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
    testModeBanner: {
      background: '#FF6B6B',
      color: 'white',
      padding: '8px 16px',
      borderRadius: '6px',
      fontSize: '12px',
      fontWeight: '500',
      marginBottom: '20px',
      textAlign: 'center'
    }
  };

  return (
    <div style={styles.container}>
      {/* CELEBRATION SCREEN - Extracted to component */}
      {showCelebration && completedFastData && (
        <CelebrationScreen
          completedFastData={completedFastData}
          onContinue={continueFasting}
          onStop={stopFasting}
          isLoggedIn={!!user}
        />
      )}

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
      
      {/* TOP BAR - Extracted to component */}
      <TopBar
        user={user}
        syncing={syncing}
        onSignOut={signOut}
        onSignIn={() => setShowLogin(true)}
      />

      <div style={styles.app}>
        <div style={styles.timerSection}>
          <h1 style={styles.title}>IF Timer</h1>

          {/* TEST MODE Banner */}
          {TEST_MODE && (
            <div style={styles.testModeBanner}>
              🧪 TEST MODE: Using seconds instead of hours
            </div>
          )}

          {/* TIMER CIRCLE - Extracted to component */}
          <TimerCircle
            isRunning={isRunning}
            hours={hours}
            angle={angle}
            timeLeft={timeLeft}
            progress={progress}
            TIME_UNIT={TIME_UNIT}
            circleRef={circleRef}
            isDragging={isDragging}
            handlePointerDown={handlePointerDown}
            formatTime={formatTime}
            getProgressColor={getProgressColor}
            onStartTimer={startTimer}
            onCancelTimer={cancelTimer}
            handlePosition={{ x: handlePosX, y: handlePosY }}
            circumference={circumference}
            progressOffset={progressOffset}
          />
        </div>

        {/* STATUS PANEL - Extracted to component */}
        <StatusPanel
          isRunning={isRunning}
          hours={hours}
          timeLeft={timeLeft}
          fastingLevels={fastingLevels}
          bodyModes={bodyModes}
          onLevelClick={handleLevelClick}
          calculateFastingLevel={calculateFastingLevel}
          calculateBodyMode={calculateBodyMode}
        />
      </div>

      {/* LOGIN MODAL - Extracted to component */}
      {showLogin && !user && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}