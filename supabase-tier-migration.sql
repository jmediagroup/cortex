-- Migration: Add finance_pro and elite tiers to users table
-- Run this SQL in your Supabase SQL Editor

-- Step 1: Add new tier enum values
ALTER TYPE tier_type ADD VALUE IF NOT EXISTS 'finance_pro';
ALTER TYPE tier_type ADD VALUE IF NOT EXISTS 'elite';

-- Step 2: Migrate existing 'pro' users to 'finance_pro' (if any exist from testing)
-- This UPDATE is safe to run even if no 'pro' users exist
UPDATE users
SET tier = 'finance_pro'::tier_type
WHERE tier = 'pro'::tier_type;

-- Step 3: Verify migration
SELECT tier, COUNT(*) as count
FROM users
GROUP BY tier
ORDER BY tier;

-- Expected output:
-- tier         | count
-- -------------+-------
-- free         | X
-- finance_pro  | Y (if you had any pro users)
-- elite        | 0 (initially)

-- Step 4: Add comments for documentation
COMMENT ON COLUMN users.tier IS 'User subscription tier: free, finance_pro (Finance Pro), or elite (All sectors)';

-- IMPORTANT: After running this migration, you cannot have users with tier='pro' anymore
-- The old 'pro' value is now mapped to 'finance_pro' for backward compatibility
