# Ghost Timer Cleanup Strategy

**Status:** To be decided when user base grows (>100 users)
**Priority:** Low (currently ~3 users)
**Date:** 2025-11-27 (created) / 2025-11-28 (updated with failed approach)

---

## 🎯 Problem Statement

**What are Ghost Timers?**
- Timer stuck with `is_running = true` even though user stopped/closed app
- Caused by: Network issues, browser crashes, tab force-closed, etc.
- Result: Database shows timer running forever

**Current Mitigation (3 Layers):**
1. ✅ **Page Visibility API** - Force refresh on tab visible
2. ✅ **Retry Logic** - Cache-busting retry on load failure
3. ❌ **Background Cleanup** - NOT YET IMPLEMENTED (this decision)

---

## ⚠️ Critical Consideration: Extended Mode

**The App Allows Unlimited Fasting via Extended Mode:**

```javascript
User starts 24h fast
→ Reaches 24h (goal complete)
→ Extended Mode activates (is_extended = true)
→ User continues fasting: 48h, 72h, 96h+
```

**This means:**
- A timer CAN legitimately run for 48h, 72h, or even longer
- Simple "running > 48h = ghost timer" logic would **kill real fasts** ❌

---

## ❌ Failed Approach: Client-Side Ghost Timer Prevention

**Date:** 2025-11-27 to 2025-11-28
**Status:** FAILED - Completely disabled
**Reason:** Fundamentally incompatible with Extended Mode

### What We Tried

**Attempt 1: Basic Expiration Check**
```javascript
// useTimerStorage.js - Initial Load & Page Visibility
if (data.is_running && targetTimeMs && targetTimeMs < Date.now()) {
  // Clean up expired timer
  await forceSyncToSupabase(user, {
    isRunning: false,
    targetTime: null,
    isExtended: false,
    originalGoalTime: null
  });
}
```

**Problem:** Killed Extended Mode fasts on every page reload.

---

**Attempt 2: Exclude Extended Mode**
```javascript
if (data.is_running && targetTimeMs && targetTimeMs < Date.now() && !data.is_extended) {
  // Only clean non-extended timers
}
```

**Problem:** Still killed Extended Mode fasts (race condition or timing issue).

---

**Attempt 3: Complete Disablement**
```javascript
/* DISABLED - DO NOT RE-ENABLE WITHOUT THOROUGH TESTING
if (data.is_running && targetTimeMs && targetTimeMs < Date.now()) {
  // Cleanup code
}
*/
```

**Result:** ✅ Extended Mode fasts now survive page reloads and iPad sleep/wake cycles.

---

### Why It Failed

**Fundamental Design Conflict:**

1. **Extended Mode stores ORIGINAL goal time as `target_time`**
   - User sets 16h fast → `target_time = now + 16h`
   - User reaches 16h → Extended Mode activates (`is_extended = true`)
   - User continues to 18h, 24h, 48h+
   - **BUT `target_time` still shows 16h (original goal)!**

2. **Ghost Timer Prevention logic:**
   ```javascript
   if (target_time < now) {
     // This is true for ALL Extended Mode fasts!
     // Extended fasts are DESIGNED to go past their target_time
   }
   ```

3. **Result:**
   - Ghost Timer Prevention sees Extended Fast as "expired"
   - Kills legitimate Extended Mode fasts
   - User loses multi-day fasting progress

---

### Critical Bug: iPad Sleep/Wake Cycle

**Trigger:** Page Visibility API fires when iPad wakes from sleep

**Location:** `useTimerStorage.js` lines 211-232 (Page Visibility handler)

**What Happened:**
1. User starts 16h fast, enters Extended Mode at 18h
2. iPad goes to sleep (WiFi still connected, music playing)
3. iPad wakes up → `visibilitychange` event fires
4. Ghost Timer Prevention runs: `target_time (16h) < now (18h)` → TRUE
5. Extended Fast gets killed

**Initial Discovery:**
- User thought GitHub Actions cleanup script was killing the fast
- Actually: Client-side Page Visibility handler was the culprit
- Same bug existed in TWO places:
  - Initial page load (lines 87-113) - Fixed first
  - Page Visibility handler (lines 211-232) - Fixed second

---

### Lessons Learned

1. **Don't mix cleanup logic with state restoration:**
   - State loading should NEVER modify data
   - Cleanup should be separate, manual, server-side process

2. **Extended Mode breaks time-based assumptions:**
   - Can't use `target_time < now` to detect ghost timers
   - Extended fasts are DESIGNED to exceed their goal time
   - Any expiration check will false-positive on Extended Mode

3. **Client-side cleanup is dangerous:**
   - Race conditions on page load
   - Triggers on legitimate events (sleep/wake, tab switching)
   - No way to distinguish ghost timer from Extended Fast

4. **Manual cleanup is sufficient at small scale:**
   - With ~3 users, manual SQL cleanup works fine
   - 3-layer prevention (Visibility API, Retry, Real-time sync) handles 99% of cases
   - Ghost timers are rare, not worth risking Extended Fast kills

---

### Current Implementation (Stable)

**Ghost Timer Prevention: COMPLETELY DISABLED**

**Code Locations:**
- `useTimerStorage.js` lines 87-113 (Initial load)
- `useTimerStorage.js` lines 211-232 (Page Visibility)

**Both blocks commented out with:**
```javascript
// GHOST TIMER PREVENTION: DISABLED
// Reason: Was killing Extended Mode fasts on reload/wake (critical bug)
// Manual cleanup is sufficient for current user count
// See: docs/ghost-timer-cleanup-strategy.md
// TODO: Re-enable when properly fixed and tested at scale (100+ users)
```

**Real-time sync still has check (lines 306-310):**
```javascript
// Don't sync expired timers from other devices (but don't force cleanup)
if (data.is_running && targetTimeMs && targetTimeMs < Date.now()) {
  console.warn('⚠️ Expired timer detected in real-time sync - ignoring');
  return; // Don't sync, but don't kill the timer either
}
```
This is SAFE because it only ignores the sync, doesn't force cleanup.

---

### If Re-Implementing (Future)

**Requirements for safe client-side ghost detection:**

1. **Use `updated_at` timestamp instead of `target_time`:**
   ```javascript
   // Safe: Check when state was last updated
   if (data.updated_at < NOW() - INTERVAL '7 days') {
     // Likely a ghost (no activity for 7 days)
   }
   ```

2. **Never clean on page load/visibility:**
   - Only log potential ghosts
   - Let server-side cleanup handle it

3. **Add explicit "ghost timer" flag:**
   ```sql
   ALTER TABLE timer_states ADD COLUMN is_ghost BOOLEAN DEFAULT false;
   ```
   - Mark suspected ghosts, don't auto-kill
   - Manual review before deletion

4. **Thorough testing with Extended Mode:**
   - Test 48h+ fasts
   - Test sleep/wake cycles
   - Test multi-device scenarios
   - Test at scale (100+ users)

---

## 🔀 Solution Options

### **Option 1: Exclude Extended Mode (Safe)**

**Logic:**
```sql
Clean timers that are:
- running = true
- is_extended = false (NOT in extended mode)
- target_time > 48h ago
```

**Pros:**
- ✅ Never kills legitimate extended fasts
- ✅ Safe for users doing multi-day fasts
- ✅ 48h is reasonable threshold for non-extended

**Cons:**
- ⚠️ Extended ghost timers won't be cleaned
- ⚠️ If user starts extended fast then crashes → ghost timer survives

**SQL:**
```sql
UPDATE timer_states
SET
  is_running = false,
  target_time = NULL,
  updated_at = NOW()
WHERE
  is_running = true
  AND is_extended = false
  AND target_time < NOW() - INTERVAL '48 hours';
```

---

### **Option 2: High Threshold (Very Safe)**

**Logic:**
```sql
Clean ALL timers (including extended) that are:
- running = true
- target_time > 14 days ago
```

**Rationale:**
- Medical consensus: Fasting >7 days requires medical supervision
- 14 days is EXTREMELY safe buffer
- No user should fast this long via app

**Pros:**
- ✅ Cleans both regular AND extended ghost timers
- ✅ Extremely safe (no false positives)
- ✅ Simple logic (no is_extended check needed)

**Cons:**
- ⚠️ Ghost timers survive for 14 days before cleanup
- ⚠️ Might miss some edge cases (but unlikely with 3 layers of prevention)

**SQL:**
```sql
UPDATE timer_states
SET
  is_running = false,
  target_time = NULL,
  is_extended = false,
  updated_at = NOW()
WHERE
  is_running = true
  AND target_time < NOW() - INTERVAL '14 days';
```

---

### **Option 3: Tiered Approach (Sophisticated)**

**Logic:**
```sql
Clean timers based on mode:
- Non-extended: > 48h (stuck after normal fast)
- Extended: > 7 days (stuck in extended mode)
```

**Pros:**
- ✅ Best of both worlds
- ✅ Cleans regular ghosts quickly (48h)
- ✅ Cleans extended ghosts safely (7 days)

**Cons:**
- ⚠️ More complex query
- ⚠️ Harder to reason about

**SQL:**
```sql
UPDATE timer_states
SET
  is_running = false,
  target_time = NULL,
  is_extended = false,
  updated_at = NOW()
WHERE
  is_running = true
  AND (
    -- Regular timers stuck > 48h
    (is_extended = false AND target_time < NOW() - INTERVAL '48 hours')
    OR
    -- Extended timers stuck > 7 days
    (is_extended = true AND target_time < NOW() - INTERVAL '7 days')
  );
```

---

## 🎯 Recommendation

**For Current Scale (< 10 users):**
→ **Manual cleanup only** (no automation needed)

**When Scaling (100+ users):**
→ **Option 2: High Threshold (14 days)**

**Why Option 2?**
1. ✅ Simple logic (easy to understand & maintain)
2. ✅ Zero risk of killing legitimate fasts
3. ✅ 3-layer prevention already catches 99% of ghost timers early
4. ✅ 14-day cleanup is just a final safety net
5. ✅ Medical consensus: nobody should fast 14+ days unsupervised

---

## 🔧 Implementation When Ready

### **Manual Cleanup (Now):**
```sql
-- 1. Check for ghost timers
SELECT
  user_id,
  is_running,
  is_extended,
  target_time,
  NOW() - target_time AS stuck_for
FROM timer_states
WHERE
  is_running = true
  AND target_time < NOW() - INTERVAL '14 days'
ORDER BY target_time ASC;

-- 2. Clean if any found
UPDATE timer_states
SET
  is_running = false,
  target_time = NULL,
  is_extended = false,
  updated_at = NOW()
WHERE
  is_running = true
  AND target_time < NOW() - INTERVAL '14 days'
RETURNING user_id, target_time;
```

### **Automated Cleanup (Later):**

**When user count > 100:**

1. **Create SQL Function:**
```sql
CREATE OR REPLACE FUNCTION cleanup_ghost_timers()
RETURNS TABLE(cleaned_count bigint) AS $$
DECLARE
  affected_rows bigint;
BEGIN
  UPDATE timer_states
  SET
    is_running = false,
    target_time = NULL,
    is_extended = false,
    updated_at = NOW()
  WHERE
    is_running = true
    AND target_time < NOW() - INTERVAL '14 days';

  GET DIAGNOSTICS affected_rows = ROW_COUNT;
  RETURN QUERY SELECT affected_rows;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
```

2. **GitHub Actions Cron:**
   - Create `.github/workflows/cleanup-ghost-timers.yml`
   - Run daily at 3 AM UTC
   - Call Supabase RPC endpoint
   - Free on GitHub (2000 min/month)

3. **Alternative: Supabase Edge Function**
   - If pg_cron becomes available on plan upgrade
   - Or if prefer serverless approach

---

## 📊 Monitoring (When Automated)

**Track cleanup effectiveness:**
```sql
-- Add to cleanup function
INSERT INTO ghost_timer_logs (cleaned_count, timestamp)
VALUES (affected_rows, NOW());

-- Query cleanup history
SELECT
  DATE(timestamp) as date,
  SUM(cleaned_count) as total_cleaned
FROM ghost_timer_logs
GROUP BY DATE(timestamp)
ORDER BY date DESC
LIMIT 30;
```

---

## ✅ Action Items

- [ ] **Now:** Keep manual cleanup script bookmarked
- [ ] **At 100 users:** Decide between Option 1, 2, or 3
- [ ] **At 100 users:** Implement automated cleanup
- [ ] **At 500 users:** Add monitoring/logging
- [ ] **At 1000 users:** Consider real-time ghost detection

---

**Last Updated:** 2025-11-28
**Revisit When:** User count > 100
**Current Status:** Manual cleanup sufficient (client-side prevention DISABLED)
