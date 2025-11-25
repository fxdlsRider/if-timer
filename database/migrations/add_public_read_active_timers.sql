-- Migration: Add public read access for active timers
-- Date: 2025-11-25
-- Purpose: Allow non-logged-in users to view Community Page (active fasters)

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view active timers" ON timer_states;

-- Create new policy: Public read access for active timers only
CREATE POLICY "Anyone can view active timers"
ON timer_states
FOR SELECT
USING (is_running = true);

-- Verify policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'timer_states'
  AND policyname = 'Anyone can view active timers';
