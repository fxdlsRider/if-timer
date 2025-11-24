-- Fix: Set search_path for update_updated_at_column function
-- Purpose: Resolve "mutable search_path" security/performance warning
-- Date: 2025-11-24

-- Set search_path to empty (most secure)
ALTER FUNCTION public.update_updated_at_column() SET search_path = '';

-- Verify the fix
SELECT
  routine_name,
  routine_type,
  pg_get_functiondef(p.oid) as function_definition
FROM information_schema.routines r
JOIN pg_proc p ON p.proname = r.routine_name
WHERE routine_name = 'update_updated_at_column'
  AND routine_schema = 'public';

-- Expected: Function definition should show "SET search_path TO ''"
