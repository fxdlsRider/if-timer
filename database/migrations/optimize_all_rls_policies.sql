-- Optimize ALL RLS Policies across all tables
-- Purpose: Replace auth.uid() with (select auth.uid()) for better performance at scale
-- Date: 2025-11-24

-- ===========================================
-- TABLE: timer_states
-- ===========================================

DROP POLICY IF EXISTS "Users can view own timer state" ON timer_states;
DROP POLICY IF EXISTS "Users can insert own timer state" ON timer_states;
DROP POLICY IF EXISTS "Users can update own timer state" ON timer_states;
DROP POLICY IF EXISTS "Users can delete own timer state" ON timer_states;

CREATE POLICY "Users can view own timer state"
ON timer_states FOR SELECT
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own timer state"
ON timer_states FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own timer state"
ON timer_states FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own timer state"
ON timer_states FOR DELETE
USING ((select auth.uid()) = user_id);

-- ===========================================
-- TABLE: profiles
-- ===========================================

DROP POLICY IF EXISTS "Users can view own profile" ON profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON profiles;
DROP POLICY IF EXISTS "Users can delete own profile" ON profiles;

CREATE POLICY "Users can view own profile"
ON profiles FOR SELECT
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own profile"
ON profiles FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own profile"
ON profiles FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own profile"
ON profiles FOR DELETE
USING ((select auth.uid()) = user_id);

-- ===========================================
-- TABLE: fasts
-- ===========================================

DROP POLICY IF EXISTS "Users can view own fasts" ON fasts;
DROP POLICY IF EXISTS "Users can insert own fasts" ON fasts;
DROP POLICY IF EXISTS "Users can update own fasts" ON fasts;
DROP POLICY IF EXISTS "Users can delete own fasts" ON fasts;

CREATE POLICY "Users can view own fasts"
ON fasts FOR SELECT
USING ((select auth.uid()) = user_id);

CREATE POLICY "Users can insert own fasts"
ON fasts FOR INSERT
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can update own fasts"
ON fasts FOR UPDATE
USING ((select auth.uid()) = user_id)
WITH CHECK ((select auth.uid()) = user_id);

CREATE POLICY "Users can delete own fasts"
ON fasts FOR DELETE
USING ((select auth.uid()) = user_id);

-- ===========================================
-- VERIFICATION
-- ===========================================

-- List all optimized policies
SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual LIKE '%(SELECT auth.uid())%' OR with_check LIKE '%(SELECT auth.uid())%'
    THEN '✅ Optimized'
    WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
    THEN '⚠️ Not optimized'
    ELSE '❓ Unknown'
  END as optimization_status
FROM pg_policies
WHERE tablename IN ('timer_states', 'profiles', 'fasts')
ORDER BY tablename, policyname;
