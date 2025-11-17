# IF-Timer Progress Log

## 2025-01-17: Hub Redesign & Profile Integration

### Features Implemented

#### 1. Hub Page Redesign - 3-Column Card Layout
**New Design:** Complete redesign of the Hub page with a modern 3-column card layout.

**Layout Structure:**
- **Left Column:** Editable Profile Card
  - Name, Nickname, Age, Height, Weight, Target Weight, Goal
  - Weight to Go calculation (Current - Target)
  - Edit/Save/Cancel functionality
  - Real-time Supabase integration

- **Center Column:** Statistics Card
  - Total Fasts (large display)
  - Current Streak (large display)
  - Total Hours, Longest Fast, Average Fast (compact)
  - Clean, minimal design with proper spacing

- **Right Column:** Achievements Card
  - 2x3 grid of achievement badges
  - Visual states: earned (teal border, full opacity) vs locked (gray, 50% opacity)
  - Progress tracking (3/6 earned, 50%)

**Design System:**
- Card backgrounds: `#FFFFFF` (light) / `#0F172A` (dark)
- Page background: `#F8FAFC` (light) / `#1E293B` (dark)
- Accent colors: Teal `#4ECDC4`, Green `#34C759`
- Padding: 40px per card for spacious feel
- Border radius: 16px for modern, rounded corners
- Max width: 5xl (1280px) for optimal readability

#### 2. Profile Service & Supabase Integration
**New Service:** Created `profileService.js` for profile data management.

**Functions:**
```javascript
fetchProfile(userId)          // Load user profile from Supabase
upsertProfile(userId, data)   // Create or update profile
updateProfile(userId, updates) // Partial update
calculateWeightToGo(w, tw)    // Calculate remaining weight
```

**Database Schema:**
```sql
profiles (
  id, user_id, name, nickname,
  age, height, weight, target_weight, goal,
  created_at, updated_at
)
```

**RLS Policies:** Already configured in previous session.

#### 3. Dashboard Panel - Real Data Integration
**Changes:** Connected Dashboard to real Supabase profile data.

**Data Flow:**
1. Load profile on mount: `useEffect(() => loadProfile(), [user?.id])`
2. Display profile fields conditionally (only if data exists)
3. Calculate weight to go using shared service function
4. Show stats (streak, total fasts, etc.) - placeholder for now

**Goal Field Repositioned:**
- **Before:** Separate row in profile section
- **After:** Moved to green motivation box (gradient background, dashed border)
- **Position:** Below Target Weight, above Weight to Go gauge
- **Design:** Centered, italic text with quote marks

#### 4. Scrollbar Improvements
**Problem:** Visible scrollbars on Dashboard and Fasting Levels panels.

**Solution:** Multi-browser scrollbar hiding:
```css
/* Firefox */
scrollbar-width: none;

/* IE/Edge */
-ms-overflow-style: none;

/* Chrome/Safari/Opera */
.scrollbar-hide::-webkit-scrollbar {
  display: none;
}
```

**Layout Fix:**
- Removed `max-height` constraints on columns
- Removed separate column scrolling (`overflow-y: auto`)
- Let entire page scroll as single unit
- Much cleaner UX

### Technical Details

**Files Created:**
- `src/components/Hub/ProfileCard.jsx` - Editable profile component
- `src/services/profileService.js` - Profile data management

**Files Modified:**
- `src/components/Hub/HubPage.jsx` - Complete redesign with 3 columns
- `src/components/Dashboard/DashboardPanel.jsx` - Real data integration
- `src/components/Levels/StatusPanel.jsx` - Scrollbar fixes
- `src/components/Timer/TimerPage.css` - Layout scroll improvements

**Key Components:**

**ProfileCard Features:**
- Loading state while fetching data
- Edit mode toggle with Save/Cancel buttons
- Inline editing for all fields
- Number inputs with proper step values (0.1 for weight)
- Optimistic UI updates
- Automatic weight to go calculation

**Design Consistency:**
- Used CSS variables for theme colors
- Consistent spacing (12px, 24px, 40px grid)
- Unified border radius (8px, 12px, 16px)
- Typography hierarchy (12px labels, 14px text, 24px-48px numbers)

### Commits
- `2088096` - feat: Add editable profile and improve Hub design

### Testing Notes
- ✅ Profile loads from Supabase on Hub page
- ✅ Edit mode works with Save/Cancel
- ✅ Data persists to Supabase correctly
- ✅ Dashboard shows real profile data
- ✅ Goal displays in green motivation box
- ✅ Scrollbars hidden but scrolling works
- ✅ Page-level scroll works smoothly
- ✅ Responsive layout maintained

### Known Issues
- Statistics (Total Fasts, Streak, etc.) still using placeholder data
  - Need to connect to fasts table for real calculations
- Achievement system needs implementation
  - Currently showing mock data

### Next Steps
- Connect statistics to real fasts data
- Implement achievement system with unlock logic
- Add profile picture upload
- Add data validation and error handling
- Test responsive layout on mobile/tablet

---

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
