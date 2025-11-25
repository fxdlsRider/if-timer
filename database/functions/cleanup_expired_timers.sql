-- Supabase SQL Function: Cleanup Expired Timers
-- Purpose: Automatically clean up ghost timers (is_running=true but target_time expired)
-- Called by: Edge Function (cron job every 5 minutes)

CREATE OR REPLACE FUNCTION cleanup_expired_timers()
RETURNS TABLE(
  cleaned_count INTEGER,
  cleaned_user_ids UUID[]
)
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  affected_rows INTEGER;
  user_ids UUID[];
BEGIN
  -- Find all expired timers before updating (for logging)
  SELECT ARRAY_AGG(user_id) INTO user_ids
  FROM public.timer_states
  WHERE
    is_running = true
    AND target_time < NOW()
    AND target_time IS NOT NULL;

  -- Update expired timers to stopped state
  UPDATE public.timer_states
  SET
    is_running = false,
    target_time = NULL,
    is_extended = false,
    original_goal_time = NULL,
    updated_at = NOW()
  WHERE
    is_running = true
    AND target_time < NOW()
    AND target_time IS NOT NULL;

  -- Get number of affected rows
  GET DIAGNOSTICS affected_rows = ROW_COUNT;

  -- Return results
  RETURN QUERY SELECT affected_rows, COALESCE(user_ids, ARRAY[]::UUID[]);
END;
$$;

-- Grant execute permission to authenticated users and service role
GRANT EXECUTE ON FUNCTION cleanup_expired_timers() TO authenticated, service_role;

-- Example usage:
-- SELECT * FROM cleanup_expired_timers();
-- Returns: cleaned_count | cleaned_user_ids
--          2             | {uuid1, uuid2}
