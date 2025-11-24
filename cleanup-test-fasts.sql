-- Cleanup Test Fasts
-- Purpose: Remove all test fasts created during UI testing
-- Date: 2025-11-24
-- Safe: Only deletes fasts with unit='seconds' OR duration < 1

-- Preview what will be deleted (run this first to check!)
SELECT
  id,
  user_id,
  duration,
  unit,
  goal_hours,
  cancelled,
  created_at
FROM fasts
WHERE unit = 'seconds'  -- Test Mode fasts
   OR (duration < 1 AND unit = 'hours')  -- Production fasts under 1 hour (safety net)
ORDER BY created_at DESC;

-- Uncomment the line below to actually delete (after verifying above!)
-- DELETE FROM fasts WHERE unit = 'seconds' OR (duration < 1 AND unit = 'hours');

-- Summary after deletion
SELECT
  COUNT(*) FILTER (WHERE unit = 'seconds') as test_fasts_deleted,
  COUNT(*) FILTER (WHERE unit = 'hours') as production_fasts_remaining,
  COUNT(*) as total_fasts
FROM fasts;
