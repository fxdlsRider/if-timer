// src/Timer.jsx
import React, { useState, useRef, useMemo, useCallback } from 'react';
import { useAuth } from './AuthContext';

// Hooks
import { useTimerState } from './hooks/useTimerState';
import { useTimerStorage } from './hooks/useTimerStorage';
import { useDragHandle } from './hooks/useDragHandle';

// Components
import NavigationHeader from './components/Navigation/NavigationHeader';
import TimerPage from './components/Timer/TimerPage';
import StatsPage from './components/Stats/StatsPage';
import LearnPage from './components/Learn/LearnPage';
import ProfilePage from './components/Profile/ProfilePage';
import CelebrationScreen from './components/Celebration/CelebrationScreen';
import LoginModal from './components/Auth/LoginModal';

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
  const { user, authError } = useAuth();

  // Navigation state
  const [activeTab, setActiveTab] = useState('timer');
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
  useTimerStorage(
    user,
    timerStateForStorage,
    handleStateLoaded
  );

  // Calculate handle position and progress
  const handleX = angle * (Math.PI / 180);
  const handleY = angle * (Math.PI / 180);
  const radius = CIRCLE_CONFIG.HANDLE_RADIUS;
  const handlePosX = CIRCLE_CONFIG.CENTER_X + Math.sin(handleX) * radius;
  const handlePosY = CIRCLE_CONFIG.CENTER_Y - Math.cos(handleY) * radius;

  const circumference = 2 * Math.PI * CIRCLE_CONFIG.RADIUS;
  const progress = isRunning && targetTime ? calculateProgress(hours, timeLeft) : 0;
  const progressOffset = circumference - (progress / 100) * circumference;

  // Render active page based on navigation
  const renderActivePage = () => {
    switch (activeTab) {
      case 'timer':
        return (
          <TimerPage
            isRunning={isRunning}
            isExtended={isExtended}
            hours={hours}
            angle={angle}
            timeLeft={timeLeft}
            progress={progress}
            TIME_UNIT={TIME_UNIT}
            TEST_MODE={TEST_MODE}
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
            fastingLevels={FASTING_LEVELS}
            bodyModes={BODY_MODES}
            onLevelClick={handleLevelClick}
            calculateFastingLevel={calculateFastingLevel}
            calculateBodyMode={calculateBodyMode}
          />
        );
      case 'stats':
        return <StatsPage />;
      case 'learn':
        return <LearnPage />;
      case 'profile':
        return <ProfilePage />;
      default:
        return null;
    }
  };

  const styles = {
    container: {
      minHeight: '100vh',
      background: 'var(--color-background, #fafafa)',
      fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif'
    },
    authErrorBanner: {
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
      zIndex: 10001,
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'space-between'
    }
  };

  return (
    <div style={styles.container}>
      {/* CELEBRATION SCREEN */}
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
        <div style={styles.authErrorBanner}>
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
          zIndex: 10000
        }}>
          🧪 TEST MODE: Timer uses SECONDS instead of HOURS
        </div>
      )}

      {/* NAVIGATION HEADER */}
      <NavigationHeader
        activeTab={activeTab}
        onTabChange={setActiveTab}
        streakDays={12} // TODO: Get from Supabase
      />

      {/* ACTIVE PAGE CONTENT */}
      {renderActivePage()}

      {/* LOGIN MODAL */}
      {showLogin && !user && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
