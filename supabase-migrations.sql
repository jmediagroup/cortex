-- Migration: Add name fields to users table
-- Run this in Supabase SQL Editor

-- Add first_name and last_name columns to users table
ALTER TABLE users
ADD COLUMN IF NOT EXISTS first_name TEXT,
ADD COLUMN IF NOT EXISTS last_name TEXT;

-- Optional: Add index for faster name lookups
CREATE INDEX IF NOT EXISTS idx_users_names ON users(first_name, last_name);

-- Update RLS policies if needed (existing policies should continue to work)
