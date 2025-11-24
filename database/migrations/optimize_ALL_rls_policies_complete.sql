-- Optimize ALL RLS Policies Across ENTIRE Database
-- Purpose: Replace auth.uid() with (select auth.uid()) in all RLS policies
-- Date: 2025-11-24
-- This will fix ALL 41+ warnings at once

-- ===========================================
-- STEP 1: Generate and execute policy updates
-- ===========================================

DO $$
DECLARE
  policy_record RECORD;
  new_qual TEXT;
  new_with_check TEXT;
BEGIN
  -- Loop through all policies that use auth.uid()
  FOR policy_record IN
    SELECT
      schemaname,
      tablename,
      policyname,
      permissive,
      roles,
      cmd,
      qual,
      with_check
    FROM pg_policies
    WHERE
      qual LIKE '%auth.uid()%'
      OR with_check LIKE '%auth.uid()%'
  LOOP
    -- Drop the old policy
    EXECUTE format('DROP POLICY IF EXISTS %I ON %I.%I',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename
    );

    -- Replace auth.uid() with (select auth.uid()) in qual
    new_qual := REPLACE(policy_record.qual, 'auth.uid()', '(select auth.uid())');

    -- Replace auth.uid() with (select auth.uid()) in with_check
    new_with_check := REPLACE(policy_record.with_check, 'auth.uid()', '(select auth.uid())');

    -- Recreate the policy with optimized expressions
    EXECUTE format(
      'CREATE POLICY %I ON %I.%I FOR %s %s %s %s',
      policy_record.policyname,
      policy_record.schemaname,
      policy_record.tablename,
      policy_record.cmd,
      CASE WHEN policy_record.permissive = 'PERMISSIVE' THEN 'AS PERMISSIVE' ELSE 'AS RESTRICTIVE' END,
      CASE WHEN new_qual IS NOT NULL THEN 'USING (' || new_qual || ')' ELSE '' END,
      CASE WHEN new_with_check IS NOT NULL THEN 'WITH CHECK (' || new_with_check || ')' ELSE '' END
    );

    RAISE NOTICE 'Optimized policy: %.%', policy_record.tablename, policy_record.policyname;
  END LOOP;
END $$;

-- ===========================================
-- STEP 2: Verification
-- ===========================================

-- Check if any policies still have non-optimized auth.uid()
SELECT
  schemaname,
  tablename,
  policyname,
  cmd,
  CASE
    -- Check if optimized (with SELECT wrapper)
    WHEN (qual LIKE '%(SELECT auth.uid())%' OR qual LIKE '%(select auth.uid())%')
      OR (with_check LIKE '%(SELECT auth.uid())%' OR with_check LIKE '%(select auth.uid())%')
    THEN '✅ Optimized'
    -- Check if not optimized (direct call)
    WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
    THEN '⚠️ Not optimized'
    ELSE '✓ No auth check'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY
  CASE
    WHEN (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
      AND NOT (qual LIKE '%(SELECT auth.uid())%' OR qual LIKE '%(select auth.uid())%'
        OR with_check LIKE '%(SELECT auth.uid())%' OR with_check LIKE '%(select auth.uid())%')
    THEN 1  -- Not optimized first
    ELSE 2
  END,
  tablename,
  policyname;

-- ===========================================
-- STEP 3: Summary
-- ===========================================

-- Count optimized vs not optimized policies
SELECT
  COUNT(*) FILTER (WHERE
    (qual LIKE '%(SELECT auth.uid())%' OR qual LIKE '%(select auth.uid())%')
    OR (with_check LIKE '%(SELECT auth.uid())%' OR with_check LIKE '%(select auth.uid())%')
  ) as optimized_policies,
  COUNT(*) FILTER (WHERE
    (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
    AND NOT (qual LIKE '%(SELECT auth.uid())%' OR qual LIKE '%(select auth.uid())%'
      OR with_check LIKE '%(SELECT auth.uid())%' OR with_check LIKE '%(select auth.uid())%')
  ) as not_optimized_policies,
  COUNT(*) as total_policies
FROM pg_policies
WHERE schemaname = 'public';
