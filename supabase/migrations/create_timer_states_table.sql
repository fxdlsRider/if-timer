-- Create timer_states table for persisting active timer state
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS timer_states (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  hours INTEGER NOT NULL DEFAULT 16,
  angle INTEGER NOT NULL DEFAULT 0,
  is_running BOOLEAN DEFAULT FALSE,
  target_time TIMESTAMPTZ,
  is_extended BOOLEAN DEFAULT FALSE,
  original_goal_time TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index on user_id for faster queries
CREATE INDEX IF NOT EXISTS timer_states_user_id_idx ON timer_states(user_id);

-- Enable Row Level Security (RLS)
ALTER TABLE timer_states ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own timer state
CREATE POLICY "Users can view their own timer state"
  ON timer_states
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can only insert their own timer state
CREATE POLICY "Users can insert their own timer state"
  ON timer_states
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can only update their own timer state
CREATE POLICY "Users can update their own timer state"
  ON timer_states
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can only delete their own timer state
CREATE POLICY "Users can delete their own timer state"
  ON timer_states
  FOR DELETE
  USING (auth.uid() = user_id);

-- Function to automatically update updated_at timestamp
CREATE OR REPLACE FUNCTION update_timer_states_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger to update updated_at on timer state changes
CREATE TRIGGER update_timer_states_timestamp BEFORE UPDATE ON timer_states
  FOR EACH ROW EXECUTE FUNCTION update_timer_states_updated_at();
