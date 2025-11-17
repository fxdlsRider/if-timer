# IF-Timer Progress Log

## 2025-01-17: Bug Fix - Duplicate Fasts Prevention

### Issue
Hub page displayed incorrect "Total Hours" statistic due to duplicate fasts in database. When viewing statistics with 2 fasts of 19h each, the calculations showed:
- Total Hours: 38h (correct sum)
- Longest Fast: 19h
- Average Fast: 19h
- L+A = 38h (appeared suspicious)

### Root Cause
User had two identical fasts in the database with the same start_time (2025-11-14T16:05:00) and duration (19h), differing only by 5 seconds in end_time. This was likely caused by double-clicking the save button or rapid successive saves.

### Solution Implemented

**1. Code-Level Duplicate Prevention:**
- Modified `saveFast()` in `fastsService.js` to check for existing fasts before inserting
- Checks for duplicates based on: `user_id`, `start_time`, and `duration`
- Returns existing fast instead of creating duplicate
- Logs warning when duplicate is detected

**2. Database-Level Protection:**
- Created migration: `add_unique_constraint_fasts.sql`
- Adds unique constraint: `UNIQUE (user_id, start_time, duration)`
- Automatically cleans up any existing duplicates before adding constraint
- Prevents duplicates at database level even if code checks fail

**3. Cleanup:**
- Removed duplicate fasts from production database
- Removed debug logging added during investigation

### Files Modified
- `src/services/fastsService.js` - Added duplicate detection
- `database/migrations/add_unique_constraint_fasts.sql` - New migration

### Testing
- Verified duplicate detection works
- Confirmed statistics calculate correctly after removing duplicates
- Tested that attempting to save duplicate fast returns existing record

### Known Issues
None.

---

## 2025-11-15: Database Integration - Fasts & Profile Management

### Overview
Implemented complete database integration for saving completed fasts and user profile data. Users can now track their fasting history with real statistics and manage their personal profile information.

### Features Implemented

#### 1. Fasts Database & Statistics
**Database Schema:**
- Created `fasts` table in Supabase to store completed fasting sessions
- Fields: `user_id`, `duration`, `original_goal`, `start_time`, `end_time`, `cancelled`, `unit`
- Row Level Security (RLS) policies ensure users only see their own fasts
- Automatic indexing on `user_id` and `end_time` for performance

**Statistics Calculation:**
- `calculateStatistics()` function computes:
  - Total Fasts (count of all completed sessions)
  - Total Hours (cumulative fasted time)
  - Longest Fast (maximum duration)
  - Current Streak (consecutive days with fasts)
  - Average Fast (mean duration)

**Auto-Save Functionality:**
- Fasts are automatically saved when:
  - User cancels a fast manually (`cancelTimer()`)
  - User completes a fast and clicks "Stop Fasting" (`stopFasting()`)
- Works only for authenticated users (guest data is not persisted)

#### 2. Profile Management
**Database Schema:**
- Created `profiles` table in Supabase
- Fields: `user_id`, `name`, `age`, `height`, `weight`, `target_weight`, `goal`
- Auto-updating `updated_at` timestamp via trigger
- RLS policies for user-specific access

**Hub Page Profile Section:**
- Editable profile with inline editing
- Fields: Name, Age, Height, Weight, Target Weight, Goal
- "Weight to Go" calculation displayed prominently
- Real-time saving to Supabase on "Save" button click
- Empty values display as "-" instead of null/undefined

**Dashboard Panel Integration:**
- Profile data displayed next to timer (left sidebar)
- Shows all profile information (age, height, current weight, target weight, goal)
- Displays real statistics from saved fasts
- Auto-loads data when user logs in

#### 3. Hub Page Redesign
**Layout:**
- 3-column grid layout (Profile, Statistics, Achievements)
- Minimalist design using existing color scheme
- Max-width: 1100px (30% narrower than initial version)
- Responsive grid with proper spacing

**Profile Column:**
- Editable/view mode toggle
- Large, readable typography
- Clean data presentation with subtle borders
- Prominent "Weight to Go" display at bottom

**Statistics Column:**
- Large numbers for visual impact (text-6xl for main stats)
- Real data from database via `useFastsData` hook
- Clean hierarchy: Total Fasts, Current Streak, then other stats
- Updates automatically when new fasts are saved

**Achievements Column:**
- Grid layout with achievement cards
- Visual distinction between earned/unearned
- Progress summary at bottom
- Currently using dummy data (ready for future implementation)

### Technical Implementation

#### New Files Created
1. **Services:**
   - `src/services/fastsService.js` - CRUD operations for fasts
   - `src/services/profileService.js` - CRUD operations for profile data

2. **Hooks:**
   - `src/hooks/useFastsData.js` - Load fasts and calculate statistics
   - `src/hooks/useUserDashboard.js` - Combine profile + statistics data

3. **Database Migrations:**
   - `supabase/migrations/create_fasts_table.sql` - Fasts table schema
   - `supabase/migrations/create_profiles_table.sql` - Profiles table schema

#### Files Modified
1. **Hooks:**
   - `src/hooks/useTimerState.js`
     - Added `userId` parameter
     - Modified `cancelTimer()` to save fasts
     - Modified `stopFasting()` to save fasts

2. **Components:**
   - `src/Timer.jsx` - Pass `user?.id` to `useTimerState()`
   - `src/components/Hub/HubPage.jsx` - Complete redesign with real data
   - `src/components/Dashboard/DashboardPanel.jsx` - Load real data via `useUserDashboard()`

3. **Bug Fixes:**
   - Fixed timer circle going backwards in extended mode
     - Modified `getProgress()` in `src/utils/timeCalculations.js`
     - Returns 100% when `isExtended = true`
   - Fixed "Cancelled" status logic
     - All manual stops now show "Cancelled" (removed < 1 hour condition)

### Security & Data Isolation

**Row Level Security (RLS):**
- All tables have RLS enabled
- Policies use `auth.uid() = user_id` for user-specific access
- Users can only:
  - View their own data (SELECT)
  - Insert their own data (INSERT)
  - Update their own data (UPDATE)
  - Delete their own data (DELETE)

**Authentication Flow:**
- User ID (UUID) from Supabase Auth
- E-mail → Magic Link → Session → User ID
- User ID is permanent and unique
- All database operations use authenticated user's ID
- No hardcoded IDs, fully dynamic and scalable

**Multi-User Support:**
- System works for unlimited users
- Each user sees only their own data
- Automatic data isolation via RLS
- Tested with multiple accounts

### Database Tables

#### Fasts Table
```sql
fasts (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id),
  duration DECIMAL(10, 1),
  original_goal INTEGER,
  start_time TIMESTAMPTZ,
  end_time TIMESTAMPTZ,
  cancelled BOOLEAN DEFAULT FALSE,
  unit VARCHAR(10) DEFAULT 'hours',
  created_at TIMESTAMPTZ DEFAULT NOW()
)
```

#### Profiles Table
```sql
profiles (
  id UUID PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) UNIQUE,
  name VARCHAR(255),
  age INTEGER,
  height INTEGER,
  weight DECIMAL(10, 1),
  target_weight DECIMAL(10, 1),
  goal TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
)
```

### User Workflow

1. **First Time User:**
   - Sign up with email
   - Receive magic link
   - Click link → Logged in
   - Go to Hub → Edit profile → Enter data → Save
   - Start a fast → Cancel or complete
   - Statistics auto-update

2. **Returning User:**
   - Login with email
   - Magic link → Logged in
   - Dashboard shows their profile data
   - Statistics show their fasting history
   - Can edit profile anytime
   - All fasts are saved automatically

### Testing & Verification

**Data Persistence:**
- ✅ Profile data saves correctly
- ✅ Profile data loads on page refresh
- ✅ Fasts save when cancelled
- ✅ Fasts save when completed
- ✅ Statistics calculate correctly
- ✅ Empty values display as "-"

**Multi-User Testing:**
- ✅ User A sees only User A's data
- ✅ User B sees only User B's data
- ✅ No data leakage between users
- ✅ RLS policies working correctly

**UI/UX:**
- ✅ Hub page loads profile data
- ✅ Dashboard panel shows real data
- ✅ Statistics update after fast completion
- ✅ Edit/Save workflow works smoothly

### Migration Instructions

To deploy these changes, run in Supabase SQL Editor:
1. `supabase/migrations/create_fasts_table.sql`
2. `supabase/migrations/create_profiles_table.sql`

Both migrations include RLS policies and indexes.

### Known Issues
None currently.

### Next Steps
- Implement achievements system (currently dummy data)
- Add data export functionality
- Add graphs/charts for fasting history visualization
- Consider adding profile pictures
- Add motivation quotes system

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
