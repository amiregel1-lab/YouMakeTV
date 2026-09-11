-- Real registrations are read from the authentication service, never browser
-- analytics. Only the existing server service role can call this read API.
CREATE OR REPLACE FUNCTION public.hq_account_activity(since_at timestamptz, page_offset integer DEFAULT 0)
RETURNS TABLE(id uuid, created_at timestamptz, account_type text, display_name text)
LANGUAGE sql STABLE SECURITY DEFINER SET search_path = '' AS $$
  SELECT u.id, u.created_at,
    CASE WHEN u.raw_user_meta_data->>'account_type' = 'creator' THEN 'creator' ELSE 'viewer' END,
    left(COALESCE(u.raw_user_meta_data->>'full_name', 'New member'), 100)
  FROM auth.users u WHERE u.created_at >= since_at
    AND u.raw_user_meta_data->>'account_type' IN ('creator', 'viewer')
  ORDER BY u.created_at, u.id LIMIT 200 OFFSET greatest(page_offset, 0)
$$;
REVOKE ALL ON FUNCTION public.hq_account_activity(timestamptz, integer) FROM PUBLIC, anon, authenticated;
GRANT EXECUTE ON FUNCTION public.hq_account_activity(timestamptz, integer) TO service_role;
