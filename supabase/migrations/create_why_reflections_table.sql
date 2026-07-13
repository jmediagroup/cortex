-- Create why_reflections table for the "What's Your Why" feature.
-- Stores each user's eight guided-reflection answers and the AI-generated
-- summary synthesized from them.

CREATE TABLE IF NOT EXISTS public.why_reflections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  answers JSONB NOT NULL DEFAULT '{}',
  summary JSONB NOT NULL DEFAULT '{}',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Index for fast lookups of a user's reflections, newest first.
CREATE INDEX IF NOT EXISTS idx_why_reflections_user_id
  ON public.why_reflections(user_id, created_at DESC);

-- Enable RLS
ALTER TABLE public.why_reflections ENABLE ROW LEVEL SECURITY;

-- Users can only read their own reflections
CREATE POLICY "Users can read own why reflections"
  ON public.why_reflections FOR SELECT
  USING (auth.uid() = user_id);

-- Users can insert their own reflections
CREATE POLICY "Users can insert own why reflections"
  ON public.why_reflections FOR INSERT
  WITH CHECK (auth.uid() = user_id);

-- Users can delete their own reflections
CREATE POLICY "Users can delete own why reflections"
  ON public.why_reflections FOR DELETE
  USING (auth.uid() = user_id);
