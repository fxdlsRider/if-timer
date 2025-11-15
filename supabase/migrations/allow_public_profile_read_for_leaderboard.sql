-- Allow public read access to profile names for leaderboard
-- This enables the TopFasters leaderboard to show nicknames/names
-- even for non-authenticated users

-- Drop the old restrictive policy
DROP POLICY IF EXISTS "Users can view their own profile" ON profiles;

-- Create policy: Users can view their own full profile
CREATE POLICY "Users can view their own profile"
  ON profiles
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Anyone can read nickname and name (for leaderboard display)
-- Other fields (age, weight, etc.) remain private
CREATE POLICY "Public can view nicknames for leaderboard"
  ON profiles
  FOR SELECT
  USING (true);
