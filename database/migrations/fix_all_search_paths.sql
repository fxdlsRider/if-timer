-- Fix: Set search_path for ALL functions
-- Purpose: Resolve "mutable search_path" security/performance warnings
-- Date: 2025-11-24

-- Fix #1: update_updated_at_column
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Fix #2: cleanup_expired_timers (our new function)
ALTER FUNCTION public.cleanup_expired_timers() SET search_path = '';

-- Fix any other functions that might have this issue
DO $$
DECLARE
  func_record RECORD;
BEGIN
  FOR func_record IN
    SELECT
      p.proname as function_name,
      pg_get_function_identity_arguments(p.oid) as args
    FROM pg_proc p
    JOIN pg_namespace n ON p.pronamespace = n.oid
    WHERE n.nspname = 'public'
      AND p.proname NOT IN ('update_updated_at_column', 'cleanup_expired_timers')
      AND prosecdef = false  -- Not security definer functions
  LOOP
    BEGIN
      EXECUTE format('ALTER FUNCTION public.%I(%s) SET search_path = ''''',
        func_record.function_name,
        func_record.args
      );
      RAISE NOTICE 'Fixed search_path for function: %', func_record.function_name;
    EXCEPTION WHEN OTHERS THEN
      RAISE NOTICE 'Could not fix function % (might not need it): %', func_record.function_name, SQLERRM;
    END;
  END LOOP;
END $$;

-- Verification: Show all functions and their search_path settings
SELECT
  p.proname as function_name,
  pg_get_function_identity_arguments(p.oid) as arguments,
  CASE
    WHEN p.proconfig IS NULL THEN '⚠️ No search_path set'
    WHEN array_to_string(p.proconfig, ', ') LIKE '%search_path%'
    THEN '✅ search_path configured: ' || array_to_string(p.proconfig, ', ')
    ELSE '⚠️ No search_path set'
  END as search_path_status
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f'  -- Only functions, not procedures
ORDER BY
  CASE WHEN p.proconfig IS NULL THEN 1 ELSE 2 END,
  p.proname;

-- Summary
SELECT
  COUNT(*) FILTER (WHERE p.proconfig IS NULL) as no_search_path,
  COUNT(*) FILTER (WHERE array_to_string(p.proconfig, ', ') LIKE '%search_path%') as has_search_path,
  COUNT(*) as total_functions
FROM pg_proc p
JOIN pg_namespace n ON p.pronamespace = n.oid
WHERE n.nspname = 'public'
  AND p.prokind = 'f';
