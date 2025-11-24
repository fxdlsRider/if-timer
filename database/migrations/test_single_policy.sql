-- TEST: Optimize a SINGLE policy first (timer_states SELECT)
-- Purpose: Verify the optimization works before running on all policies
-- Safe to run - affects only 1 policy

-- ===========================================
-- BACKUP: Show current policy
-- ===========================================
SELECT
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE tablename = 'timer_states'
  AND policyname LIKE '%view%'
  AND cmd = 'SELECT';

-- Copy this output before proceeding!

-- ===========================================
-- TEST OPTIMIZATION
-- ===========================================

-- Drop existing policy
DROP POLICY IF EXISTS "Users can view own timer state" ON timer_states;

-- Recreate with optimized version
CREATE POLICY "Users can view own timer state"
ON timer_states
FOR SELECT
USING ((select auth.uid()) = user_id);

-- ===========================================
-- VERIFICATION
-- ===========================================

-- 1. Check policy was created correctly
SELECT
  tablename,
  policyname,
  cmd,
  qual,
  CASE
    WHEN qual LIKE '%(select auth.uid())%' OR qual LIKE '%(SELECT auth.uid())%'
    THEN '✅ Optimized'
    ELSE '⚠️ Not optimized'
  END as status
FROM pg_policies
WHERE tablename = 'timer_states'
  AND policyname LIKE '%view%'
  AND cmd = 'SELECT';

-- ===========================================
-- MANUAL TEST
-- ===========================================

-- After running this, test in your app:
-- 1. Refresh browser (http://localhost:3000)
-- 2. Check if timer data loads
-- 3. Check console for errors
-- 4. If everything works → proceed with full optimization
-- 5. If something breaks → run rollback below

-- ===========================================
-- ROLLBACK (if needed)
-- ===========================================

-- If the test fails, uncomment and run this:

-- DROP POLICY IF EXISTS "Users can view own timer state" ON timer_states;
--
-- CREATE POLICY "Users can view own timer state"
-- ON timer_states
-- FOR SELECT
-- USING (auth.uid() = user_id);  -- Back to old version
