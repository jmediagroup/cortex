-- Migration: Add theme preference to users table
-- Run this in the Supabase SQL Editor.

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS theme TEXT
  CHECK (theme IN ('light','dark'))
  DEFAULT 'light';
