-- Migration: Create analytics events table
-- Run this in Supabase SQL Editor

-- Create events table for user activity tracking
CREATE TABLE IF NOT EXISTS events (
  id BIGINT PRIMARY KEY GENERATED ALWAYS AS IDENTITY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  session_id TEXT,
  event_type TEXT NOT NULL,
  event_data JSONB,
  page_url TEXT,
  user_agent TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create indexes for better query performance
CREATE INDEX IF NOT EXISTS idx_events_user_id ON events(user_id);
CREATE INDEX IF NOT EXISTS idx_events_event_type ON events(event_type);
CREATE INDEX IF NOT EXISTS idx_events_created_at ON events(created_at DESC);
CREATE INDEX IF NOT EXISTS idx_events_session_id ON events(session_id);
CREATE INDEX IF NOT EXISTS idx_events_user_type ON events(user_id, event_type);

-- Create index for JSONB queries (useful for filtering by event_data)
CREATE INDEX IF NOT EXISTS idx_events_data ON events USING GIN (event_data);

-- Enable Row Level Security
ALTER TABLE events ENABLE ROW LEVEL SECURITY;

-- RLS Policy: Users can insert their own events
CREATE POLICY "Users can insert their own events"
  ON events
  FOR INSERT
  WITH CHECK (auth.uid() = user_id OR user_id IS NULL);

-- RLS Policy: Users can view their own events
CREATE POLICY "Users can view their own events"
  ON events
  FOR SELECT
  USING (auth.uid() = user_id);

-- RLS Policy: Service role can do anything (for backend analytics)
CREATE POLICY "Service role has full access"
  ON events
  FOR ALL
  USING (auth.jwt()->>'role' = 'service_role');

-- Create a function to clean up old events (optional - run periodically)
CREATE OR REPLACE FUNCTION delete_old_events()
RETURNS void AS $$
BEGIN
  DELETE FROM events
  WHERE created_at < NOW() - INTERVAL '365 days';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Create helper view for event analytics (makes querying easier)
CREATE OR REPLACE VIEW event_analytics AS
SELECT
  event_type,
  COUNT(*) as event_count,
  COUNT(DISTINCT user_id) as unique_users,
  COUNT(DISTINCT session_id) as unique_sessions,
  DATE_TRUNC('day', created_at) as event_date
FROM events
GROUP BY event_type, DATE_TRUNC('day', created_at)
ORDER BY event_date DESC, event_count DESC;

-- Grant access to the view
GRANT SELECT ON event_analytics TO authenticated;

-- Create helper function to get user event summary
CREATE OR REPLACE FUNCTION get_user_event_summary(target_user_id UUID)
RETURNS TABLE (
  event_type TEXT,
  event_count BIGINT,
  last_occurred TIMESTAMP WITH TIME ZONE,
  first_occurred TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
  RETURN QUERY
  SELECT
    e.event_type,
    COUNT(*) as event_count,
    MAX(e.created_at) as last_occurred,
    MIN(e.created_at) as first_occurred
  FROM events e
  WHERE e.user_id = target_user_id
  GROUP BY e.event_type
  ORDER BY event_count DESC;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Grant execute permission
GRANT EXECUTE ON FUNCTION get_user_event_summary TO authenticated;

COMMENT ON TABLE events IS 'Stores user activity events for analytics and tracking';
COMMENT ON COLUMN events.session_id IS 'Browser session ID to group related events';
COMMENT ON COLUMN events.event_data IS 'Additional event metadata stored as JSONB';
COMMENT ON COLUMN events.page_url IS 'URL where the event occurred';
