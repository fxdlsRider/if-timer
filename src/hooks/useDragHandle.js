// hooks/useDragHandle.js
import { useState, useEffect, useCallback } from 'react';

// Config
import { TIMER_CONSTANTS } from '../config/constants';

/**
 * Custom hook for managing circle drag handle interaction
 *
 * IMPORTANT: This hook does NOT manage state for angle/hours
 * It receives angle, setAngle, hours, setHours from parent
 * This prevents state synchronization bugs
 *
 * @param {object} circleRef - Ref to the circle SVG element
 * @param {boolean} isRunning - Whether timer is currently running
 * @param {number} angle - Current angle value (controlled from parent)
 * @param {function} setAngle - Setter for angle (from parent)
 * @param {number} hours - Current hours value (controlled from parent)
 * @param {function} setHours - Setter for hours (from parent)
 * @param {function} onInteraction - Optional callback when user interacts (drag or click)
 * @returns {object} Drag state and handlers
 */
export function useDragHandle(circleRef, isRunning, angle, setAngle, hours, setHours, onInteraction) {
  const [isDragging, setIsDragging] = useState(false);

  /**
   * Update angle and hours based on pointer event
   */
  const updateAngleFromEvent = useCallback((e) => {
    if (!circleRef.current) return;

    const rect = circleRef.current.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    // Support both mouse and touch events
    const clientX = e.clientX || (e.touches && e.touches[0].clientX);
    const clientY = e.clientY || (e.touches && e.touches[0].clientY);

    if (!clientX || !clientY) return;

    const deltaX = clientX - centerX;
    const deltaY = clientY - centerY;

    // Calculate angle from center
    let rawAngle = Math.atan2(deltaY, deltaX) * (180 / Math.PI) + 90;
    if (rawAngle < 0) rawAngle += 360;

    // Prevent jump when crossing 0/360 boundary
    if (angle < 180 && rawAngle > 270) return;
    if (angle > 270 && rawAngle < 90) return;

    // Update angle via parent setter
    setAngle(rawAngle);

    // Map angle to hours (14-48h range)
    const hourRange = TIMER_CONSTANTS.HOUR_RANGE; // 34
    const mappedHours = Math.round(TIMER_CONSTANTS.MIN_HOURS + (rawAngle / 360) * hourRange);
    const clampedHours = Math.min(TIMER_CONSTANTS.MAX_HOURS, Math.max(TIMER_CONSTANTS.MIN_HOURS, mappedHours));

    // Update hours via parent setter
    setHours(clampedHours);
  }, [circleRef, angle, setAngle, setHours]);

  /**
   * Handle pointer down (start dragging)
   */
  const handlePointerDown = useCallback((e) => {
    if (isRunning) return;
    e.preventDefault();

    // Notify parent of user interaction (for State 3 feature)
    if (onInteraction) onInteraction();

    setIsDragging(true);
    updateAngleFromEvent(e);
  }, [isRunning, updateAngleFromEvent, onInteraction]);

  /**
   * Handle pointer move (while dragging)
   */
  const handlePointerMove = useCallback((e) => {
    if (!isDragging || isRunning) return;
    e.preventDefault();

    // Notify parent of continuous interaction (resets inactivity timer)
    if (onInteraction) onInteraction();

    updateAngleFromEvent(e);
  }, [isDragging, isRunning, updateAngleFromEvent, onInteraction]);

  /**
   * Handle pointer up (stop dragging)
   */
  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  /**
   * Handle level click (quick selection)
   */
  const handleLevelClick = useCallback((targetHours) => {
    if (isRunning) return;

    // Notify parent of user interaction (for State 3 feature)
    if (onInteraction) onInteraction();

    const hourRange = TIMER_CONSTANTS.HOUR_RANGE;
    const normalizedHours = Math.max(
      TIMER_CONSTANTS.MIN_HOURS,
      Math.min(TIMER_CONSTANTS.MAX_HOURS, targetHours)
    );
    const newAngle = ((normalizedHours - TIMER_CONSTANTS.MIN_HOURS) / hourRange) * 360;

    // Update via parent setters
    setHours(normalizedHours);
    setAngle(newAngle);
  }, [isRunning, setHours, setAngle, onInteraction]);

  // Add global event listeners when dragging
  useEffect(() => {
    if (isDragging) {
      const handleMove = (e) => handlePointerMove(e);
      const handleUp = () => handlePointerUp();

      document.addEventListener('mousemove', handleMove);
      document.addEventListener('mouseup', handleUp);
      document.addEventListener('touchmove', handleMove, { passive: false });
      document.addEventListener('touchend', handleUp);

      return () => {
        document.removeEventListener('mousemove', handleMove);
        document.removeEventListener('mouseup', handleUp);
        document.removeEventListener('touchmove', handleMove);
        document.removeEventListener('touchend', handleUp);
      };
    }
  }, [isDragging, handlePointerMove, handlePointerUp]);

  return {
    // State
    isDragging,

    // Handlers
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleLevelClick,
  };
}
