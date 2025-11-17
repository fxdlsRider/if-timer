-- Delete duplicate fasts (keeps the oldest entry)
-- This finds fasts with same user_id, start_time, and duration
-- and deletes all but the first one (by created_at)

WITH duplicates AS (
  SELECT
    id,
    ROW_NUMBER() OVER (
      PARTITION BY user_id, start_time, duration
      ORDER BY created_at ASC
    ) as row_num
  FROM fasts
)
DELETE FROM fasts
WHERE id IN (
  SELECT id FROM duplicates WHERE row_num > 1
);

-- Show remaining fasts
SELECT
  id,
  user_id,
  duration,
  start_time,
  end_time,
  created_at
FROM fasts
ORDER BY created_at DESC;
