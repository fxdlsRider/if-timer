# Timer Architecture Documentation

**Last Updated:** 2025-11-28
**Status:** Production
**Complexity:** High ⚠️

---

## 🎯 Purpose

This document provides a comprehensive overview of the IF-Timer's architecture, state management, and critical implementation details. **READ THIS BEFORE REFACTORING ANYTHING!**

---

## 📊 High-Level Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                         User Interface                       │
│                      (Timer.jsx + Pages)                     │
└────────────────┬────────────────────────────────────────────┘
                 │
                 ├──► Local State (hours, angle, isDragging)
                 │
                 ├──► useTimerState.js ◄─── Timer Logic
                 │    │                     (start, stop, extend)
                 │    │
                 │    └──► State Machine:
                 │         - State 1: Idle (selecting goal)
                 │         - State 2: Running (fasting)
                 │         - State 3: Completed (summary)
                 │
                 └──► useTimerStorage.js ◄─── Persistence
                      │
                      ├──► localStorage (anonymous users)
                      │
                      └──► Supabase (authenticated users)
                           │
                           ├──► Initial Load
                           ├──► Page Visibility (wake from sleep)
                           ├──► Real-time Sync (multi-device)
                           └──► Auto-save (state changes)
```

---

## 🔄 State Management Flow

### 1. Timer States (State Machine)

**State 1: Idle (Goal Selection)**
- User selects fasting goal (14-48h)
- Drag handle to adjust hours
- Click levels to quick-select
- No timer running

**State 2: Running (Active Fast)**
- Timer is running (`isRunning = true`)
- Target time set (`targetTime = Date.now() + hours * TIME_MULTIPLIER`)
- Progress bar updates every second
- Can be cancelled or extended

**State 2b: Extended Mode** ⭐
- Activated when user reaches goal and clicks "Continue Fasting"
- `isExtended = true`
- `originalGoalTime` stores original target
- **CRITICAL:** `target_time` still shows ORIGINAL goal, NOT current time!
- Timer continues indefinitely (no new target)

**State 3: Completed (Summary)**
- Timer reached goal or stopped manually
- Shows completion summary
- "Time Since Last Fast" feature activates after 30s inactivity
- User can start new fast

---

### 2. Data Persistence

**Anonymous Users (localStorage):**
```javascript
{
  hours: 16,
  angle: 0,
  isRunning: false,
  targetTime: null
}
```

**Authenticated Users (Supabase `timer_states` table):**
```sql
user_id UUID PRIMARY KEY
hours REAL
angle REAL
is_running BOOLEAN
target_time TIMESTAMPTZ        -- ⚠️ ORIGINAL goal time (not updated in Extended Mode)
is_extended BOOLEAN            -- ⚠️ CRITICAL: Extended Mode flag
original_goal_time TIMESTAMPTZ -- Original goal (for Extended Mode display)
updated_at TIMESTAMPTZ
```

---

## ⚠️ Critical Features & Implementation Details

### Extended Mode (Multi-Day Fasting)

**How It Works:**
1. User starts 16h fast → `target_time = now + 16h`
2. Reaches 16h → Celebration + "Continue Fasting" button
3. User clicks "Continue Fasting" → `isExtended = true`
4. **`target_time` UNCHANGED** (still shows original 16h goal)
5. User continues to 18h, 24h, 48h+

**Why This Is Dangerous:**
```javascript
// ❌ NEVER DO THIS - Kills Extended Mode fasts!
if (data.is_running && targetTimeMs < Date.now()) {
  // This is TRUE for ALL Extended Mode fasts!
  // Extended fasts are DESIGNED to go past their target_time
  stopTimer(); // ❌ KILLS LEGITIMATE FASTS
}
```

**Lessons Learned (2025-11-27/28):**
- Ghost Timer Prevention killed Extended Fasts on page reload
- Ghost Timer Prevention killed Extended Fasts on iPad wake from sleep
- **Solution:** Completely disabled client-side Ghost Timer Prevention
- See: `docs/ghost-timer-cleanup-strategy.md`

---

### Multi-Device Sync

**4 Sync Mechanisms:**

**1. Initial Load (on page load):**
- `useTimerStorage.js` lines 50-170
- Fetches state from Supabase
- Calls `onStateLoaded()` to restore state
- ⚠️ Ghost Timer Prevention DISABLED (was killing Extended Fasts)

**2. Page Visibility API (wake from sleep):**
- `useTimerStorage.js` lines 172-282
- Fires when tab becomes visible (e.g., iPad wakes from sleep)
- Force refreshes state from database
- ⚠️ Ghost Timer Prevention DISABLED (was killing Extended Fasts on iPad wake)
- **Critical Fix (2025-11-28):** iPad users' Extended Fasts were killed on wake

**3. Real-time Sync (multi-device changes):**
- `useTimerStorage.js` lines 284-365
- Supabase Realtime subscription (`postgres_changes`)
- Listens for changes from other devices
- ⚠️ Expired timer check (lines 306-310) only IGNORES sync, doesn't kill timer (SAFE)

**4. Auto-save (state changes):**
- `useTimerStorage.js` lines 367-436
- Saves state to Supabase on every change
- Retry logic with exponential backoff (3 attempts: 1s, 2s, 4s)
- Skips initial load to prevent race conditions

---

### Time Since Last Fast (State 3 Feature)

**Purpose:** After completing a fast, show "Time since last fast ended" instead of "0h"

**Implementation:**
- State 3 (completion) → Wait 30s of inactivity
- If no user interaction → Show "Time Since Last Fast"
- If user drags handle → Show hours (active selection)
- 30s inactivity timer restarts on every interaction

**Files:**
- `Timer.jsx` lines 81-141 (inactivity timer logic)
- `useTimerStorage.js` lines 115-146 (load last completed fast)
- `TimerPage.jsx` (display logic)

---

## 🚨 Dangerous Areas (DO NOT TOUCH WITHOUT READING THIS)

### 1. `useTimerStorage.js` - Persistence & Sync

**Danger Level:** 🔴🔴🔴 EXTREME

**Why It's Fragile:**
- 4 different sync mechanisms (Initial Load, Visibility, Realtime, Auto-save)
- Race conditions between load and save
- Extended Mode breaks time-based assumptions
- Multi-device sync timing issues
- Ghost Timer Prevention was here (now disabled)

**What Was Broken (Recently):**
- Lines 87-113: Ghost Timer Prevention (DISABLED 2025-11-27)
- Lines 211-232: Ghost Timer Prevention on visibility (DISABLED 2025-11-28)

**What You MUST NOT DO:**
- ❌ Add `target_time < now` checks (kills Extended Fasts)
- ❌ Modify state during load (causes race conditions)
- ❌ Add cleanup logic to sync handlers
- ❌ Remove `loadingRef` concurrency guards

**What You CAN Do (Carefully):**
- ✅ Add logging for debugging
- ✅ Improve error handling
- ✅ Add retry logic (already has exponential backoff)

---

### 2. `useTimerState.js` - State Machine

**Danger Level:** 🔴🔴 HIGH

**Why It's Complex:**
- State machine with 3 states + Extended Mode
- Handles timer start, stop, cancel, extend
- Manages completion detection
- Writes to `fasts` table on completion
- Coordinates with storage hook

**Critical Functions:**
- `startTimer()` - Sets target time, starts interval
- `stopFasting()` - Saves to history, triggers State 3
- `continueFasting()` - Activates Extended Mode
- `cancelTimer()` - Resets without saving

**What You MUST NOT DO:**
- ❌ Change Extended Mode detection logic
- ❌ Modify completion calculation
- ❌ Remove `forceSyncToSupabase()` calls

---

### 3. Extended Mode Checks

**Danger Level:** 🔴🔴🔴 EXTREME

**Rule:** NEVER use `target_time < now` to detect expired timers!

**Why:**
```javascript
// Extended Mode Example:
// User starts 16h fast at 10:00
target_time = 10:00 + 16h = 02:00 (next day)

// User reaches goal at 02:00, enters Extended Mode
isExtended = true
target_time = 02:00 (UNCHANGED!)

// User continues to 18h (04:00 next day)
// Now: target_time (02:00) < now (04:00) → TRUE!
// But this is LEGITIMATE, not a ghost timer!
```

**Safe Alternative (If Needed in Future):**
```javascript
// Use updated_at instead of target_time
if (data.updated_at < NOW() - INTERVAL '7 days') {
  // Likely a ghost (no activity for 7 days)
}
```

---

## 🧪 Testing Checklist

Before deploying ANY timer-related changes, test these scenarios:

### Basic Timer Flow
- [ ] Start 16h fast → Timer runs
- [ ] Cancel timer → Resets to idle
- [ ] Complete 16h fast → Shows completion summary
- [ ] Page reload during fast → Timer continues

### Extended Mode
- [ ] Complete goal → "Continue Fasting" appears
- [ ] Click "Continue Fasting" → Extended Mode activates
- [ ] Extended timer shows correct elapsed time (18h, 24h, etc.)
- [ ] **Page reload during Extended Fast → Fast continues** ⚠️
- [ ] **iPad sleep/wake during Extended Fast → Fast continues** ⚠️

### Multi-Device Sync
- [ ] Start fast on Device A → Appears on Device B
- [ ] Stop fast on Device A → Updates on Device B
- [ ] Extended Mode on Device A → Shows on Device B
- [ ] Device A offline → Device B continues independently

### Edge Cases
- [ ] Anonymous user → localStorage works
- [ ] Authenticated user → Supabase sync works
- [ ] Network loss → Retry logic works
- [ ] Multiple tabs → Real-time sync works
- [ ] Fast history → "Time Since Last Fast" works

---

## 🛠️ Refactoring Guidelines

### Safe Refactoring Areas

**Low Risk (Go Ahead):**
- ✅ UI components (TimerPage.jsx, CircleTimer.jsx)
- ✅ Utility functions (timeCalculations.js)
- ✅ Constants (constants.js)
- ✅ CSS/Styling
- ✅ Non-timer pages (Learn, Community, etc.)

**Medium Risk (Test Thoroughly):**
- ⚠️ Drag handle logic (useDragHandle.js)
- ⚠️ Timer display logic
- ⚠️ Completion detection
- ⚠️ Fast history service

**High Risk (Avoid Unless Critical):**
- 🔴 useTimerStorage.js (sync logic)
- 🔴 useTimerState.js (state machine)
- 🔴 Extended Mode logic
- 🔴 Database queries (timer_states, fasts)

---

### When Refactoring Is Needed

**Good Reasons:**
- Critical bug fix
- Security vulnerability
- Performance issue affecting users
- New feature explicitly requested

**Bad Reasons:**
- "Code looks messy"
- "Could be more elegant"
- "I want to try a new pattern"
- "Too many comments"

**Refactoring Strategy:**

1. **Document Current Behavior:**
   - Write down EXACTLY what the code does now
   - Include edge cases, bugs, quirks
   - Save screenshots/logs of current behavior

2. **Write Tests (If Possible):**
   - Manual test checklist (see above)
   - Automated tests (if time permits)
   - Document test results BEFORE refactoring

3. **Small, Incremental Changes:**
   - One function at a time
   - Commit after each change
   - Test after each commit
   - Easy to rollback if something breaks

4. **Avoid "While I'm Here" Syndrome:**
   - Fix ONE thing at a time
   - Don't combine refactoring with new features
   - Don't "clean up" unrelated code

5. **Deploy Carefully:**
   - Test on all devices (Windows, Mac, iPad)
   - Test with Extended Mode
   - Monitor for 24h after deploy
   - Have rollback plan ready

---

## 📁 File Structure

### Core Timer Files

**Main Component:**
- `src/Timer.jsx` - Main container, navigation, state coordination

**Hooks:**
- `src/hooks/useTimerState.js` - Timer logic & state machine
- `src/hooks/useTimerStorage.js` - Persistence & sync (⚠️ FRAGILE)
- `src/hooks/useDragHandle.js` - Drag interaction

**UI Components:**
- `src/components/Timer/TimerPage.jsx` - Timer page layout
- `src/components/Timer/CircleTimer.jsx` - Circular timer UI
- `src/components/Timer/TimeDisplay.jsx` - Time formatting
- `src/components/Timer/CompletionSummary.jsx` - State 3 summary

**Services:**
- `src/services/fastsService.js` - Fast history CRUD
- `src/services/timerStateService.js` - Timer state helpers

**Config:**
- `src/config/constants.js` - Timer constants, levels, colors

**Utils:**
- `src/utils/timeCalculations.js` - Time formatting, progress calculations

---

## 🐛 Known Issues & Workarounds

### 1. Ghost Timer Prevention (DISABLED)

**Issue:** Client-side ghost timer detection kills Extended Mode fasts

**Status:** DISABLED (2025-11-27/28)

**Files Affected:**
- `useTimerStorage.js` lines 87-113 (initial load)
- `useTimerStorage.js` lines 211-232 (page visibility)

**Workaround:** Manual cleanup when user base > 100 users

**Documentation:** `docs/ghost-timer-cleanup-strategy.md`

---

### 2. Page Visibility API on iOS

**Issue:** Safari on iOS pauses JavaScript when app is backgrounded

**Behavior:**
- Timer continues running in database (target_time)
- UI freezes until app is foregrounded
- Page Visibility API refreshes state on wake

**Status:** WORKING AS INTENDED (after 2025-11-28 fix)

**Fix Applied:** Disabled Ghost Timer Prevention on visibility change

---

### 3. Multi-Tab Sync Delay

**Issue:** Real-time sync has ~1-2 second delay between tabs

**Cause:** Supabase Realtime latency

**Impact:** Minor - users rarely notice

**Status:** ACCEPTABLE (real-time sync is "nice to have", not critical)

---

## 📚 Related Documentation

- `docs/ghost-timer-cleanup-strategy.md` - Ghost timer cleanup decision & failed approaches
- `docs/session-guide.md` - Development progress & decisions
- `docs/conventions.md` - Code style & naming conventions
- `docs/progress.md` - Feature implementation progress

---

## 🚀 Deployment Notes

**Pre-Deploy Checklist:**
1. ✅ All tests pass (manual checklist above)
2. ✅ Extended Mode tested (page reload + iPad wake)
3. ✅ Multi-device sync tested
4. ✅ No console errors
5. ✅ Git commit with descriptive message
6. ✅ Push to main

**Post-Deploy Monitoring:**
1. Monitor for 24h
2. Check for user reports
3. Test on all devices
4. Verify Extended Mode fasts continue correctly

---

## 🆘 Emergency Rollback

If something breaks in production:

```bash
# 1. Find last working commit
git log --oneline

# 2. Revert to last working commit
git revert <commit-hash>

# 3. Push immediately
git push origin main

# 4. Investigate in separate branch
git checkout -b fix/timer-issue
```

**Critical Commits (Known Good):**
- `5452f3f` - Ghost Timer Prevention documentation (2025-11-28)
- `00abae3` - Disable Ghost Timer Prevention in Page Visibility (2025-11-28)
- `a7eafa6` - Disable Ghost Timer Prevention in initial load (2025-11-27)

---

## 💡 Future Improvements (Low Priority)

**Only Consider When:**
- User base > 100 users
- Current implementation is blocking new features
- Critical performance issue identified

**Potential Improvements:**
1. **Automated ghost timer cleanup** (server-side, not client-side)
2. **Offline-first architecture** (service worker + IndexedDB)
3. **Automated testing** (Playwright, Cypress)
4. **State machine visualization** (for debugging)
5. **Performance monitoring** (track sync latency)

**DO NOT:**
- Refactor for the sake of refactoring
- Add complexity without clear user benefit
- Touch working code unless absolutely necessary

---

## ✅ Summary

**Key Takeaways:**

1. **Timer architecture is complex but stable** (after recent fixes)
2. **Extended Mode is the most fragile part** (time-based checks break it)
3. **Multi-device sync works but is delicate** (4 sync mechanisms)
4. **Refactoring is risky** (test thoroughly, deploy carefully)
5. **Ghost Timer Prevention is disabled** (manual cleanup is sufficient)

**Golden Rule:**

> "If it ain't broke, don't fix it. If it is broke, fix ONLY that thing."

---

**Last Updated:** 2025-11-28
**Next Review:** When user base > 100 or major feature needed
**Maintainer:** Document updated after Extended Mode bug fixes
