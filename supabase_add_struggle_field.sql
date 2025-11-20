-- Add 'struggle' field to profiles table
-- Run this in Supabase SQL Editor

ALTER TABLE profiles 
ADD COLUMN IF NOT EXISTS struggle TEXT;

-- Add comment for documentation
COMMENT ON COLUMN profiles.struggle IS 'User''s current struggle or challenge (displayed in My Journey)';
