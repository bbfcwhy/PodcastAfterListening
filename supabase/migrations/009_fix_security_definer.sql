-- 009: Fix Security Definer View Vulnerability
-- Reason: Supabase flagged public.episodes as a security risk because it runs as the view owner.
-- Enabling security_invoker ensures RLS policies on underlying tables are respected for the querying user.

ALTER VIEW episodes SET (security_invoker = true);
