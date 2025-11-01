// hooks/useTimerState.js
import { useState, useEffect, useRef } from 'react';

// Services
import {
  initializeAudioContext,
  playCompletionSound,
} from '../services/audioService';
import {
  requestNotificationPermission,
  showCompletionNotification,
  getNotificationPermission,
} from '../services/notificationService';

// Utils
import {
  getTimeLeft,
  calculateTargetTime,
} from '../utils/timeCalculations';

// Config
import {
  TEST_MODE as TEST_MODE_CONFIG,
  PRODUCTION_MODE,
} from '../config/constants';

/**
 * Custom hook for managing timer state and logic
 *
 * IMPORTANT: This hook does NOT manage hours state
 * It receives hours from parent to prevent state synchronization bugs
 *
 * @param {number} hours - Current hours value (controlled from parent)
 * @returns {object} Timer state and control functions
 */
export function useTimerState(hours) {
  // Test mode configuration
  const TEST_MODE = TEST_MODE_CONFIG.ENABLED;
  const TIME_MULTIPLIER = TEST_MODE ? TEST_MODE_CONFIG.TIME_MULTIPLIER : PRODUCTION_MODE.TIME_MULTIPLIER;
  const TIME_UNIT = TEST_MODE ? TEST_MODE_CONFIG.TIME_UNIT : PRODUCTION_MODE.TIME_UNIT;

  // Timer state
  const [isRunning, setIsRunning] = useState(false);
  const [targetTime, setTargetTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Extended mode state
  const [isExtended, setIsExtended] = useState(false);
  const [originalGoalTime, setOriginalGoalTime] = useState(null);

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedFastData, setCompletedFastData] = useState(null);

  // Post-fast summary state (after user clicks "Stop Fasting")
  const [showCompletionSummary, setShowCompletionSummary] = useState(false);

  // Refs
  const notificationShownRef = useRef(false);

  // Update current time every second for display
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Calculate time left based on target time
  const timeLeft = isRunning
    ? getTimeLeft(targetTime, currentTime, isExtended, originalGoalTime)
    : 0;

  // Show notification when timer completes
  useEffect(() => {
    if (isRunning && timeLeft === 0 && !notificationShownRef.current) {
      notificationShownRef.current = true;

      // Save completion data for celebration screen
      const completionData = {
        duration: hours,
        startTime: new Date(targetTime - (hours * TIME_MULTIPLIER * 1000)),
        endTime: new Date(targetTime),
        unit: TIME_UNIT
      };
      setCompletedFastData(completionData);

      // Play completion sound
      playCompletionSound();

      // Show browser notification
      showCompletionNotification(hours, TIME_UNIT);

      // Show celebration screen
      setShowCelebration(true);
    }
  }, [isRunning, timeLeft, hours, targetTime, TIME_MULTIPLIER, TIME_UNIT]);

  /**
   * Start the timer
   */
  const startTimer = () => {
    // Reset extended mode FIRST before calculating new target
    setIsExtended(false);
    setOriginalGoalTime(null);
    setShowCelebration(false);
    setShowCompletionSummary(false);
    setCompletedFastData(null);

    // Request notification permission
    if (getNotificationPermission() === 'default') {
      requestNotificationPermission();
    }

    // Initialize AudioContext
    initializeAudioContext();

    // Calculate target time
    const target = calculateTargetTime(hours, TIME_MULTIPLIER);

    setTargetTime(target);
    setIsRunning(true);
    notificationShownRef.current = false;
  };

  /**
   * Cancel/stop the timer (before completion)
   */
  const cancelTimer = () => {
    setIsRunning(false);
    setTargetTime(null);
    setIsExtended(false);
    setOriginalGoalTime(null);
    setShowCompletionSummary(false);
    setCompletedFastData(null);
    notificationShownRef.current = false;
  };

  /**
   * Continue fasting after goal is reached (extended mode)
   */
  const continueFasting = () => {
    setIsExtended(true);
    setOriginalGoalTime(targetTime);
    setShowCelebration(false);
  };

  /**
   * Stop fasting and show completion summary
   * Called when user clicks "Stop Fasting" after completing/extending fast
   */
  const stopFasting = () => {
    setShowCelebration(false);
    setIsRunning(false);
    setTargetTime(null);
    setIsExtended(false);
    setOriginalGoalTime(null);

    // Show completion summary with "Start Fast" button
    setShowCompletionSummary(true);
    // Keep completedFastData to display results
  };

  /**
   * Start a new fast (reset everything)
   */
  const startNewFast = () => {
    setShowCelebration(false);
    setShowCompletionSummary(false);
    setCompletedFastData(null);
    setIsRunning(false);
    setTargetTime(null);
    setIsExtended(false);
    setOriginalGoalTime(null);
  };

  return {
    // State
    isRunning,
    targetTime,
    currentTime,
    timeLeft,
    isExtended,
    originalGoalTime,
    showCelebration,
    completedFastData,
    showCompletionSummary,

    // Config
    TEST_MODE,
    TIME_MULTIPLIER,
    TIME_UNIT,

    // Actions
    startTimer,
    cancelTimer,
    continueFasting,
    stopFasting,
    startNewFast,
  };
}
