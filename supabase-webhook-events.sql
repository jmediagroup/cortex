-- Create webhook_events table for idempotency checking
-- This prevents duplicate processing of Stripe webhook events

CREATE TABLE IF NOT EXISTS public.webhook_events (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  processed_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create index for faster lookups
CREATE INDEX IF NOT EXISTS webhook_events_type_idx ON public.webhook_events(type);
CREATE INDEX IF NOT EXISTS webhook_events_created_at_idx ON public.webhook_events(created_at);

-- Optional: Add a policy to clean up old webhook events (older than 90 days)
-- You can run this manually or set up a scheduled job
COMMENT ON TABLE public.webhook_events IS 'Stores Stripe webhook event IDs to prevent duplicate processing. Consider periodically cleaning events older than 90 days.';
