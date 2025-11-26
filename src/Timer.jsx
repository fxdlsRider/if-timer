// src/Timer.jsx
import React, { useState, useRef, useMemo, useCallback, useEffect } from 'react';
import { useAuth } from './AuthContext';

// Hooks
import { useTimerState } from './hooks/useTimerState';
import { useTimerStorage } from './hooks/useTimerStorage';
import { useDragHandle } from './hooks/useDragHandle';

// Components
import NavigationHeader from './components/Navigation/NavigationHeader';
import TimerPage from './components/Timer/TimerPage';
import TrainingPage from './components/Training/TrainingPage';
import ModesPage from './components/Modes/ModesPage';
import HubPage from './components/Hub/HubPage';
import CommunityPage from './components/Community/CommunityPage';
import ResourcesPage from './components/Resources/ResourcesPage';
import AboutPage from './components/About/AboutPage';
import SupportPage from './components/Support/SupportPage';
import StatsPage from './components/Stats/StatsPage';
import LearnPage from './components/Learn/LearnPage';
import ProfilePage from './components/Profile/ProfilePage';
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
  const timerState = useTimerState(hours, user);
  const {
    isRunning,
    targetTime,
    startTime,
    timeLeft,
    isExtended,
    showCelebration,
    completedFastData,
    showCompletionSummary,
    showWellDoneMessage,
    TEST_MODE,
    TIME_UNIT,
    TIME_MULTIPLIER,
    startTimer,
    cancelTimer,
    changeGoal,
    changeStartTime,
    continueFasting,
    stopFasting,
    updateCompletedFastData,
    restoreState,
  } = timerState;

  // State for "Time since last fast" feature
  const [showTimeSinceLastFast, setShowTimeSinceLastFast] = useState(false);
  const [userIsSelecting, setUserIsSelecting] = useState(false); // Track if user is actively selecting
  const inactivityTimerRef = useRef(null);

  // User interaction detection (for "Time since last fast" feature)
  const handleUserInteraction = useCallback(() => {
    // Only detect interactions in State 3 (completion state)
    if (showCompletionSummary) {
      console.log('🎯 User interaction detected in State 3!');

      // Clear existing timer
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        console.log('⏱️  Timer reset');
      }

      // User is actively selecting time - show hours instead of completion message
      setUserIsSelecting(true);
      setShowTimeSinceLastFast(false);

      // Start new 30-second inactivity timer
      inactivityTimerRef.current = setTimeout(() => {
        console.log('⏰ 30 seconds of inactivity - showing Time since last fast!');
        setUserIsSelecting(false); // Stop showing hours
        setShowTimeSinceLastFast(true); // Show time since last fast
      }, 30000); // 30 seconds
    }
  }, [showCompletionSummary]);

  // Auto-show "Time Since Last Fast" after "Well Done" phase ends (after 5 seconds)
  useEffect(() => {
    if (showCompletionSummary) {
      if (showWellDoneMessage) {
        // Phase 1: During "Well Done" phase, hide "Time Since Last Fast"
        setShowTimeSinceLastFast(false);
      } else if (!userIsSelecting) {
        // Phase 2: After "Well Done" phase, show "Time Since Last Fast"
        setShowTimeSinceLastFast(true);
      }
    }
  }, [showWellDoneMessage, showCompletionSummary, userIsSelecting]);

  // Cleanup: Clear timer when exiting State 3 or unmounting
  useEffect(() => {
    // If not in completion state, clear timer and hide display
    if (!showCompletionSummary) {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
        inactivityTimerRef.current = null;
      }
      setUserIsSelecting(false);
      setShowTimeSinceLastFast(false);
    }

    // Cleanup on unmount
    return () => {
      if (inactivityTimerRef.current) {
        clearTimeout(inactivityTimerRef.current);
      }
    };
  }, [showCompletionSummary]);

  // Custom Hook - Drag handling (controlled component pattern)
  const { isDragging, handlePointerDown, handleLevelClick } = useDragHandle(
    circleRef,
    isRunning,
    angle,
    setAngle,
    hours,
    setHours,
    handleUserInteraction // Pass interaction callback
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
    // Restore hours and angle
    if (loadedState.hours !== undefined) setHours(loadedState.hours);
    if (loadedState.angle !== undefined) setAngle(loadedState.angle);

    // ALWAYS restore timer state (for State 3 default logic when timer is stopped)
    if (restoreState) {
      restoreState(loadedState);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // restoreState omitted - stable function, doesn't change

  // Wrapper functions to reset angle on timer actions
  const handleStartTimer = useCallback(() => {
    // Use the current hours value selected by user, don't reset to default
    startTimer();
  }, [startTimer]);

  const handleCancelTimer = useCallback(() => {
    setAngle(TIMER_CONSTANTS.DEFAULT_ANGLE);
    setHours(TIMER_CONSTANTS.DEFAULT_HOURS);
    cancelTimer();
  }, [cancelTimer]);

  // Custom Hook - Storage and sync
  useTimerStorage(
    user,
    timerStateForStorage,
    handleStateLoaded
  );

  // Wrap calculateBodyMode to include TIME_MULTIPLIER and isExtended
  const calculateBodyModeWithMultiplier = useCallback((hours, timeLeft) => {
    return calculateBodyMode(hours, timeLeft, TIME_MULTIPLIER, isExtended);
  }, [TIME_MULTIPLIER, isExtended]);

  // Calculate handle position and progress
  const handleX = angle * (Math.PI / 180);
  const handleY = angle * (Math.PI / 180);
  const radius = CIRCLE_CONFIG.HANDLE_RADIUS;
  const handlePosX = CIRCLE_CONFIG.CENTER_X + Math.sin(handleX) * radius;
  const handlePosY = CIRCLE_CONFIG.CENTER_Y - Math.cos(handleY) * radius;

  const circumference = 2 * Math.PI * CIRCLE_CONFIG.RADIUS;
  const progress = isRunning && targetTime ? calculateProgress(hours, timeLeft, isExtended) : 0;
  const progressOffset = circumference - (progress / 100) * circumference;

  // Render active page based on navigation
  const renderActivePage = () => {
    switch (activeTab) {
      case 'timer':
        return (
          <TimerPage
            user={user}
            onSignUp={() => setShowLogin(true)}
            isRunning={isRunning}
            isExtended={isExtended}
            showCompletionSummary={showCompletionSummary}
            showWellDoneMessage={showWellDoneMessage}
            userIsSelecting={userIsSelecting}
            showTimeSinceLastFast={showTimeSinceLastFast}
            completedFastData={completedFastData}
            hours={hours}
            angle={angle}
            timeLeft={timeLeft}
            progress={progress}
            startTime={startTime}
            TIME_UNIT={TIME_UNIT}
            TEST_MODE={TEST_MODE}
            circleRef={circleRef}
            isDragging={isDragging}
            handlePointerDown={handlePointerDown}
            formatTime={formatTime}
            getProgressColor={getProgressColor}
            onStartTimer={handleStartTimer}
            onCancelTimer={handleCancelTimer}
            onChangeGoal={(newHours) => {
              changeGoal(newHours);
              setHours(newHours);
              setAngle(TIMER_CONSTANTS.DEFAULT_ANGLE + ((newHours - TIMER_CONSTANTS.DEFAULT_HOURS) / 34) * 360);
            }}
            onChangeStartTime={changeStartTime}
            onCompletedDataChange={updateCompletedFastData}
            handlePosition={{ x: handlePosX, y: handlePosY }}
            circumference={circumference}
            progressOffset={progressOffset}
            fastingLevels={FASTING_LEVELS}
            bodyModes={BODY_MODES}
            onLevelClick={handleLevelClick}
            calculateFastingLevel={calculateFastingLevel}
            calculateBodyMode={calculateBodyModeWithMultiplier}
          />
        );
      case 'training':
        return <TrainingPage />;
      case 'modes':
        return <ModesPage />;
      case 'hub':
        return <HubPage user={user} onSignIn={() => setShowLogin(true)} />;
      case 'community':
        return <CommunityPage />;
      case 'resources':
        return <ResourcesPage />;
      case 'about':
        return <AboutPage />;
      case 'support':
        return <SupportPage />;
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
          padding: '2px',
          textAlign: 'center',
          fontSize: '9px',
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
        user={user}
        onSignIn={() => setShowLogin(true)}
      />

      {/* ACTIVE PAGE CONTENT */}
      {renderActivePage()}

      {/* LOGIN MODAL */}
      {showLogin && !user && <LoginModal onClose={() => setShowLogin(false)} />}
    </div>
  );
}
