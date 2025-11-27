# Ghost Timer Cleanup Strategy

**Status:** To be decided when user base grows (>100 users)
**Priority:** Low (currently ~3 users)
**Date:** 2025-11-27

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

**Last Updated:** 2025-11-27
**Revisit When:** User count > 100
**Current Status:** Manual cleanup sufficient
