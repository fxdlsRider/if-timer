/**
 * Notification Service
 *
 * Handles browser notifications using Notification API.
 * Manages permission requests and notification display.
 */

import { NOTIFICATION_CONFIG } from '../config/constants';

/**
 * Check if notifications are supported
 * @returns {boolean} True if Notification API is available
 */
export const isNotificationSupported = () => {
  return 'Notification' in window;
};

/**
 * Get current notification permission status
 * @returns {string} 'granted', 'denied', or 'default'
 */
export const getNotificationPermission = () => {
  if (!isNotificationSupported()) {
    return 'denied';
  }
  return Notification.permission;
};

/**
 * Request notification permission
 * @returns {Promise<string>} Permission status ('granted', 'denied', or 'default')
 */
export const requestNotificationPermission = async () => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported in this browser');
    return 'denied';
  }

  if (Notification.permission === 'granted') {
    return 'granted';
  }

  try {
    const permission = await Notification.requestPermission();
    console.log(`Notification permission: ${permission}`);
    return permission;
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return 'denied';
  }
};

/**
 * Show a notification
 * @param {string} title - Notification title
 * @param {object} options - Notification options
 * @param {string} options.body - Notification body text
 * @param {string} options.icon - Icon URL (optional)
 * @param {string} options.tag - Notification tag (optional)
 * @param {boolean} options.requireInteraction - Keep notification visible (optional)
 * @returns {Notification|null} Notification instance or null
 */
export const showNotification = (title, options = {}) => {
  if (!isNotificationSupported()) {
    console.warn('Notifications not supported');
    return null;
  }

  if (Notification.permission !== 'granted') {
    console.warn('Notification permission not granted');
    return null;
  }

  try {
    const notification = new Notification(title, {
      icon: NOTIFICATION_CONFIG.ICON,
      tag: NOTIFICATION_CONFIG.TAG,
      ...options,
    });

    return notification;
  } catch (error) {
    console.error('Error showing notification:', error);
    return null;
  }
};

/**
 * Show timer completion notification
 * @param {number} duration - Fast duration (hours or seconds)
 * @param {string} unit - Time unit ('hours' or 'seconds')
 * @returns {Notification|null} Notification instance or null
 */
export const showCompletionNotification = (duration, unit = 'hours') => {
  const formattedDuration = unit === 'seconds' ? `${duration} seconds` : `${duration}h`;

  return showNotification('IF Timer Complete! 🎉', {
    body: `Your ${formattedDuration} fast is complete! Great job!`,
    requireInteraction: false, // Notification will auto-hide
  });
};

/**
 * Show reminder notification
 * @param {string} message - Reminder message
 * @returns {Notification|null} Notification instance or null
 */
export const showReminderNotification = (message) => {
  return showNotification('IF Timer Reminder', {
    body: message,
    requireInteraction: false,
  });
};

/**
 * Show milestone notification
 * @param {string} title - Milestone title
 * @param {string} message - Milestone message
 * @returns {Notification|null} Notification instance or null
 */
export const showMilestoneNotification = (title, message) => {
  return showNotification(title, {
    body: message,
    requireInteraction: false,
  });
};

/**
 * Close all notifications with specific tag
 * Note: This only works for notifications created by the same page
 * @param {string} tag - Notification tag to close
 */
export const closeNotificationsByTag = (tag = NOTIFICATION_CONFIG.TAG) => {
  // Unfortunately, there's no direct API to close all notifications
  // This is a limitation of the Notification API
  console.log(`Close notifications with tag: ${tag} (manual user action required)`);
};

/**
 * Check if user has interacted with notifications before
 * @returns {boolean} True if permission was explicitly granted or denied
 */
export const hasUserRespondedToPermission = () => {
  return isNotificationSupported() && Notification.permission !== 'default';
};

/**
 * Get permission status info
 * @returns {object} Permission status information
 */
export const getPermissionInfo = () => {
  if (!isNotificationSupported()) {
    return {
      supported: false,
      permission: 'denied',
      message: 'Notifications not supported in this browser',
    };
  }

  const permission = Notification.permission;
  let message = '';

  switch (permission) {
    case 'granted':
      message = 'Notifications enabled';
      break;
    case 'denied':
      message = 'Notifications blocked. Enable in browser settings.';
      break;
    case 'default':
      message = 'Click to enable notifications';
      break;
    default:
      message = 'Unknown permission status';
  }

  return {
    supported: true,
    permission,
    message,
  };
};
