// hooks/useDragHandle.js
import { useState, useEffect, useCallback } from 'react';

// Config
import { TIMER_CONSTANTS } from '../config/constants';

/**
 * Custom hook for managing circle drag handle interaction
 *
 * @param {object} circleRef - Ref to the circle SVG element
 * @param {boolean} isRunning - Whether timer is currently running
 * @param {number} initialAngle - Initial angle for the handle
 * @param {number} initialHours - Initial hours value
 * @returns {object} Drag state and handlers
 */
export function useDragHandle(circleRef, isRunning, initialAngle, initialHours) {
  const [isDragging, setIsDragging] = useState(false);
  const [angle, setAngle] = useState(initialAngle);
  const [hours, setHours] = useState(initialHours);

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

    setAngle(rawAngle);

    // Map angle to hours (14-48h range)
    const hourRange = TIMER_CONSTANTS.HOUR_RANGE; // 34
    const mappedHours = Math.round(TIMER_CONSTANTS.MIN_HOURS + (rawAngle / 360) * hourRange);
    setHours(Math.min(TIMER_CONSTANTS.MAX_HOURS, Math.max(TIMER_CONSTANTS.MIN_HOURS, mappedHours)));
  }, [circleRef, angle]);

  /**
   * Handle pointer down (start dragging)
   */
  const handlePointerDown = useCallback((e) => {
    if (isRunning) return;
    e.preventDefault();
    setIsDragging(true);
    updateAngleFromEvent(e);
  }, [isRunning, updateAngleFromEvent]);

  /**
   * Handle pointer move (while dragging)
   */
  const handlePointerMove = useCallback((e) => {
    if (!isDragging || isRunning) return;
    e.preventDefault();
    updateAngleFromEvent(e);
  }, [isDragging, isRunning, updateAngleFromEvent]);

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

    const hourRange = TIMER_CONSTANTS.HOUR_RANGE;
    const normalizedHours = Math.max(
      TIMER_CONSTANTS.MIN_HOURS,
      Math.min(TIMER_CONSTANTS.MAX_HOURS, targetHours)
    );
    const newAngle = ((normalizedHours - TIMER_CONSTANTS.MIN_HOURS) / hourRange) * 360;

    setHours(normalizedHours);
    setAngle(newAngle);
  }, [isRunning]);

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
    angle,
    hours,
    setAngle,
    setHours,

    // Handlers
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    handleLevelClick,
  };
}
