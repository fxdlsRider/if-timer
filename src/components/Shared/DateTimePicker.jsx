// components/Shared/DateTimePicker.jsx
import React, { useState, useEffect, useRef } from 'react';

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
  const [selectedDate, setSelectedDate] = useState(value || new Date());

  // Generate date range: 6 months before and 6 months after today
  const generateDateRange = () => {
    const dates = [];
    const today = new Date();
    // 6 months = approximately 180 days
    for (let i = -180; i <= 180; i++) {
      const date = new Date(today);
      date.setDate(today.getDate() + i);
      dates.push(date);
    }
    return dates;
  };

  const dateOptions = generateDateRange();
  const hours = Array.from({ length: 24 }, (_, i) => i);

  // Weekday names
  const weekdays = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  // Find initial indices
  const findClosestDateIndex = (targetDate) => {
    const targetDay = targetDate.getDate();
    const targetMonth = targetDate.getMonth();
    const targetYear = targetDate.getFullYear();

    return dateOptions.findIndex(d =>
      d.getDate() === targetDay &&
      d.getMonth() === targetMonth &&
      d.getFullYear() === targetYear
    );
  };

  const initialDateIndex = findClosestDateIndex(selectedDate);

  // Current selections (default to today = index 180)
  const [selectedDateIndex, setSelectedDateIndex] = useState(initialDateIndex >= 0 ? initialDateIndex : 180);
  const [selectedHour, setSelectedHour] = useState(selectedDate.getHours());

  // Refs for scroll containers
  const dateRef = useRef(null);
  const hourRef = useRef(null);

  // Update date when any component changes
  useEffect(() => {
    const baseDate = dateOptions[selectedDateIndex];
    const newDate = new Date(baseDate);
    newDate.setHours(selectedHour, 0, 0, 0); // Set minutes to 00
    setSelectedDate(newDate);
    if (onChange) onChange(newDate);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [selectedDateIndex, selectedHour]);

  // Scroll to selected item on mount
  useEffect(() => {
    const scrollToCenter = (ref, index) => {
      if (ref.current) {
        const itemHeight = 40;
        const containerHeight = ref.current.clientHeight;
        const scrollTop = (index * itemHeight) - (containerHeight / 2) + (itemHeight / 2);
        ref.current.scrollTop = scrollTop;
      }
    };

    scrollToCenter(dateRef, selectedDateIndex);
    scrollToCenter(hourRef, selectedHour);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (ref, itemsCount, setValue) => {
    if (!ref.current) return;

    const itemHeight = 40;
    const scrollTop = ref.current.scrollTop;
    const containerHeight = ref.current.clientHeight;
    const centerOffset = scrollTop + (containerHeight / 2);
    const index = Math.round(centerOffset / itemHeight);
    const clampedIndex = Math.max(0, Math.min(index, itemsCount - 1));

    setValue(clampedIndex);
  };

  // Format date display
  const formatDateDisplay = (date) => {
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
            Select Date & Time
          </h3>
        </div>

        {/* Picker Container */}
        <div className="relative mb-4">
          {/* Selection highlight bar */}
          <div className="absolute inset-x-0 top-1/2 -translate-y-1/2 h-10 bg-accent-teal/10 border-y-2 border-accent-teal rounded-lg pointer-events-none z-10" />

          {/* Scrollable columns - 2 columns: Date and Hour */}
          <div className="flex gap-3 h-40 overflow-hidden">
            {/* Date column (Weekday, Date) */}
            <div
              ref={dateRef}
              className="flex-[2] overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
              style={{ scrollSnapType: 'y mandatory' }}
              onScroll={() => handleScroll(dateRef, dateOptions.length, setSelectedDateIndex)}
            >
              <div className="py-14">
                {dateOptions.map((date, index) => (
                  <div
                    key={index}
                    className="h-10 flex items-center justify-center text-text dark:text-text-dark font-medium text-sm snap-center"
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    {formatDateDisplay(date)}
                  </div>
                ))}
              </div>
            </div>

            {/* Hour column (hh:00) */}
            <div
              ref={hourRef}
              className="flex-1 overflow-y-scroll scrollbar-hide snap-y snap-mandatory"
              style={{ scrollSnapType: 'y mandatory' }}
              onScroll={() => handleScroll(hourRef, hours.length, setSelectedHour)}
            >
              <div className="py-14">
                {hours.map((hour) => (
                  <div
                    key={hour}
                    className="h-10 flex items-center justify-center text-text dark:text-text-dark font-medium text-sm snap-center"
                    style={{ scrollSnapAlign: 'center' }}
                  >
                    {hour.toString().padStart(2, '0')}:00
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>

        {/* Selected preview */}
        <div className="text-center mb-3 p-2 bg-background-secondary dark:bg-background-dark-secondary rounded-lg">
          <p className="text-xs text-text-secondary dark:text-text-dark-secondary">
            {formatDateDisplay(dateOptions[selectedDateIndex])} at {selectedHour.toString().padStart(2, '0')}:00
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
