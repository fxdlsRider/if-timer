// components/Shared/DateTimePicker.jsx
import React, { useState, useEffect, useRef, useMemo } from 'react';

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
 */
export default function DateTimePicker({ value, onChange, onSave, onCancel }) {
  // Use the value prop's date as the "anchor" for the date range
  // This ensures the picker always shows the correct date
  const anchorDate = useMemo(() => {
    const date = value || new Date();
    console.log('=== DateTimePicker anchorDate calculation ===');
    console.log('value prop:', value);
    console.log('date variable:', date);
    // Set to midnight to avoid time zone issues
    const anchor = new Date(date.getFullYear(), date.getMonth(), date.getDate());
    console.log('anchorDate (midnight):', anchor);
    return anchor;
  }, [value]);

  // Generate date range: 6 months before and 6 months after the anchor date
  const dateOptions = useMemo(() => {
    const dates = [];
    // 6 months = approximately 180 days
    const anchorYear = anchorDate.getFullYear();
    const anchorMonth = anchorDate.getMonth();
    const anchorDay = anchorDate.getDate();

    for (let i = -180; i <= 180; i++) {
      // Create date by adding days to anchor date using proper date arithmetic
      const date = new Date(anchorYear, anchorMonth, anchorDay + i);
      dates.push(date);
    }
    return dates;
  }, [anchorDate]);

  const hours = Array.from({ length: 24 }, (_, i) => i);
  const minutes = Array.from({ length: 60 }, (_, i) => i); // 0, 1, 2, ..., 59

  // Weekday names
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Calculate initial indices based on the value prop
  // Since anchorDate is the value's date and is at index 180, we need to find the offset
  const initialValue = value || new Date();

  const initialDateIndex = useMemo(() => {
    const targetDay = initialValue.getDate();
    const targetMonth = initialValue.getMonth();
    const targetYear = initialValue.getFullYear();

    console.log('=== initialDateIndex calculation ===');
    console.log('initialValue:', initialValue);
    console.log('Looking for date:', targetYear, targetMonth, targetDay);
    console.log('dateOptions[180]:', dateOptions[180]);

    const index = dateOptions.findIndex(d =>
      d.getDate() === targetDay &&
      d.getMonth() === targetMonth &&
      d.getFullYear() === targetYear
    );

    console.log('Found index:', index);
    console.log('Date at index:', dateOptions[index]);

    return index >= 0 ? index : 180; // Default to anchor (index 180) if not found
  }, [dateOptions, initialValue, anchorDate]);

  const initialHourIndex = initialValue.getHours();
  const initialMinuteIndex = initialValue.getMinutes(); // Use exact minute

  // Current selections (default to the value prop)
  const [selectedDateIndex, setSelectedDateIndex] = useState(initialDateIndex);
  const [selectedHour, setSelectedHour] = useState(initialHourIndex);
  const [selectedMinute, setSelectedMinute] = useState(initialMinuteIndex);
  const [selectedDate, setSelectedDate] = useState(initialValue);

  // Refs for scroll containers
  const dateRef = useRef(null);
  const hourRef = useRef(null);
  const minuteRef = useRef(null);
  const isInitialScrollRef = useRef(true); // Flag to prevent handleScroll during initial mount
  const scrollTimeoutRef = useRef(null); // For debouncing scroll events

  // Update date when any component changes
  useEffect(() => {
    const baseDate = dateOptions[selectedDateIndex];
    // Create new date using explicit date components to avoid timezone issues
    const actualMinute = minutes[selectedMinute];
    const newDate = new Date(
      baseDate.getFullYear(),
      baseDate.getMonth(),
      baseDate.getDate(),
      selectedHour,
      actualMinute, // minutes
      0, // seconds
      0  // milliseconds
    );
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

    console.log('=== Initial scroll mount ===');
    console.log('selectedDateIndex:', selectedDateIndex);
    console.log('selectedHour:', selectedHour);
    console.log('selectedMinute:', selectedMinute);

    // Small delay to ensure DOM is ready
    setTimeout(() => {
      scrollToCenter(dateRef, selectedDateIndex);
      scrollToCenter(hourRef, selectedHour);
      scrollToCenter(minuteRef, selectedMinute);

      // After initial scroll, allow handleScroll to work
      setTimeout(() => {
        isInitialScrollRef.current = false;
        console.log('Initial scroll flag disabled');
      }, 50);
    }, 10);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (ref, itemsCount, setValue) => {
    // Ignore scroll events during initial mount
    if (isInitialScrollRef.current) return;
    if (!ref.current) return;

    // Debounce scroll events - only update after scrolling stops
    if (scrollTimeoutRef.current) {
      clearTimeout(scrollTimeoutRef.current);
    }

    scrollTimeoutRef.current = setTimeout(() => {
      if (!ref.current) return;

      const itemHeight = 40;
      const scrollTop = ref.current.scrollTop;
      const containerHeight = ref.current.clientHeight;
      const centerOffset = scrollTop + (containerHeight / 2);
      const index = Math.round(centerOffset / itemHeight);
      const clampedIndex = Math.max(0, Math.min(index, itemsCount - 1));

      setValue(clampedIndex);
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

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-background dark:bg-background-dark rounded-2xl shadow-2xl p-4 w-[85%] max-w-sm">
        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="text-base font-semibold text-text dark:text-text-dark">
            When did you start your fast?
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
              onScroll={() => handleScroll(dateRef, dateOptions.length, setSelectedDateIndex)}
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
              onScroll={() => handleScroll(hourRef, hours.length, setSelectedHour)}
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
              onScroll={() => handleScroll(minuteRef, minutes.length, setSelectedMinute)}
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

        {/* Selected preview */}
        <div className="text-center mb-3 p-2 bg-background-secondary dark:bg-background-dark-secondary rounded-lg">
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
            {formatDateDisplay(dateOptions[selectedDateIndex])} at {selectedHour.toString().padStart(2, '0')}:{minutes[selectedMinute].toString().padStart(2, '0')}
          </p>
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
            className="flex-1 px-3 py-2 text-sm bg-accent-teal hover:bg-accent-teal/90 text-white font-semibold rounded-lg transition-colors"
          >
            Save
          </button>
        </div>
      </div>
    </div>
  );
}
