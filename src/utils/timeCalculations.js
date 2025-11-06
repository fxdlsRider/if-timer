/**
 * Time Calculations Utility
 *
 * Pure functions for time-related calculations.
 * No dependencies on React or external state.
 */

/**
 * Format seconds to HH:MM:SS
 * @param {number} seconds - Total seconds
 * @returns {string} Formatted time string (HH:MM:SS)
 */
export const formatTime = (seconds) => {
  const h = Math.floor(seconds / 3600);
  const m = Math.floor((seconds % 3600) / 60);
  const s = seconds % 60;
  return `${String(h).padStart(2, '0')}:${String(m).padStart(2, '0')}:${String(s).padStart(2, '0')}`;
};

/**
 * Calculate time remaining until target
 * @param {number} targetTime - Target timestamp (ms)
 * @param {number} currentTime - Current timestamp (ms)
 * @param {boolean} isExtended - Extended mode flag
 * @param {number|null} originalGoalTime - Original goal timestamp (ms)
 * @returns {number} Seconds remaining (or elapsed if extended)
 */
export const getTimeLeft = (targetTime, currentTime, isExtended = false, originalGoalTime = null) => {
  if (!targetTime) return 0;

  // Extended mode: show time beyond goal
  if (isExtended && originalGoalTime && originalGoalTime < currentTime) {
    const elapsed = Math.floor((currentTime - originalGoalTime) / 1000);
    return Math.max(0, elapsed); // Positive number = time beyond goal
  }

  // Normal mode: countdown to goal
  const remaining = Math.max(0, Math.floor((targetTime - currentTime) / 1000));
  return remaining;
};

/**
 * Calculate progress percentage
 * @param {number} totalHours - Total fasting duration (hours)
 * @param {number} timeLeft - Time remaining (seconds)
 * @returns {number} Progress percentage (0-100)
 */
export const getProgress = (totalHours, timeLeft) => {
  const totalSeconds = totalHours * 3600;
  const elapsed = totalSeconds - timeLeft;
  return (elapsed / totalSeconds) * 100;
};

/**
 * Calculate fasting level based on hours
 * @param {number} hours - Fasting duration (hours)
 * @returns {number} Level index (0-5)
 */
export const getFastingLevel = (hours) => {
  if (hours >= 14 && hours < 16) return 0; // Gentle
  if (hours >= 16 && hours < 18) return 1; // Classic
  if (hours >= 18 && hours < 20) return 2; // Intensive
  if (hours >= 20 && hours < 24) return 3; // Warrior
  if (hours >= 24 && hours < 36) return 4; // Monk
  return 5; // Extended (36+)
};

/**
 * Calculate body mode based on elapsed time
 * @param {number} totalHours - Total fasting duration (hours in production, seconds in test mode)
 * @param {number} timeLeft - Time remaining (seconds)
 * @param {number} timeMultiplier - Time multiplier (1 for test mode, 3600 for production)
 * @returns {number} Body mode index (0-4)
 */
export const getBodyMode = (totalHours, timeLeft, timeMultiplier = 3600) => {
  // Calculate elapsed time in seconds
  const totalSeconds = totalHours * timeMultiplier;
  const elapsed = totalSeconds - timeLeft;
  // Convert elapsed seconds back to "units" (seconds in test mode, hours in production)
  const elapsedInUnits = elapsed / timeMultiplier;

  if (elapsedInUnits < 4) return 0;   // Digesting
  if (elapsedInUnits < 12) return 1;  // Getting ready
  if (elapsedInUnits < 18) return 2;  // Fat burning
  if (elapsedInUnits < 24) return 3;  // Cell renewal
  return 4; // Deep healing (24+)
};

/**
 * Map hours to angle on circle (14-48h → 0-360°)
 * @param {number} hours - Fasting duration (14-48)
 * @returns {number} Angle in degrees (0-360)
 */
export const hoursToAngle = (hours) => {
  const HOUR_RANGE = 34; // 48 - 14 = 34 hours range
  const MIN_HOURS = 14;
  const normalizedHours = Math.max(MIN_HOURS, Math.min(48, hours));
  return ((normalizedHours - MIN_HOURS) / HOUR_RANGE) * 360;
};

/**
 * Map angle on circle to hours (0-360° → 14-48h)
 * @param {number} angle - Angle in degrees (0-360)
 * @returns {number} Fasting duration (14-48)
 */
export const angleToHours = (angle) => {
  const HOUR_RANGE = 34;
  const MIN_HOURS = 14;
  const mappedHours = Math.round(MIN_HOURS + (angle / 360) * HOUR_RANGE);
  return Math.min(48, Math.max(MIN_HOURS, mappedHours));
};

/**
 * Calculate target completion time
 * @param {number} hours - Fasting duration (hours)
 * @param {number} timeMultiplier - Time multiplier (1 for test mode, 3600 for production)
 * @returns {number} Target timestamp (ms)
 */
export const calculateTargetTime = (hours, timeMultiplier = 3600) => {
  const now = Date.now();
  return now + (hours * timeMultiplier * 1000);
};
