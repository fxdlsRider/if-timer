// components/Timer/TimerPage.jsx
import React from 'react';
import TimerCircle from './TimerCircle';
import StatusPanel from '../Levels/StatusPanel';
import StreakDisplay from '../Shared/StreakDisplay';
import StatsDisplay from '../Shared/StatsDisplay';
import DashboardPanel from '../Dashboard/DashboardPanel';
import './TimerPage.css';

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
  return (
    <div className="timer-page-wrapper">
      <div className="timer-page-container">
        {/* Dashboard Panel (Left) */}
        <div className="dashboard-column">
          <DashboardPanel />
        </div>

        {/* Timer Section (Center) */}
        <div className="timer-section">
        {/* TEST MODE Banner */}
        {TEST_MODE && (
          <div className="test-mode-banner">
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

        {/* Status Panel (Fasting Levels) - Right aligned */}
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
