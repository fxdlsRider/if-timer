// components/Shared/DateTimePicker.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';
import { createPortal } from 'react-dom';

/**
 * DateTimePicker Component
 *
 * iOS-style scroll picker for selecting date and time
 * Format: Weekday, Date, Time (hh:00)
 *
 * @param {Date} value - Current date/time value
 * @param {function} onChange - Callback when date/time changes
 * @param {function} onSave - Callback when user clicks Save
 * @param {function} onCancel - Callback when user clicks Cancel
 * @param {number} goalHours - Goal hours for calculating target time
 * @param {string} title - Custom title for the picker (default: "When did you start your fast?")
 * @param {Date} minDate - Minimum allowed date/time (for validation)
 */
export default function DateTimePicker({ value, onChange, onSave, onCancel, goalHours, title, minDate }) {
  // Generate STATIC date range: 6 months before and 6 months after TODAY (not value prop)
  // This ensures the array doesn't regenerate when scrolling changes the date
  const dateOptions = useMemo(() => {
    const dates = [];
    const today = new Date();
    const todayYear = today.getFullYear();
    const todayMonth = today.getMonth();
    const todayDay = today.getDate();

    // 6 months = approximately 180 days
    for (let i = -180; i <= 180; i++) {
      // Create date by adding days to today using proper date arithmetic
      const date = new Date(todayYear, todayMonth, todayDay + i);
      dates.push(date);
    }

    return dates;
  }, []); // Empty deps - only generate once on mount

  // Create tripled arrays for infinite scroll effect
  // [0-23, 0-23, 0-23] for hours and [0-59, 0-59, 0-59] for minutes
  const hoursBase = Array.from({ length: 24 }, (_, i) => i);
  const hours = [...hoursBase, ...hoursBase, ...hoursBase]; // 72 items total

  const minutesBase = Array.from({ length: 60 }, (_, i) => i);
  const minutes = [...minutesBase, ...minutesBase, ...minutesBase]; // 180 items total

  // Weekday names
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Calculate initial indices based on the value prop
  // Since anchorDate is the value's date and is at index 180, we need to find the offset
  const initialValue = value || new Date();

  const initialDateIndex = useMemo(() => {
    const targetDay = initialValue.getDate();
    const targetMonth = initialValue.getMonth();
    const targetYear = initialValue.getFullYear();

    const index = dateOptions.findIndex(d =>
      d.getDate() === targetDay &&
      d.getMonth() === targetMonth &&
      d.getFullYear() === targetYear
    );

    return index >= 0 ? index : 180; // Default to today (index 180) if not found
  }, [dateOptions, initialValue]);

  // Start in the middle section for infinite scroll (second copy of the tripled array)
  const initialHourIndex = initialValue.getHours() + 24; // Add 24 to start in middle section
  const initialMinuteIndex = initialValue.getMinutes() + 60; // Add 60 to start in middle section

  // Current selections (default to the value prop)
  const [selectedDateIndex, setSelectedDateIndex] = useState(initialDateIndex);
  const [selectedHour, setSelectedHour] = useState(initialHourIndex);
  const [selectedMinute, setSelectedMinute] = useState(initialMinuteIndex);
  const [selectedDate, setSelectedDate] = useState(initialValue);

  // Live elapsed time
  const [currentTime, setCurrentTime] = useState(Date.now());

  // Refs for scroll containers
  const dateRef = useRef(null);
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const isInitialScrollRef = useRef(true); // Flag to prevent handleScroll during initial mount

  // Separate timeout refs for each column to prevent cross-interference
  const dateScrollTimeoutRef = useRef(null);
  const hourScrollTimeoutRef = useRef(null);
  const minuteScrollTimeoutRef = useRef(null);

  // Update current time every second for live elapsed time
  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(Date.now());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  // Sync internal state when value prop changes (e.g., when picker reopens with updated time)
  useEffect(() => {
    const newValue = value || new Date();

    // Find date index for the new value
    const targetDay = newValue.getDate();
    const targetMonth = newValue.getMonth();
    const targetYear = newValue.getFullYear();

    const index = dateOptions.findIndex(d =>
      d.getDate() === targetDay &&
      d.getMonth() === targetMonth &&
      d.getFullYear() === targetYear
    );

    const dateIndex = index >= 0 ? index : 180;
    // Start in middle section for infinite scroll
    const hourIndex = newValue.getHours() + 24;
    const minuteIndex = newValue.getMinutes() + 60;

    // Update states to match the new value
    setSelectedDateIndex(dateIndex);
    setSelectedHour(hourIndex);
    setSelectedMinute(minuteIndex);
    setSelectedDate(newValue);
  }, [value, dateOptions]);

  // Update date when any component changes
  useEffect(() => {
    const baseDate = dateOptions[selectedDateIndex];

    // Use modulo to get actual hour/minute from tripled arrays
    const actualHour = hours[selectedHour] % 24;
    const actualMinute = minutes[selectedMinute] % 60;

    // Create date by copying base date and then setting time
    // This avoids DST issues with the Date constructor
    const newDate = new Date(baseDate);
    newDate.setHours(actualHour, actualMinute, 0, 0);

    setSelectedDate(newDate);
    if (onChange) onChange(newDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateIndex, selectedHour, selectedMinute]);

  // Scroll to selected item on mount
  useEffect(() => {
    const scrollToCenter = (ref, index) => {
      if (ref.current) {
        // Find the child element at the specified index
        const children = ref.current.querySelector('.py-14').children;
        if (children && children[index]) {
          // Use scrollIntoView for precise centering
          children[index].scrollIntoView({
            block: 'center',
            inline: 'center',
            behavior: 'instant'
          });
        }
      }
    };

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      scrollToCenter(dateRef, selectedDateIndex);
      scrollToCenter(hourRef, selectedHour);
      scrollToCenter(minuteRef, selectedMinute);

      // After initial scroll, allow handleScroll to work
      setTimeout(() => {
        isInitialScrollRef.current = false;
      }, 50);
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (ref, itemsCount, setValue, columnName, timeoutRef) => {
    // Ignore scroll events during initial mount
    if (isInitialScrollRef.current) {
      return;
    }
    if (!ref.current) return;

    // Debounce scroll events - only update after scrolling stops
    // Use column-specific timeout ref to prevent cross-interference
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    timeoutRef.current = setTimeout(() => {
      if (!ref.current) return;

      const itemHeight = 40;
      const scrollTop = ref.current.scrollTop;
      const containerHeight = ref.current.clientHeight;
      const paddingTop = 56; // py-14 = 3.5rem = 56px

      // Calculate which item is centered in the viewport
      // The center of the viewport relative to the content
      const viewportCenter = scrollTop + (containerHeight / 2);
      // Account for padding and calculate item index
      const index = Math.round((viewportCenter - paddingTop - (itemHeight / 2)) / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, itemsCount - 1));

      // Check if value actually changed before setting
      const currentValue = columnName === 'DATE' ? selectedDateIndex :
                          columnName === 'HOUR' ? selectedHour :
                          selectedMinute;

      if (currentValue !== clampedIndex) {
        setValue(clampedIndex);

        // Infinite scroll: Re-center if we're in the first or third section
        // This creates seamless wrap-around effect
        setTimeout(() => {
          if (!ref.current) return;

          let newIndex = clampedIndex;
          let shouldReCenter = false;

          if (columnName === 'HOUR') {
            // Hours: 72 items (3 x 24), middle section is indices 24-47
            if (clampedIndex < 24) {
              // In first section, jump to equivalent in middle section
              newIndex = clampedIndex + 24;
              shouldReCenter = true;
            } else if (clampedIndex >= 48) {
              // In third section, jump to equivalent in middle section
              newIndex = clampedIndex - 24;
              shouldReCenter = true;
            }
          } else if (columnName === 'MINUTE') {
            // Minutes: 180 items (3 x 60), middle section is indices 60-119
            if (clampedIndex < 60) {
              // In first section, jump to equivalent in middle section
              newIndex = clampedIndex + 60;
              shouldReCenter = true;
            } else if (clampedIndex >= 120) {
              // In third section, jump to equivalent in middle section
              newIndex = clampedIndex - 60;
              shouldReCenter = true;
            }
          }

          if (shouldReCenter) {
            setValue(newIndex);
            // Scroll to the new position instantly without animation
            const children = ref.current.querySelector('.py-14').children;
            if (children && children[newIndex]) {
              children[newIndex].scrollIntoView({
                block: 'center',
                inline: 'center',
                behavior: 'instant'
              });
            }
          }
        }, 150); // Small delay after value is set
      }
    }, 100); // Wait 100ms after scroll stops
  };

  // Format date display
  const formatDateDisplay = (date) => {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const dateOnly = new Date(date.getFullYear(), date.getMonth(), date.getDate());

    // Check if date is today
    if (dateOnly.getTime() === today.getTime()) {
      return 'Today';
    }

    const weekday = weekdays[date.getDay()];
    const day = date.getDate();
    const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
    const month = months[date.getMonth()];
    return `${weekday}, ${day} ${month}`;
  };

  // Check if selected date is in the future
  const isDateInFuture = selectedDate.getTime() > currentTime;

  // Check if selected date is before minDate (if provided)
  const isBeforeMinDate = minDate && selectedDate.getTime() < minDate.getTime();

  // Disable save button if date is invalid
  const isInvalidDate = isDateInFuture || isBeforeMinDate;

  // Calculate elapsed time since selected start time
  const calculateElapsedTime = () => {
    const elapsedMs = currentTime - selectedDate.getTime();

    // If date is in future, show 00:00
    if (elapsedMs < 0) {
      return '00:00';
    }

    const totalMinutes = Math.floor(elapsedMs / 60000);
    const hours = Math.floor(totalMinutes / 60);
    const minutes = totalMinutes % 60;

    return `${hours.toString().padStart(2, '0')}:${minutes.toString().padStart(2, '0')}`;
  };

  // Calculate target time (start time + goal hours)
  const calculateTargetTime = () => {
    if (!goalHours) return null;

    const targetDate = new Date(selectedDate.getTime() + (goalHours * 60 * 60 * 1000));
    return targetDate;
  };

  // Format target time display
  const formatTargetTime = () => {
    // Don't show anything if date is in the future (fast hasn't started yet)
    if (isDateInFuture) {
      return null;
    }

    const target = calculateTargetTime();
    if (!target) {
      return null;
    }

    // Check if goal is already reached
    const targetTime = target.getTime();
    const isGoalReached = currentTime >= targetTime;

    if (isGoalReached) {
      // Calculate additional time beyond goal
      const additionalMs = currentTime - targetTime;
      const additionalMinutes = Math.floor(additionalMs / 60000);
      const additionalHours = Math.floor(additionalMinutes / 60);
      const additionalMins = additionalMinutes % 60;

      return {
        type: 'completed',
        text: `Well done! +${additionalHours.toString().padStart(2, '0')}:${additionalMins.toString().padStart(2, '0')}`
      };
    }

    // Goal not reached yet - show when it will end
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    const tomorrow = new Date(today.getTime() + 24 * 60 * 60 * 1000);
    const targetDay = new Date(target.getFullYear(), target.getMonth(), target.getDate());

    const timeStr = target.toLocaleTimeString('en-GB', { hour: '2-digit', minute: '2-digit' });

    let dateStr;
    // Check if target is today
    if (targetDay.getTime() === today.getTime()) {
      dateStr = `Today at ${timeStr}`;
    }
    // Check if target is tomorrow
    else if (targetDay.getTime() === tomorrow.getTime()) {
      dateStr = `Tomorrow at ${timeStr}`;
    }
    // Otherwise show weekday and date
    else {
      const weekday = weekdays[target.getDay()];
      const day = target.getDate();
      const months = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
      const month = months[target.getMonth()];
      dateStr = `${weekday}, ${day} ${month} at ${timeStr}`;
    }

    return {
      type: 'ongoing',
      text: `Goal ends: ${dateStr}`
    };
  };

  const modalContent = (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background dark:bg-background-dark rounded-2xl shadow-2xl p-4 w-[85%] max-w-sm">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="text-base font-semibold text-text dark:text-text-dark">
            {title || "When did you start your fast?"}
          </h3>
        </div>

        {/* Picker Container */}
        <div className="relative mb-4">
          {/* Selection highlight bar */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-accent-teal/10 border-y-2 border-accent-teal rounded-lg pointer-events-none z-10" />

          {/* Gradient fade overlays - top and bottom */}
          <div className="absolute inset-x-0 top-0 h-16 bg-gradient-to-b from-background dark:from-background-dark to-transparent pointer-events-none z-20" />
          <div className="absolute inset-x-0 bottom-0 h-16 bg-gradient-to-t from-background dark:from-background-dark to-transparent pointer-events-none z-20" />

          {/* Scrollable columns - 3 columns: Date, Hour, Minute */}
          <div className="flex gap-2 h-40 overflow-hidden">
            {/* Date column (Weekday, Date) - right aligned */}
            <div
              ref={dateRef}
              className="flex-[3] overflow-y-scroll scrollbar-hide"
              style={{ scrollSnapType: 'y proximity' }}
              onScroll={() => handleScroll(dateRef, dateOptions.length, setSelectedDateIndex, 'DATE', dateScrollTimeoutRef)}
            >
              <div className="py-14">
                {dateOptions.map((date, index) => (
                  <div
                    key={index}
                    className="h-10 flex items-center justify-end pr-2 text-text dark:text-text-dark font-medium text-sm snap-center"
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    {formatDateDisplay(date)}
                  </div>
                ))}
              </div>
            </div>

            {/* Hour column (hh) */}
            <div
              ref={hourRef}
              className="flex-1 overflow-y-scroll scrollbar-hide"
              style={{ scrollSnapType: 'y proximity' }}
              onScroll={() => handleScroll(hourRef, hours.length, setSelectedHour, 'HOUR', hourScrollTimeoutRef)}
            >
              <div className="py-14">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-10 flex items-center justify-center text-text dark:text-text-dark font-medium text-sm snap-center"
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    {hour.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>

            {/* Minute column (mm) */}
            <div
              ref={minuteRef}
              className="flex-1 overflow-y-scroll scrollbar-hide"
              style={{ scrollSnapType: 'y proximity' }}
              onScroll={() => handleScroll(minuteRef, minutes.length, setSelectedMinute, 'MINUTE', minuteScrollTimeoutRef)}
            >
              <div className="py-14">
                {minutes.map((minute, index) => (
                  <div
                    key={index}
                    className="h-10 flex items-center justify-center text-text dark:text-text-dark font-medium text-sm snap-center"
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    {minute.toString().padStart(2, '0')}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Elapsed time preview */}
        <div className="text-center mb-3 p-3 bg-background-secondary dark:bg-background-dark-secondary rounded-lg">
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary mb-1">
            Elapsed time
          </p>
          <p className="text-2xl font-bold text-accent-teal">
            {calculateElapsedTime()}
          </p>
          {goalHours && (() => {
            const targetInfo = formatTargetTime();
            if (!targetInfo) return null;

            return (
              <p className={`text-xs mt-1 ${
                targetInfo.type === 'completed'
                  ? 'text-accent-teal font-semibold'
                  : 'text-text-secondary dark:text-text-dark-secondary'
              }`}>
                {targetInfo.text}
              </p>
            );
          })()}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={onCancel}
            className="flex-1 px-3 py-2 text-sm text-text-secondary dark:text-text-dark-secondary border border-border dark:border-border-dark rounded-lg hover:bg-background-secondary dark:hover:bg-background-dark-secondary transition-colors"
          >
            Cancel
          </button>
          <button
            onClick={() => onSave(selectedDate)}
            disabled={isInvalidDate}
            className={`flex-1 px-3 py-2 text-sm font-semibold rounded-lg transition-colors ${
              isInvalidDate
                ? 'bg-gray-400 dark:bg-gray-600 text-gray-600 dark:text-gray-400 cursor-not-allowed'
                : 'bg-accent-teal hover:bg-accent-teal/90 text-white'
            }`}
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );

  return createPortal(modalContent, document.body);
}
