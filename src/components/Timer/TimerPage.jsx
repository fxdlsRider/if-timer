// components/Timer/TimerPage.jsx
import React from 'react';
import TimerCircle from './TimerCircle';
import StatusPanel from '../Levels/StatusPanel';
import StreakDisplay from '../Shared/StreakDisplay';
import StatsDisplay from '../Shared/StatsDisplay';
import DashboardPanel from '../Dashboard/DashboardPanel';

/**
 * TimerPage Component
 *
 * Main timer interface page
 * Displays timer circle, streak, stats, and fasting levels
 *
 * @param {object} timerProps - All timer-related props
 */
export default function TimerPage({
  // Timer state
  isRunning,
  isExtended,
  showCompletionSummary,
  completedFastData,
  hours,
  angle,
  timeLeft,
  progress,
  TIME_UNIT,
  TEST_MODE,

  // Timer circle
  circleRef,
  isDragging,
  handlePointerDown,
  formatTime,
  getProgressColor,
  onStartTimer,
  onCancelTimer,
  handlePosition,
  circumference,
  progressOffset,

  // Status panel
  fastingLevels,
  bodyModes,
  onLevelClick,
  calculateFastingLevel,
  calculateBodyMode,

  // Stats (dummy data for now)
  streakDays = 12,
  totalHours = 247,
  goalHours = 16
}) {
  const styles = {
    wrapper: {
      width: '100%',
      display: 'flex',
      justifyContent: 'center',
      padding: '40px 20px',
      boxSizing: 'border-box'
    },
    container: {
      display: 'flex',
      gap: '40px',
      maxWidth: '1400px',
      width: '100%',
      alignItems: 'flex-start',
      justifyContent: 'center'
    },
    timerSection: {
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      minWidth: '320px'
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
    <div style={styles.wrapper}>
      <div style={styles.container}>
        {/* Dashboard Panel (Left) */}
        <DashboardPanel />

        {/* Timer Section (Center) */}
        <div style={styles.timerSection}>
        {/* TEST MODE Banner */}
        {TEST_MODE && (
          <div style={styles.testModeBanner}>
            🧪 TEST MODE: Using seconds instead of hours
          </div>
        )}

        {/* Streak Display */}
        <StreakDisplay streakDays={streakDays} />

        {/* Timer Circle */}
        <TimerCircle
          isRunning={isRunning}
          isExtended={isExtended}
          showCompletionSummary={showCompletionSummary}
          completedFastData={completedFastData}
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
          onStartTimer={onStartTimer}
          onCancelTimer={onCancelTimer}
          handlePosition={handlePosition}
          circumference={circumference}
          progressOffset={progressOffset}
        />

        {/* Stats Display */}
        <StatsDisplay
          totalHours={totalHours}
          goalHours={goalHours}
        />
      </div>

        {/* Status Panel (Fasting Levels) */}
        <StatusPanel
          isRunning={isRunning}
          hours={hours}
          timeLeft={timeLeft}
          fastingLevels={fastingLevels}
          bodyModes={bodyModes}
          onLevelClick={onLevelClick}
          calculateFastingLevel={calculateFastingLevel}
          calculateBodyMode={calculateBodyMode}
        />
      </div>
    </div>
  );
}
