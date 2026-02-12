-- 010: Fix Security Warnings (Mutable Search Paths)
-- Reason: Supabase flagged search_path in functions as mutable, which avoids search_path hijacking.
-- We set a fixed search_path to 'public' (where extensions like pg_trgm are currently located) plus 'extensions' (for future proofing) and 'pg_temp'.

-- 1. Search Episodes (Two Overloads found in DB)
-- Overload 1: Default or one version (tags before dates)
ALTER FUNCTION public.search_episodes(text, uuid, uuid[], date, date) SET search_path = public, extensions, pg_temp;
-- Overload 2: Another version (dates before tags)
ALTER FUNCTION public.search_episodes(text, uuid, date, date, uuid[]) SET search_path = public, extensions, pg_temp;

-- 2. Link Episode to Show (Found to have NO arguments)
ALTER FUNCTION public.link_episode_to_show() SET search_path = public, extensions, pg_temp;

-- 3. Confirmed Functions
ALTER FUNCTION public.check_spam(text) SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.get_episode_by_slugs(text, text) SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.get_episodes_by_show(text, integer, integer) SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.migrate_pal_data_to_frontend_fields() SET search_path = public, extensions, pg_temp;

-- 4. Triggers (No arguments)
ALTER FUNCTION public.episodes_update_trigger() SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.episodes_insert_trigger() SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.episodes_delete_trigger() SET search_path = public, extensions, pg_temp;
ALTER FUNCTION public.update_updated_at_column() SET search_path = public, extensions, pg_temp;
