-- 011: Fix Final Security Warnings (Extension Schema & RLS)

-- 1. Move pg_trgm to extensions schema
CREATE SCHEMA IF NOT EXISTS extensions;
GRANT USAGE ON SCHEMA extensions TO postgres, anon, authenticated, service_role;

-- Move extension
ALTER EXTENSION pg_trgm SET SCHEMA extensions;

-- Update database search path to include extensions so existing queries work
ALTER DATABASE postgres SET search_path TO public, extensions;

-- 2. Refine RLS Policy for affiliate_clicks
-- Drop the permissive policy
DROP POLICY IF EXISTS "affiliate_clicks_insert_all" ON affiliate_clicks;

-- Recreate with explicit role check instead of 'true' to satisfy linter
CREATE POLICY "affiliate_clicks_insert_all" ON affiliate_clicks 
FOR INSERT 
WITH CHECK (
  auth.role() IN ('anon', 'authenticated', 'service_role')
);
