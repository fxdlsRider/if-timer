-- Debug: Show ALL policies with detailed info
-- Purpose: Find out which policy is still not optimized

-- Show ALL policies in detail
SELECT
  tablename,
  policyname,
  cmd,
  qual,
  with_check,
  CASE
    -- Check if contains auth.uid() at all
    WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
    THEN 'Has auth.uid()'
    ELSE 'No auth.uid()'
  END as has_auth,
  CASE
    -- Check if optimized
    WHEN qual ~ '\(SELECT auth\.uid\(\)' OR qual ~ '\(select auth\.uid\(\)'
      OR with_check ~ '\(SELECT auth\.uid\(\)' OR with_check ~ '\(select auth\.uid\(\)'
    THEN '✅ Optimized'
    WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
    THEN '⚠️ Not optimized'
    ELSE '✓ No optimization needed'
  END as status
FROM pg_policies
WHERE schemaname = 'public'
ORDER BY
  CASE
    WHEN (qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%')
      AND NOT (qual ~ '\(SELECT auth\.uid\(\)' OR qual ~ '\(select auth\.uid\(\)'
        OR with_check ~ '\(SELECT auth\.uid\(\)' OR with_check ~ '\(select auth\.uid\(\)')
    THEN 1  -- Not optimized first
    WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
    THEN 2  -- Has auth but might be optimized
    ELSE 3  -- No auth
  END,
  tablename,
  policyname;

-- Count by status
SELECT
  CASE
    WHEN qual ~ '\(SELECT auth\.uid\(\)' OR qual ~ '\(select auth\.uid\(\)'
      OR with_check ~ '\(SELECT auth\.uid\(\)' OR with_check ~ '\(select auth\.uid\(\)'
    THEN '✅ Optimized'
    WHEN qual LIKE '%auth.uid()%' OR with_check LIKE '%auth.uid()%'
    THEN '⚠️ Not optimized'
    ELSE '✓ No auth check'
  END as status,
  COUNT(*) as count
FROM pg_policies
WHERE schemaname = 'public'
GROUP BY status
ORDER BY status;
