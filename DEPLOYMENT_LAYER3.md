# Layer 3 Deployment Guide: Server-side Cleanup

## Overview

This guide explains how to deploy the server-side cleanup function that automatically removes "ghost timers" from the database.

---

## Step 1: Deploy SQL Function to Supabase

1. **Open Supabase Dashboard**
   - Go to: https://supabase.com/dashboard/project/kadskpttrlbdzywhxcdj
   - Navigate to: **SQL Editor**

2. **Create New Query**
   - Click "New Query"
   - Copy the contents of: `database/functions/cleanup_expired_timers.sql`
   - Paste into the editor

3. **Run the SQL**
   - Click "Run" or press `Cmd/Ctrl + Enter`
   - You should see: "Success. No rows returned"

4. **Verify Function Created**
   - In SQL Editor, run:
   ```sql
   SELECT routine_name, routine_type
   FROM information_schema.routines
   WHERE routine_name = 'cleanup_expired_timers';
   ```
   - Should return 1 row: `cleanup_expired_timers | FUNCTION`

---

## Step 2: Test the SQL Function

Run the test script to verify it works:

```bash
node test-cleanup-function.js
```

**Expected output:**
```
========================================
  TESTING CLEANUP FUNCTION (Layer 3)
========================================

STEP 1: Checking active timers BEFORE cleanup...

Found 2 active timer(s):

1. User ID: 554840be-1d29-441b-9e4f-e7a3255b8981
   Hours: 14h
   Target Time: 2025-11-23T10:44:43.002+00:00
   Status: 🔴 EXPIRED (should be cleaned)
   Expired 1920 minutes ago

2. User ID: 992658be-0103-4e19-a051-7f99a24308d8
   Hours: 18h
   Target Time: 2025-11-25T09:47:23.672+00:00
   Status: 🟢 Active (OK)


STEP 2: Calling cleanup_expired_timers()...

✅ Cleanup function executed successfully!

Cleaned: 1 timer(s)
User IDs cleaned:
  1. 554840be-1d29-441b-9e4f-e7a3255b8981


STEP 3: Checking active timers AFTER cleanup...

Found 1 active timer(s):

1. User ID: 992658be-0103-4e19-a051-7f99a24308d8
   Hours: 18h
   Target Time: 2025-11-25T09:47:23.672+00:00
   Status: 🟢 Active (OK)

========================================
  SUMMARY
========================================

Before: 2 active timers
After:  1 active timers
Change: 1 timer(s) cleaned
```

If you get **404 Error**, the SQL function wasn't created yet (go back to Step 1).

---

## Step 3: Deploy Edge Function (Cron Job)

The edge function runs the cleanup automatically every 5 minutes.

### Option A: Using Supabase CLI (Recommended)

1. **Install Supabase CLI** (if not installed):
```bash
npm install -g supabase
```

2. **Login to Supabase**:
```bash
supabase login
```

3. **Link to Project**:
```bash
supabase link --project-ref kadskpttrlbdzywhxcdj
```

4. **Deploy Edge Function**:
```bash
supabase functions deploy cleanup-timers
```

5. **Verify Deployment**:
```bash
supabase functions list
```

Should show: `cleanup-timers | Deployed`

6. **Check Logs** (after 5 minutes):
```bash
supabase functions logs cleanup-timers
```

Expected output every 5 minutes:
```
🕐 [CRON] Running cleanup-expired-timers...
✅ [CRON] Cleaned 2 expired timer(s)
   User IDs: uuid1, uuid2
```

Or:
```
🕐 [CRON] Running cleanup-expired-timers...
✓ [CRON] No expired timers found
```

### Option B: Manual Test (Without Cron)

If you can't deploy edge functions yet, you can manually run the cleanup:

**Via SQL Editor (Supabase Dashboard):**
```sql
SELECT * FROM cleanup_expired_timers();
```

**Via Node Script:**
```bash
node test-cleanup-function.js
```

**Via curl:**
```bash
curl -X POST \
  https://kadskpttrlbdzywhxcdj.supabase.co/rest/v1/rpc/cleanup_expired_timers \
  -H "apikey: YOUR_ANON_KEY" \
  -H "Content-Type: application/json"
```

---

## Step 4: Monitor

### Check Active Timers

```bash
node check-active-fasters.js
```

### Manual Cleanup (if needed)

```bash
node test-cleanup-function.js
```

---

## Troubleshooting

### Error: "Function not found" (404)

**Cause:** SQL function wasn't created yet

**Fix:** Run SQL from `database/functions/cleanup_expired_timers.sql` in Supabase Dashboard

### Error: "Permission denied"

**Cause:** RLS policies or insufficient permissions

**Fix:** The function has `SECURITY DEFINER` which bypasses RLS. Check if function was created correctly.

### Edge Function Not Running

**Cause:** Edge function not deployed or Deno.cron not supported

**Fix:**
1. Check deployment: `supabase functions list`
2. Check logs: `supabase functions logs cleanup-timers`
3. Manual fallback: Run test script periodically

---

## Rollback

If you need to remove everything:

**Remove Edge Function:**
```bash
supabase functions delete cleanup-timers
```

**Remove SQL Function:**
```sql
DROP FUNCTION IF EXISTS cleanup_expired_timers();
```

---

## Summary

✅ **Layer 1:** forceSync() in stopFasting() and cancelTimer() - **Active immediately**
✅ **Layer 2:** Retry logic with exponential backoff - **Active immediately**
✅ **Layer 3:** Server-side cleanup - **Requires Supabase deployment** (see above)

**Recommendation:** Deploy Layer 3 as soon as possible for maximum reliability!
