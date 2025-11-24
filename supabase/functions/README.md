# Supabase Edge Functions

## cleanup-timers

**Purpose:** Automatically clean up "ghost timers" - timers that are marked as `is_running=true` but have an expired `target_time`.

**Schedule:** Runs every 5 minutes via Deno.cron

**How it works:**
1. Queries `timer_states` table for expired timers
2. Sets `is_running=false` and clears related fields
3. Logs cleaned user IDs for monitoring

---

## Deployment Instructions

### Prerequisites

1. Install Supabase CLI:
```bash
npm install -g supabase
```

2. Login to Supabase:
```bash
supabase login
```

3. Link to your project:
```bash
supabase link --project-ref kadskpttrlbdzywhxcdj
```

### Step 1: Deploy SQL Function

Run the SQL function in Supabase Dashboard > SQL Editor:

```bash
# Or use CLI
supabase db push
```

Paste contents of: `database/functions/cleanup_expired_timers.sql`

### Step 2: Deploy Edge Function

```bash
# From project root
cd supabase/functions

# Deploy function
supabase functions deploy cleanup-timers
```

### Step 3: Verify Deployment

**Check if cron is running:**
```bash
supabase functions list
```

**Manual test (trigger immediately):**
```bash
curl -X POST \
  https://kadskpttrlbdzywhxcdj.supabase.co/functions/v1/cleanup-timers \
  -H "Authorization: Bearer YOUR_ANON_KEY"
```

**Check logs:**
```bash
supabase functions logs cleanup-timers
```

Expected output every 5 minutes:
```
🕐 [CRON] Running cleanup-expired-timers...
✅ [CRON] Cleaned 2 expired timer(s)
   User IDs: uuid1, uuid2
```

Or if no expired timers:
```
🕐 [CRON] Running cleanup-expired-timers...
✓ [CRON] No expired timers found
```

---

## Testing Locally

```bash
# Start local Supabase
supabase start

# Run function locally
supabase functions serve cleanup-timers

# Test manual invocation
curl http://localhost:54321/functions/v1/cleanup-timers
```

---

## Monitoring

- **Frequency:** Every 5 minutes (*/5 * * * *)
- **Max delay:** 5 minutes until ghost timer is cleaned
- **Logging:** All cleanups are logged with user IDs

---

## Rollback

If you need to remove the edge function:

```bash
supabase functions delete cleanup-timers
```

To remove the SQL function, run in SQL Editor:
```sql
DROP FUNCTION IF EXISTS cleanup_expired_timers();
```
