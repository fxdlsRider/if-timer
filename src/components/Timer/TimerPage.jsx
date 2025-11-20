// components/Timer/TimerPage.jsx
import React from 'react';
import TimerCircle from './TimerCircle';
import StatusPanel from '../Levels/StatusPanel';
import DashboardPanel from '../Dashboard/DashboardPanel';
import Leaderboard from '../Leaderboard/Leaderboard';
import './TimerPage.css';

/**
 * TimerPage Component
 *
 * Main timer interface page
 * Displays timer circle, streak, stats, and fasting levels
 * Shows Leaderboard for non-authenticated users, Dashboard for authenticated users
 *
 * @param {object} timerProps - All timer-related props
 */
export default function TimerPage({
  // Auth
  user,
  onSignUp,

  // Timer state
  isRunning,
  isExtended,
  showCompletionSummary,
  completedFastData,
  hours,
  angle,
  timeLeft,
  progress,
  startTime,
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
  onChangeGoal,
  onChangeStartTime,
  onCompletedDataChange,
  handlePosition,
  circumference,
  progressOffset,

  // Status panel
  fastingLevels,
  bodyModes,
  onLevelClick,
  calculateFastingLevel,
  calculateBodyMode
}) {
  return (
    <div className="timer-page-wrapper">
      <div className="timer-page-container">
        {/* Left Column: Leaderboard (not logged in) OR Dashboard (logged in) */}
        <div className="dashboard-column">
          {user ? (
            <DashboardPanel />
          ) : (
            <Leaderboard onSignUp={onSignUp} />
          )}
        </div>

        {/* Timer Section (Center) */}
        <div className="timer-section scale-100 md:scale-100 max-sm:scale-[0.8]">
        {/* TEST MODE Banner */}
        {TEST_MODE && (
          <div className="test-mode-banner">
            🧪 TEST MODE: Using seconds instead of hours
          </div>
        )}

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
          startTime={startTime}
          TIME_UNIT={TIME_UNIT}
          circleRef={circleRef}
          isDragging={isDragging}
          handlePointerDown={handlePointerDown}
          formatTime={formatTime}
          getProgressColor={getProgressColor}
          onStartTimer={onStartTimer}
          onCancelTimer={onCancelTimer}
          onChangeGoal={onChangeGoal}
          onChangeStartTime={onChangeStartTime}
          onCompletedDataChange={onCompletedDataChange}
          fastingLevels={fastingLevels}
          handlePosition={handlePosition}
          circumference={circumference}
          progressOffset={progressOffset}
        />
        </div>

        {/* Status Panel (Fasting Levels / Body States) - Right aligned */}
        <div className="status-column">
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
    </div>
  );
}
