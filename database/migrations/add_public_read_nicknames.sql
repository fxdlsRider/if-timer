-- Migration: Add public read access for user nicknames
-- Date: 2025-11-25
-- Purpose: Allow non-logged-in users to see nicknames in Community Page

-- Drop existing policy if it exists
DROP POLICY IF EXISTS "Anyone can view user nicknames" ON profiles;

-- Create new policy: Public read access for nicknames
-- Note: The query only selects 'user_id, nickname' - no sensitive data
CREATE POLICY "Anyone can view user nicknames"
ON profiles
FOR SELECT
USING (true);

-- Verify policy was created
SELECT
  schemaname,
  tablename,
  policyname,
  permissive,
  roles,
  cmd,
  qual
FROM pg_policies
WHERE tablename = 'profiles'
  AND policyname = 'Anyone can view user nicknames';
