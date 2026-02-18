-- Migration: Add onboarding quiz fields to users table
-- Run this in the Supabase SQL Editor

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS has_completed_onboarding BOOLEAN NOT NULL DEFAULT FALSE;

ALTER TABLE public.users
ADD COLUMN IF NOT EXISTS onboarding_answers JSONB DEFAULT NULL;
