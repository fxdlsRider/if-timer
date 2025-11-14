# IF-Timer Progress Log

## 2025-11-12: DateTimePicker Bug Fixes & Enhancement

### Issues Fixed

#### 1. Critical Scroll Offset Bug
**Problem:** When scrolling the time picker to select a specific hour (e.g., 16:00), the internal state would register a different time (e.g., 18:00), causing a 1-2 hour discrepancy between UI display and actual selected time.

**Root Cause:** The scroll handler's index calculation didn't account for:
- The padding-top (56px / py-14) of the scroll container
- The item half-height offset needed for proper center alignment

**Solution:**
```javascript
// Before (incorrect)
const centerOffset = scrollTop + (containerHeight / 2);
const index = Math.round(centerOffset / itemHeight);

// After (correct)
const viewportCenter = scrollTop + (containerHeight / 2);
const index = Math.round((viewportCenter - paddingTop - (itemHeight / 2)) / itemHeight);
```

#### 2. DST/Timezone Issues
**Problem:** Date creation using `new Date(year, month, day, hour, minute)` constructor caused timezone shifts, particularly around DST boundaries.

**Solution:** Changed to use `setHours()` method:
```javascript
// Before
const newDate = new Date(
  baseDate.getFullYear(),
  baseDate.getMonth(),
  baseDate.getDate(),
  selectedHour,
  actualMinute,
  0, 0
);

// After
const newDate = new Date(baseDate);
newDate.setHours(selectedHour, actualMinute, 0, 0);
```

#### 3. Goal Time Display Disappearing
**Problem:** When scrolling to certain times, the "Goal ends" text would disappear due to the internal time being incorrectly calculated as being in the future.

**Solution:** Fixed by resolving the scroll offset bug above, which was causing `isDateInFuture` to be incorrectly true.

### Features Enhanced

#### Live Elapsed Time Display
- Added real-time countdown that updates every second
- Shows "00:00" for future dates
- Displays actual elapsed time for past dates
- Format: "HH:MM"

#### Goal Completion Status
The picker now shows three different states:

1. **Future Date Selected:**
   - Elapsed time: "00:00"
   - No goal time display
   - Save button: disabled

2. **Past Date, Goal Not Reached:**
   - Elapsed time: Updates live (e.g., "02:15")
   - Goal display: "Goal ends: Today at 18:00" (or Tomorrow, etc.)
   - Normal text color

3. **Past Date, Goal Reached:**
   - Elapsed time: Updates live
   - Goal display: "Well done! +02:00" (time beyond goal)
   - Green color (accent-teal) and bold text

#### State Management Improvements
- Separated scroll timeout refs per column (date, hour, minute) to prevent cross-interference
- Only updates state when value actually changes
- Added debounce (100ms) for smoother scrolling experience

### Technical Details

**Files Modified:**
- `src/components/Shared/DateTimePicker.jsx` - Core fixes and enhancements
- `src/components/Timer/FastingInfo.jsx` - Removed debug logs, passed goalHours prop

**Commits:**
1. `7fa2465` - feat: Enhance DateTimePicker with minutes support and improved UX
2. `7f737da` - feat: Add live goal tracking to DateTimePicker
3. `dc679eb` - fix: Correct DateTimePicker scroll offset calculation

### Testing Notes
- Tested scrolling to various times (16:00, 17:00, 18:00, 19:00, 20:00)
- Verified correct time display in both UI and internal state
- Confirmed goal time calculations work correctly
- Checked live update functionality (1 second intervals)
- Validated future date handling (disabled save button)

### Known Issues
None currently.

### Next Steps
- Monitor Vercel deployment
- Gather user feedback on new features
- Consider adding haptic feedback for mobile devices
