-- Cleanup Duplicate Policies and Optimize All
-- Purpose: Remove duplicate policies and ensure all are optimized
-- Date: 2025-11-24

-- ===========================================
-- STEP 1: Show all current policies (for backup)
-- ===========================================
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  qual,
  with_check
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY tablename, cmd, policyname;

-- Copy this output as backup before proceeding!

-- ===========================================
-- STEP 2: Drop ALL existing policies
-- ===========================================

DO $$
DECLARE
  policy_record RECORD;
BEGIN
  FOR policy_record IN
    SELECT schemaname, tablename, policyname
    FROM pg_policies
    WHERE schemaname = 'public'
  LOOP
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );
    RAISE NOTICE 'Dropped policy: %.%', policy_record.tablename, policy_record.policyname;
  END LOOP;
END $$;

-- ===========================================
-- STEP 3: Recreate ALL policies (optimized)
-- ===========================================

-- TABLE: timer_states
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

-- TABLE: profiles
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

-- TABLE: fasts
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
-- STEP 4: Verification (improved detection)
-- ===========================================

SELECT
  tablename,
  policyname,
  cmd,
  qual,
  with_check,
  CASE
    -- Check if optimized (with SELECT wrapper - case insensitive, with or without AS clause)
    WHEN (qual ~* '\(select auth\.uid\(\).*\)' OR qual ~* '\(SELECT auth\.uid\(\).*\)')
      OR (with_check ~* '\(select auth\.uid\(\).*\)' OR with_check ~* '\(SELECT auth\.uid\(\).*\)')
    THEN '✅ Optimized'
    -- Check if not optimized (direct call without SELECT wrapper)
    WHEN (qual ~ '[^(]auth\.uid\(\)' OR with_check ~ '[^(]auth\.uid\(\)')
    THEN '⚠️ Not optimized'
    ELSE '✓ No auth check'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY
  CASE
    WHEN (qual ~ '[^(]auth\.uid\(\)' OR with_check ~ '[^(]auth\.uid\(\)')
    THEN 1  -- Not optimized first
    ELSE 2
  END,
  tablename,
  policyname;

-- ===========================================
-- STEP 5: Summary
-- ===========================================

SELECT
  COUNT(*) FILTER (WHERE
    (qual ~* '\(select auth\.uid\(\).*\)' OR qual ~* '\(SELECT auth\.uid\(\).*\)')
    OR (with_check ~* '\(select auth\.uid\(\).*\)' OR (with_check ~* '\(SELECT auth\.uid\(\).*\)')
  ) as optimized_policies,
  COUNT(*) FILTER (WHERE
    (qual ~ '[^(]auth\.uid\(\)' OR with_check ~ '[^(]auth\.uid\(\)')
  ) as not_optimized_policies,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';

-- Expected result: optimized_policies = 12, not_optimized_policies = 0
