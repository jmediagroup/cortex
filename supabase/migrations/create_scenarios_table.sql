-- Create scenarios table for saving tool inputs/outputs
-- CX-004: Save Scenarios feature

CREATE TABLE IF NOT EXISTS public.scenarios (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  tool_id TEXT NOT NULL,
  tool_name TEXT NOT NULL,
  inputs JSONB NOT NULL DEFAULT '{}',
  key_result TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups by user
CREATE INDEX idx_scenarios_user_id ON public.scenarios(user_id);

-- Composite index for checking per-tool limits (free tier: 1 per tool)
CREATE INDEX idx_scenarios_user_tool ON public.scenarios(user_id, tool_id);

-- Enable RLS
ALTER TABLE public.scenarios ENABLE ROW LEVEL SECURITY;

-- Users can only read their own scenarios
CREATE POLICY "Users can read own scenarios"
  ON public.scenarios FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own scenarios
CREATE POLICY "Users can insert own scenarios"
  ON public.scenarios FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own scenarios
CREATE POLICY "Users can delete own scenarios"
  ON public.scenarios FOR DELETE
  USING (auth.uid() = user_id);
