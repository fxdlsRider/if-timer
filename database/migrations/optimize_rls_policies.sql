-- Optimize RLS Policies for timer_states table
-- Purpose: Replace auth.uid() with (select auth.uid()) for better performance
-- Issue: auth.uid() is re-evaluated for each row, causing suboptimal performance at scale
-- Fix: (select auth.uid()) is evaluated once per query

-- Drop existing policies (if they exist)
DROP POLICY IF EXISTS "Users can view own timer state" ON timer_states;
DROP POLICY IF EXISTS "Users can insert own timer state" ON timer_states;
DROP POLICY IF EXISTS "Users can update own timer state" ON timer_states;
DROP POLICY IF EXISTS "Users can delete own timer state" ON timer_states;

-- Recreate policies with optimized auth check

-- SELECT Policy
CREATE POLICY "Users can view own timer state"
ON timer_states
FOR SELECT
USING ((select auth.uid()) = user_id);

-- INSERT Policy
CREATE POLICY "Users can insert own timer state"
ON timer_states
FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

-- UPDATE Policy
CREATE POLICY "Users can update own timer state"
ON timer_states
FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

-- DELETE Policy
CREATE POLICY "Users can delete own timer state"
ON timer_states
FOR DELETE
USING ((select auth.uid()) = user_id);

-- Verify policies are created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  cmd
FROM pg_policies
WHERE tablename = 'timer_states'
ORDER BY policyname;
