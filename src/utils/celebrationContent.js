/**
 * Celebration Content Utility
 *
 * Generate celebration messages based on fasting level.
 * Returns title, subtitle, message, and color for completion screen.
 */

import { FASTING_LEVELS } from '../config/constants';

/**
 * Get celebration content for completed fast
 * @param {number} duration - Fasting duration (hours)
 * @returns {object} Celebration content { title, subtitle, message, color }
 */
export const getCelebrationContent = (duration) => {
  // Find matching level
  const level = FASTING_LEVELS.find(
    (l) => duration >= l.startHour && duration < l.endHour
  );

  // Fallback for extended fasts beyond defined ranges
  if (!level) {
    const extendedLevel = FASTING_LEVELS[FASTING_LEVELS.length - 1];
    return {
      title: extendedLevel.title,
      subtitle: `You completed your ${duration}h extended fast!`,
      message: extendedLevel.description,
      color: extendedLevel.color,
    };
  }

  return {
    title: level.title,
    subtitle: `You completed your ${duration}h ${level.label.toLowerCase()} fast!`,
    message: level.description,
    color: level.color,
  };
};

/**
 * Get motivational message based on time of day
 * @param {Date} completionTime - Time fast was completed
 * @returns {string} Additional motivational message
 */
export const getTimeOfDayMessage = (completionTime = new Date()) => {
  const hour = completionTime.getHours();

  if (hour >= 5 && hour < 12) {
    return 'Morning warrior! Great start to the day.';
  } else if (hour >= 12 && hour < 17) {
    return 'Afternoon achiever! Keep the momentum going.';
  } else if (hour >= 17 && hour < 21) {
    return 'Evening champion! You crushed it today.';
  } else {
    return 'Night owl! Your discipline knows no bounds.';
  }
};

/**
 * Get streak message if available
 * @param {number} streakDays - Number of consecutive fasting days
 * @returns {string|null} Streak message or null
 */
export const getStreakMessage = (streakDays) => {
  if (!streakDays || streakDays < 2) return null;

  if (streakDays === 7) {
    return '🔥 One week streak! Consistency is key.';
  } else if (streakDays === 30) {
    return '🏆 30 days! This is a lifestyle now.';
  } else if (streakDays === 100) {
    return '⭐ 100 days! You are unstoppable!';
  } else if (streakDays >= 2) {
    return `🔥 ${streakDays} day streak! Keep it going!`;
  }

  return null;
};

/**
 * Get milestone achievements
 * @param {number} totalFasts - Total number of completed fasts
 * @param {number} totalHours - Total hours fasted
 * @returns {string|null} Milestone message or null
 */
export const getMilestoneMessage = (totalFasts, totalHours) => {
  // First fast milestone
  if (totalFasts === 1) {
    return '🎉 First fast complete! This is just the beginning.';
  }

  // Fast count milestones
  if (totalFasts === 10) return '🎯 10 fasts! You\'re building momentum.';
  if (totalFasts === 50) return '💪 50 fasts! Incredible consistency.';
  if (totalFasts === 100) return '👑 100 fasts! You\'re a legend.';

  // Hour milestones
  if (totalHours === 100) return '⏱️ 100 hours fasted! That\'s over 4 days!';
  if (totalHours === 500) return '⏱️ 500 hours fasted! Remarkable achievement.';
  if (totalHours === 1000) return '⏱️ 1,000 hours fasted! This is mastery.';

  return null;
};

/**
 * Get complete celebration data with all messages
 * @param {object} params - Celebration parameters
 * @param {number} params.duration - Fast duration (hours)
 * @param {Date} params.completionTime - Completion timestamp
 * @param {number} params.streakDays - Current streak
 * @param {number} params.totalFasts - Total fasts completed
 * @param {number} params.totalHours - Total hours fasted
 * @returns {object} Complete celebration data
 */
export const getCompleteCelebrationData = ({
  duration,
  completionTime = new Date(),
  streakDays = 0,
  totalFasts = 0,
  totalHours = 0,
}) => {
  const baseContent = getCelebrationContent(duration);
  const timeMessage = getTimeOfDayMessage(completionTime);
  const streakMessage = getStreakMessage(streakDays);
  const milestoneMessage = getMilestoneMessage(totalFasts, totalHours);

  return {
    ...baseContent,
    additionalMessages: [
      timeMessage,
      streakMessage,
      milestoneMessage,
    ].filter(Boolean), // Remove null values
  };
};
