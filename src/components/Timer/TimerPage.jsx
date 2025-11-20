// components/Timer/TimerPage.jsx
import React, { useState } from 'react';
import TimerCircle from './TimerCircle';
import StatusPanel from '../Levels/StatusPanel';
import DashboardPanel from '../Dashboard/DashboardPanel';
import Leaderboard from '../Leaderboard/Leaderboard';
import './TimerPage.css';

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
  // Random quote on component mount - stays consistent during session
  const [randomQuote] = useState(() => {
    const randomIndex = Math.floor(Math.random() * motivationalQuotes.length);
    return motivationalQuotes[randomIndex];
  });

  return (
    <>
      {/* Motivational Quote - Above everything */}
      <div style={{ textAlign: 'left', maxWidth: '500px', margin: '10px auto -10px auto', padding: '0 20px', height: '65px', display: 'flex', alignItems: 'flex-start' }}>
        <p style={{ fontSize: '15px', fontStyle: 'italic', color: '#666', marginBottom: '0', lineHeight: '1.4' }}>
          "{randomQuote.text}" <span style={{ fontSize: '12px', color: '#999' }}>— {randomQuote.author}</span>
        </p>
      </div>

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
    </>
  );
}
