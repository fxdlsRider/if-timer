-- Add nickname field to profiles table
-- Run this in your Supabase SQL editor

ALTER TABLE profiles ADD COLUMN IF NOT EXISTS nickname VARCHAR(50);

-- Add unique constraint on nickname (optional - prevents duplicate nicknames)
-- Uncomment if you want nicknames to be unique:
-- ALTER TABLE profiles ADD CONSTRAINT profiles_nickname_unique UNIQUE (nickname);
