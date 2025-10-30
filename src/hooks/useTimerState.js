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
  TIMER_CONSTANTS,
} from '../config/constants';

/**
 * Custom hook for managing timer state and logic
 *
 * @param {number} initialHours - Initial hours for timer
 * @returns {object} Timer state and control functions
 */
export function useTimerState(initialHours = TIMER_CONSTANTS.DEFAULT_HOURS) {
  // Test mode configuration
  const TEST_MODE = TEST_MODE_CONFIG.ENABLED;
  const TIME_MULTIPLIER = TEST_MODE ? TEST_MODE_CONFIG.TIME_MULTIPLIER : PRODUCTION_MODE.TIME_MULTIPLIER;
  const TIME_UNIT = TEST_MODE ? TEST_MODE_CONFIG.TIME_UNIT : PRODUCTION_MODE.TIME_UNIT;

  // Timer state
  const [hours, setHours] = useState(initialHours);
  const [isRunning, setIsRunning] = useState(false);
  const [targetTime, setTargetTime] = useState(null);
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Extended mode state
  const [isExtended, setIsExtended] = useState(false);
  const [originalGoalTime, setOriginalGoalTime] = useState(null);

  // Celebration state
  const [showCelebration, setShowCelebration] = useState(false);
  const [completedFastData, setCompletedFastData] = useState(null);

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
   * Cancel/stop the timer
   */
  const cancelTimer = () => {
    setIsRunning(false);
    setTargetTime(null);
    setIsExtended(false);
    setOriginalGoalTime(null);
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
   * Stop fasting and reset timer
   */
  const stopFasting = () => {
    setShowCelebration(false);
    setIsRunning(false);
    setTargetTime(null);
    setIsExtended(false);
    setOriginalGoalTime(null);
  };

  /**
   * Start a new fast (reset everything)
   */
  const startNewFast = () => {
    setShowCelebration(false);
    setIsRunning(false);
    setTargetTime(null);
    setIsExtended(false);
    setOriginalGoalTime(null);
  };

  return {
    // State
    hours,
    setHours,
    isRunning,
    targetTime,
    currentTime,
    timeLeft,
    isExtended,
    originalGoalTime,
    showCelebration,
    completedFastData,

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
