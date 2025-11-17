-- Add unique constraint to prevent duplicate fasts
-- This ensures that the same user cannot have multiple fasts
-- with identical start_time and duration

-- First, clean up any existing duplicates (if any)
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

-- Add unique constraint
ALTER TABLE fasts
ADD CONSTRAINT unique_user_fast
UNIQUE (user_id, start_time, duration);

-- Verify constraint was added
SELECT
  conname AS constraint_name,
  contype AS constraint_type
FROM pg_constraint
WHERE conrelid = 'fasts'::regclass
  AND conname = 'unique_user_fast';
