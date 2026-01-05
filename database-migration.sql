-- Migration: Add birth_date and gender fields to users table
-- Run this SQL in your Supabase SQL Editor

-- Add birth_date column (stores date in YYYY-MM-DD format)
ALTER TABLE users
ADD COLUMN IF NOT EXISTS birth_date DATE;

-- Add gender column (restricted to specific values)
DO $$ BEGIN
  CREATE TYPE gender_type AS ENUM ('male', 'female', 'prefer_not_to_say');
EXCEPTION
  WHEN duplicate_object THEN null;
END $$;

ALTER TABLE users
ADD COLUMN IF NOT EXISTS gender gender_type;

-- Add comments for documentation
COMMENT ON COLUMN users.birth_date IS 'User birth date for age calculation';
COMMENT ON COLUMN users.gender IS 'User gender: male, female, or prefer_not_to_say';

-- Verify the migration
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'users'
AND column_name IN ('birth_date', 'gender');
