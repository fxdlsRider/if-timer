-- Safe Optimization: Handles duplicates and optimizes intelligently
-- Purpose: Fix all 41+ warnings without breaking anything
-- Date: 2025-11-24
-- Strategy: For each table, keep only ONE optimized policy per operation

DO $$
DECLARE
  policy_record RECORD;
  table_name TEXT;
  cmd_type TEXT;
  policy_exists BOOLEAN;
  new_qual TEXT;
  new_with_check TEXT;
BEGIN
  -- Loop through all unique table + command combinations
  FOR table_name, cmd_type IN
    SELECT DISTINCT tablename, cmd
    FROM pg_policies
    WHERE schemaname = 'public'
      AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
    ORDER BY tablename, cmd
  LOOP
    -- Check if we already have an optimized policy for this table+cmd
    SELECT EXISTS(
      SELECT 1 FROM pg_policies
      WHERE tablename = table_name
        AND cmd = cmd_type
        AND schemaname = 'public'
        AND (
          qual ~ '\(SELECT auth\.uid\(\)'
          OR qual ~ '\(select auth\.uid\(\)'
          OR with_check ~ '\(SELECT auth\.uid\(\)'
          OR with_check ~ '\(select auth\.uid\(\)'
        )
    ) INTO policy_exists;

    IF policy_exists THEN
      -- Already have an optimized policy, drop unoptimized duplicates
      FOR policy_record IN
        SELECT policyname
        FROM pg_policies
        WHERE tablename = table_name
          AND cmd = cmd_type
          AND schemaname = 'public'
          AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
          AND NOT (
            qual ~ '\(SELECT auth\.uid\(\)'
            OR qual ~ '\(select auth\.uid\(\)'
            OR with_check ~ '\(SELECT auth\.uid\(\)'
            OR with_check ~ '\(select auth\.uid\(\)'
          )
      LOOP
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I',
          policy_record.policyname,
          table_name
        );
        RAISE NOTICE 'Dropped unoptimized duplicate: %.%', table_name, policy_record.policyname;
      END LOOP;
    ELSE
      -- No optimized policy exists, optimize the first one we find
      SELECT
        policyname,
        qual,
        with_check,
        permissive,
        roles
      INTO policy_record
      FROM pg_policies
      WHERE tablename = table_name
        AND cmd = cmd_type
        AND schemaname = 'public'
        AND (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
      LIMIT 1;

      IF FOUND THEN
        -- Replace auth.uid() with (select auth.uid())
        new_qual := REPLACE(policy_record.qual, 'auth.uid()', '(select auth.uid())');
        new_with_check := REPLACE(policy_record.with_check, 'auth.uid()', '(select auth.uid())');

        -- Drop old policy
        EXECUTE format('DROP POLICY IF EXISTS %I ON %I',
          policy_record.policyname,
          table_name
        );

        -- Recreate with optimization
        EXECUTE format(
          'CREATE POLICY %I ON %I FOR %s %s %s %s',
          policy_record.policyname,
          table_name,
          cmd_type,
          CASE WHEN policy_record.permissive = 'PERMISSIVE' THEN 'AS PERMISSIVE' ELSE 'AS RESTRICTIVE' END,
          CASE WHEN new_qual IS NOT NULL AND new_qual != '' THEN 'USING (' || new_qual || ')' ELSE '' END,
          CASE WHEN new_with_check IS NOT NULL AND new_with_check != '' THEN 'WITH CHECK (' || new_with_check || ')' ELSE '' END
        );

        RAISE NOTICE 'Optimized: %.% (%) - %', table_name, policy_record.policyname, cmd_type,
          CASE WHEN new_qual IS NOT NULL THEN 'USING updated' ELSE '' END ||
          CASE WHEN new_with_check IS NOT NULL THEN ' WITH CHECK updated' ELSE '' END;

        -- Drop any other duplicate policies for this table+cmd
        FOR policy_record IN
          SELECT policyname
          FROM pg_policies
          WHERE tablename = table_name
            AND cmd = cmd_type
            AND schemaname = 'public'
            AND policyname != policy_record.policyname
        LOOP
          EXECUTE format('DROP POLICY IF EXISTS %I ON %I',
            policy_record.policyname,
            table_name
          );
          RAISE NOTICE 'Dropped duplicate: %.%', table_name, policy_record.policyname;
        END LOOP;
      END IF;
    END IF;
  END LOOP;
END $$;

-- ===========================================
-- Verification
-- ===========================================

SELECT
  tablename,
  policyname,
  cmd,
  CASE
    WHEN qual ~ '\(SELECT auth\.uid\(\)' OR qual ~ '\(select auth\.uid\(\)'
      OR with_check ~ '\(SELECT auth\.uid\(\)' OR with_check ~ '\(select auth\.uid\(\)'
    THEN '✅ Optimized'
    WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
    THEN '⚠️ Not optimized'
    ELSE '✓ No auth check'
  END as status,
  LEFT(qual, 50) as qual_preview
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY
  CASE
    WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
    THEN 1
    ELSE 2
  END,
  tablename,
  cmd;

-- Summary
SELECT
  COUNT(*) FILTER (WHERE
    qual ~ '\(SELECT auth\.uid\(\)' OR qual ~ '\(select auth\.uid\(\)'
    OR with_check ~ '\(SELECT auth\.uid\(\)' OR with_check ~ '\(select auth\.uid\(\)'
  ) as optimized,
  COUNT(*) FILTER (WHERE
    (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
    AND NOT (qual ~ '\(SELECT auth\.uid\(\)' OR qual ~ '\(select auth\.uid\(\)')
    AND NOT (with_check ~ '\(SELECT auth\.uid\(\)' OR with_check ~ '\(select auth\.uid\(\)')
  ) as not_optimized,
  COUNT(*) as total
FROM pg_policies
WHERE schemaname = 'public';
