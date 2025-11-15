-- Create fasts table for storing completed fasting sessions
-- Run this in your Supabase SQL editor

CREATE TABLE IF NOT EXISTS fasts (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  duration DECIMAL(10, 1) NOT NULL, -- Duration in hours (or seconds in test mode)
  original_goal INTEGER NOT NULL, -- Original goal duration
  start_time TIMESTAMPTZ NOT NULL,
  end_time TIMESTAMPTZ NOT NULL,
  cancelled BOOLEAN DEFAULT FALSE,
  unit VARCHAR(10) DEFAULT 'hours', -- 'hours' or 'seconds'
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Add index on user_id for faster queries
CREATE INDEX IF NOT EXISTS fasts_user_id_idx ON fasts(user_id);

-- Add index on end_time for sorting
CREATE INDEX IF NOT EXISTS fasts_end_time_idx ON fasts(end_time DESC);

-- Enable Row Level Security (RLS)
ALTER TABLE fasts ENABLE ROW LEVEL SECURITY;

-- Create policy: Users can only read their own fasts
CREATE POLICY "Users can view their own fasts"
  ON fasts
  FOR SELECT
  USING (auth.uid() = user_id);

-- Create policy: Users can only insert their own fasts
CREATE POLICY "Users can insert their own fasts"
  ON fasts
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Create policy: Users can only update their own fasts
CREATE POLICY "Users can update their own fasts"
  ON fasts
  FOR UPDATE
  USING (auth.uid() = user_id);

-- Create policy: Users can only delete their own fasts
CREATE POLICY "Users can delete their own fasts"
  ON fasts
  FOR DELETE
  USING (auth.uid() = user_id);
