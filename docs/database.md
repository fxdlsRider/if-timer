# IF Timer - Database Documentation

**Database:** Supabase (PostgreSQL)
**Last Updated:** 2025-10-29

---

## 📋 Table of Contents

1. [Overview](#overview)
2. [Current Schema](#current-schema)
3. [Planned Schema](#planned-schema)
4. [Setup Instructions](#setup-instructions)
5. [Migrations](#migrations)
6. [Security & RLS](#security--rls)

---

## 🗂️ Overview

The IF Timer uses **Supabase** (PostgreSQL) for:
- User authentication (Magic Link, passwordless)
- Timer state synchronization across devices
- Future: Fasting history and statistics

### Database Features
- ✅ Real-time subscriptions (timer sync)
- ✅ Row Level Security (RLS)
- ✅ Magic Link authentication
- ⏳ Fasting session history (planned)
- ⏳ Statistics & analytics (planned)

---

## 📊 Current Schema

### `timer_states` (Implemented ✅)

Stores the current timer state for each user. One row per user.

**Columns:**

| Column | Type | Nullable | Default | Description |
|--------|------|----------|---------|-------------|
| `user_id` | `uuid` | No | - | User ID (references auth.users), PRIMARY KEY |
| `hours` | `integer` | No | 16 | Timer duration (14-48) |
| `angle` | `decimal` | No | 21.2 | Circle handle angle for UI (0-360) |
| `is_running` | `boolean` | No | false | Timer running status |
| `target_time` | `timestamptz` | Yes | null | Target completion time (UTC) |
| `is_extended` | `boolean` | No | false | Extended mode (fasting beyond goal) |
| `original_goal_time` | `timestamptz` | Yes | null | Original goal time (for extended mode) |
| `created_at` | `timestamptz` | No | now() | Row creation timestamp |
| `updated_at` | `timestamptz` | No | now() | Last update timestamp |

**SQL Schema:**

```sql
CREATE TABLE timer_states (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hours INTEGER NOT NULL DEFAULT 16 CHECK (hours >= 14 AND hours <= 48),
  angle DECIMAL(5,2) NOT NULL DEFAULT 21.2 CHECK (angle >= 0 AND angle < 360),
  is_running BOOLEAN NOT NULL DEFAULT false,
  target_time TIMESTAMPTZ,
  is_extended BOOLEAN NOT NULL DEFAULT false,
  original_goal_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Update timestamp automatically
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timer_states_updated_at
  BEFORE UPDATE ON timer_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Index for faster lookups
CREATE INDEX idx_timer_states_user_id ON timer_states(user_id);
CREATE INDEX idx_timer_states_is_running ON timer_states(is_running);
```

**Usage in Code:**

```javascript
// Load state
const { data } = await supabase
  .from('timer_states')
  .select('*')
  .eq('user_id', user.id)
  .single();

// Save/Update state (upsert)
await supabase
  .from('timer_states')
  .upsert({
    user_id: user.id,
    hours,
    angle,
    is_running,
    target_time: targetTime ? new Date(targetTime).toISOString() : null,
    is_extended,
    original_goal_time: originalGoalTime ? new Date(originalGoalTime).toISOString() : null
  }, {
    onConflict: 'user_id'
  });

// Realtime subscription
supabase
  .channel('timer_changes')
  .on('postgres_changes', {
    event: '*',
    schema: 'public',
    table: 'timer_states',
    filter: `user_id=eq.${user.id}`
  }, (payload) => {
    // Handle changes
  })
  .subscribe();
```

**Notes:**
- One row per user (enforced by PRIMARY KEY)
- `upsert` with `onConflict: 'user_id'` for insert or update
- Real-time updates propagate to all connected devices

---

## 📊 Fasting Sessions

### `fasts` (✅ Implemented)

Stores completed fasting sessions for history and statistics.

**Columns:**

| Column | Type | Nullable | Description |
|--------|------|----------|-------------|
| `id` | `uuid` | No | Primary key (auto-generated) |
| `user_id` | `uuid` | No | User ID (foreign key to auth.users) |
| `start_time` | `timestamptz` | No | Fast start time |
| `end_time` | `timestamptz` | No | Fast end time |
| `original_goal` | `integer` | No | Planned duration (hours or seconds depending on unit) |
| `duration` | `numeric(10,1)` | No | Actual duration fasted |
| `cancelled` | `boolean` | Yes | Whether fast was cancelled early (default: false) |
| `unit` | `varchar(10)` | Yes | Time unit: 'hours' or 'seconds' (default: 'hours') |
| `created_at` | `timestamptz` | Yes | Row creation timestamp (default: now()) |

**SQL Schema:**

```sql
CREATE TABLE public.fasts (
  id UUID NOT NULL DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  duration NUMERIC(10, 1) NOT NULL,
  original_goal INTEGER NOT NULL,
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  cancelled BOOLEAN NULL DEFAULT false,
  unit VARCHAR(10) NULL DEFAULT 'hours',
  created_at TIMESTAMPTZ NULL DEFAULT now(),

  CONSTRAINT fasts_pkey PRIMARY KEY (id),
  CONSTRAINT unique_user_fast UNIQUE (user_id, start_time, duration),
  CONSTRAINT fasts_user_id_fkey FOREIGN KEY (user_id)
    REFERENCES auth.users (id) ON DELETE CASCADE
);

-- Indexes
CREATE INDEX IF NOT EXISTS fasts_user_id_idx ON public.fasts USING btree (user_id);
CREATE INDEX IF NOT EXISTS fasts_end_time_idx ON public.fasts USING btree (end_time DESC);

-- RLS Policies
ALTER TABLE fasts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fasts"
  ON fasts FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own fasts"
  ON fasts FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own fasts"
  ON fasts FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own fasts"
  ON fasts FOR DELETE
  USING (auth.uid() = user_id);
```

**Example Queries:**

```sql
-- User's fasting history
SELECT * FROM fasts
WHERE user_id = 'xxx'
ORDER BY end_time DESC
LIMIT 50;

-- Statistics
SELECT
  COUNT(*) as total_fasts,
  AVG(CASE WHEN unit = 'seconds' THEN duration / 3600 ELSE duration END) as avg_hours,
  MAX(CASE WHEN unit = 'seconds' THEN duration / 3600 ELSE duration END) as longest_fast,
  SUM(CASE WHEN unit = 'seconds' THEN duration / 3600 ELSE duration END) as total_hours
FROM fasts
WHERE user_id = 'xxx' AND cancelled = false;

-- Current week stats
SELECT
  date_trunc('week', start_time) as week,
  COUNT(*) as fasts_this_week
FROM fasting_sessions
WHERE user_id = 'xxx'
  AND start_time >= date_trunc('week', CURRENT_TIMESTAMP)
GROUP BY week;
```

**TODO Items in Code:**
- `IFTimerFinal.jsx:460` - Save to fasting_sessions when stopping
- `IFTimerFinal.jsx:471` - Save to fasting_sessions when starting new fast

---

## 🔧 Setup Instructions

### 1. Create Supabase Project

1. Go to [supabase.com](https://supabase.com)
2. Sign up / Sign in
3. Click "New Project"
4. Fill in:
   - **Name:** `if-timer` (or your choice)
   - **Database Password:** (save this securely!)
   - **Region:** Choose closest to users
   - **Pricing Plan:** Free tier is fine for development

### 2. Get API Credentials

After project creation:

1. Go to **Project Settings** → **API**
2. Copy these values:
   - `Project URL` → Your `REACT_APP_SUPABASE_URL`
   - `anon public` key → Your `REACT_APP_SUPABASE_ANON_KEY`

### 3. Create Tables

Go to **SQL Editor** in Supabase Dashboard and run:

```sql
-- 1. Create timer_states table
CREATE TABLE timer_states (
  user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  hours INTEGER NOT NULL DEFAULT 16 CHECK (hours >= 14 AND hours <= 48),
  angle DECIMAL(5,2) NOT NULL DEFAULT 21.2 CHECK (angle >= 0 AND angle < 360),
  is_running BOOLEAN NOT NULL DEFAULT false,
  target_time TIMESTAMPTZ,
  is_extended BOOLEAN NOT NULL DEFAULT false,
  original_goal_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- 2. Create update trigger
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER update_timer_states_updated_at
  BEFORE UPDATE ON timer_states
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- 3. Create indexes
CREATE INDEX idx_timer_states_user_id ON timer_states(user_id);
CREATE INDEX idx_timer_states_is_running ON timer_states(is_running);

-- 4. Enable Row Level Security
ALTER TABLE timer_states ENABLE ROW LEVEL SECURITY;

-- 5. Create RLS policies (see next section)
```

### 4. Configure Authentication

1. Go to **Authentication** → **Providers**
2. Enable **Email** provider
3. Configure email templates (optional):
   - **Magic Link** template (already configured by default)
   - Customize sender name, email content

4. Go to **Authentication** → **URL Configuration**
   - Set **Site URL:** `http://localhost:3000` (dev) or `https://your-domain.com` (prod)
   - Set **Redirect URLs:** Add all valid redirect URLs

### 5. Set Environment Variables

Create `.env` file in your project root:

```env
REACT_APP_SUPABASE_URL=https://xxxxx.supabase.co
REACT_APP_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
```

**Important:** Add `.env` to `.gitignore` (already done in this project)

---

## 🔒 Security & RLS

### Row Level Security (RLS) Policies

**Principle:** Users can only access their own data.

```sql
-- Enable RLS
ALTER TABLE timer_states ENABLE ROW LEVEL SECURITY;

-- Policy: Users can SELECT their own row
CREATE POLICY "Users can view their own timer state"
  ON timer_states
  FOR SELECT
  USING (auth.uid() = user_id);

-- Policy: Users can INSERT their own row
CREATE POLICY "Users can insert their own timer state"
  ON timer_states
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can UPDATE their own row
CREATE POLICY "Users can update their own timer state"
  ON timer_states
  FOR UPDATE
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can DELETE their own row
CREATE POLICY "Users can delete their own timer state"
  ON timer_states
  FOR DELETE
  USING (auth.uid() = user_id);
```

### Testing RLS Policies

```sql
-- Test as specific user (in Supabase SQL Editor)
SET request.jwt.claim.sub = 'user-uuid-here';

-- Should return only that user's row
SELECT * FROM timer_states;
```

### For `fasting_sessions` (when implemented):

```sql
ALTER TABLE fasting_sessions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own fasting sessions"
  ON fasting_sessions FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own fasting sessions"
  ON fasting_sessions FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own fasting sessions"
  ON fasting_sessions FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own fasting sessions"
  ON fasting_sessions FOR DELETE
  USING (auth.uid() = user_id);
```

---

## 📈 Migrations

### Migration Strategy

For future schema changes, use Supabase migrations:

```bash
# Install Supabase CLI
npm install -g supabase

# Initialize (if not already done)
supabase init

# Create new migration
supabase migration new add_fasting_sessions

# Edit migration file in supabase/migrations/
# Then apply
supabase db push
```

### Migration History

| Date | Migration | Description |
|------|-----------|-------------|
| 2025-10-XX | `001_initial_schema` | Created timer_states table |
| TBD | `002_add_fasting_sessions` | Add fasting_sessions table |
| TBD | `003_add_statistics_views` | Add materialized views for stats |

---

## 🔍 Useful Queries

### Debug Queries

```sql
-- Check all timer states
SELECT
  user_id,
  hours,
  is_running,
  target_time,
  is_extended,
  updated_at
FROM timer_states
ORDER BY updated_at DESC;

-- Find active timers
SELECT * FROM timer_states WHERE is_running = true;

-- Count users
SELECT COUNT(DISTINCT user_id) FROM timer_states;
```

### Monitoring

```sql
-- Database size
SELECT pg_size_pretty(pg_database_size(current_database()));

-- Table sizes
SELECT
  schemaname,
  tablename,
  pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) as size
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

---

## 🐛 Troubleshooting

### Common Issues

**1. "Missing Supabase environment variables"**
- Check `.env` file exists and has correct keys
- Restart dev server after changing `.env`

**2. "Permission denied for table timer_states"**
- Check RLS policies are created
- Verify user is authenticated (`auth.uid()` is set)

**3. "PGRST116: Could not find table"**
- Table doesn't exist or user has no access
- Check table was created in correct schema (public)

**4. Real-time not working**
- Check Realtime is enabled for table (Supabase Dashboard → Database → Replication)
- Verify subscription filter is correct

**5. Upsert not working**
- Ensure `onConflict` matches the PRIMARY KEY or UNIQUE constraint
- Current: `onConflict: 'user_id'`

---

## 📚 Resources

- [Supabase Documentation](https://supabase.com/docs)
- [Supabase Row Level Security](https://supabase.com/docs/guides/auth/row-level-security)
- [Supabase Realtime](https://supabase.com/docs/guides/realtime)
- [PostgreSQL Documentation](https://www.postgresql.org/docs/)

---

## 🔄 Future Enhancements

- [ ] Add `fasting_sessions` table
- [ ] Create materialized views for statistics
- [ ] Add indexes for performance
- [ ] Set up automated backups
- [ ] Create database seeding scripts for development
- [ ] Add database tests (pg_tap)
- [ ] Monitor query performance
- [ ] Set up alerts for failed queries

---

**Last Updated:** 2025-10-29
**Status:** `timer_states` implemented ✅ | `fasting_sessions` planned ⏳
