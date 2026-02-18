-- CX-005: Add shareable URL support to scenarios
-- Adds share_token and is_public columns for public sharing

-- Add share_token column (unique, nullable - only set on creation)
ALTER TABLE public.scenarios
  ADD COLUMN share_token TEXT UNIQUE DEFAULT NULL;

-- Add is_public flag (defaults to false, must be explicitly enabled)
ALTER TABLE public.scenarios
  ADD COLUMN is_public BOOLEAN NOT NULL DEFAULT false;

-- Index on share_token for fast public lookups
CREATE INDEX idx_scenarios_share_token ON public.scenarios(share_token)
  WHERE share_token IS NOT NULL;

-- Allow anyone to read public scenarios (no auth required)
CREATE POLICY "Anyone can read public scenarios"
  ON public.scenarios FOR SELECT
  USING (is_public = true);
