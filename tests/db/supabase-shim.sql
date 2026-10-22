-- 在 PGlite 裡模擬 Supabase 的資料庫環境，讓 migration 檔可以原封不動地套用。
-- 只放 migration 與權限測試用得到的部分：
--   1. API 角色：anon、authenticated、service_role（service_role 可略過 RLS）
--   2. auth schema：auth.users 表、auth.uid()、auth.role()（寫法與 Supabase 相同，讀 request.jwt.claims）
--   3. 表權限：Supabase 預設把 public 的表整張授權給三個 API 角色，
--      2026-10-22 查正式庫 pg_class.relacl 確認 profiles、comments 都是 arwdDxtm。

CREATE ROLE anon NOLOGIN;
CREATE ROLE authenticated NOLOGIN;
CREATE ROLE service_role NOLOGIN BYPASSRLS;

CREATE SCHEMA auth;

CREATE TABLE auth.users (
  id UUID PRIMARY KEY,
  email TEXT
);

CREATE FUNCTION auth.uid() RETURNS UUID
LANGUAGE sql STABLE
AS $$
  SELECT nullif(
    coalesce(
      current_setting('request.jwt.claim.sub', true),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'sub')
    ),
    ''
  )::uuid
$$;

CREATE FUNCTION auth.role() RETURNS TEXT
LANGUAGE sql STABLE
AS $$
  SELECT nullif(
    coalesce(
      current_setting('request.jwt.claim.role', true),
      (current_setting('request.jwt.claims', true)::jsonb ->> 'role')
    ),
    ''
  )::text
$$;

GRANT USAGE ON SCHEMA auth TO anon, authenticated, service_role;
GRANT USAGE ON SCHEMA public TO anon, authenticated, service_role;

ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON TABLES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON SEQUENCES TO anon, authenticated, service_role;
ALTER DEFAULT PRIVILEGES IN SCHEMA public GRANT ALL ON FUNCTIONS TO anon, authenticated, service_role;
