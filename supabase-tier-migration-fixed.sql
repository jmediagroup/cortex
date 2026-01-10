-- Migration: Update users table to support finance_pro and elite tiers
-- This script works when tier is a TEXT column (not an enum)

-- Step 1: Check current tier values
SELECT DISTINCT tier FROM users;

-- Step 2: Update any existing 'pro' users to 'finance_pro' (if any exist from testing)
-- This is safe to run even if no 'pro' users exist
UPDATE users
SET tier = 'finance_pro'
WHERE tier = 'pro';

-- Step 3: Verify the migration
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

-- Step 4: Add a check constraint to ensure only valid tiers (optional but recommended)
-- This prevents invalid tier values from being inserted
ALTER TABLE users DROP CONSTRAINT IF EXISTS users_tier_check;

ALTER TABLE users
ADD CONSTRAINT users_tier_check
CHECK (tier IN ('free', 'finance_pro', 'elite'));

-- Step 5: Add comment for documentation
COMMENT ON COLUMN users.tier IS 'User subscription tier: free, finance_pro (Finance Pro $9/mo), or elite (All sectors $29/mo)';

-- Step 6: Verify constraint was added
SELECT conname, pg_get_constraintdef(oid)
FROM pg_constraint
WHERE conrelid = 'users'::regclass
AND conname = 'users_tier_check';

-- NOTES:
-- - Your tier column is TEXT type (not enum), which is perfectly fine
-- - The check constraint ensures data integrity
-- - You can now use 'free', 'finance_pro', or 'elite' as tier values
-- - The TypeScript types in your code will enforce the same validation
