-- Soft-delete for outlook unsubscribes
-- Unsubscribing previously deleted the row, which erased suppression history:
-- a re-submitted (or bot-resubmitted) email would silently start receiving
-- mail again. Keep the row and stamp unsubscribed_at instead; the digest
-- sender filters on it, and re-subscribing requires a fresh confirmation
-- click which clears it.

alter table public.outlook_subscribers
  add column if not exists unsubscribed_at timestamptz;

-- The digest sender's exact predicate: confirmed and not unsubscribed.
create index if not exists outlook_subscribers_active_idx
  on public.outlook_subscribers (confirmed_at)
  where confirmed_at is not null and unsubscribed_at is null;
