-- Integrated RLS Policies: PodcastAfterListening + PAL_AIAnalyzeLocal
-- 整合兩個專案的 Row Level Security 策略

-- ============================================================================
-- Enable RLS on all tables
-- ============================================================================
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE podcast_episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- ============================================================================
-- Shows policies
-- ============================================================================
DROP POLICY IF EXISTS "shows_select_all" ON shows;
CREATE POLICY "shows_select_all" ON shows FOR SELECT USING (true);

DROP POLICY IF EXISTS "shows_insert_admin" ON shows;
CREATE POLICY "shows_insert_admin" ON shows FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "shows_update_admin" ON shows;
CREATE POLICY "shows_update_admin" ON shows FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "shows_delete_admin" ON shows;
CREATE POLICY "shows_delete_admin" ON shows FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- Hosts policies
-- ============================================================================
DROP POLICY IF EXISTS "hosts_select_all" ON hosts;
CREATE POLICY "hosts_select_all" ON hosts FOR SELECT USING (true);

DROP POLICY IF EXISTS "hosts_insert_admin" ON hosts;
CREATE POLICY "hosts_insert_admin" ON hosts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "hosts_update_admin" ON hosts;
CREATE POLICY "hosts_update_admin" ON hosts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "hosts_delete_admin" ON hosts;
CREATE POLICY "hosts_delete_admin" ON hosts FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- ShowHosts policies
-- ============================================================================
DROP POLICY IF EXISTS "show_hosts_select_all" ON show_hosts;
CREATE POLICY "show_hosts_select_all" ON show_hosts FOR SELECT USING (true);

DROP POLICY IF EXISTS "show_hosts_insert_admin" ON show_hosts;
CREATE POLICY "show_hosts_insert_admin" ON show_hosts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "show_hosts_update_admin" ON show_hosts;
CREATE POLICY "show_hosts_update_admin" ON show_hosts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "show_hosts_delete_admin" ON show_hosts;
CREATE POLICY "show_hosts_delete_admin" ON show_hosts FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- Podcast Episodes policies
-- 支援 PAL_AIAnalyzeLocal 的服務角色存取和前端網頁的公開讀取
-- ============================================================================

-- 公開讀取：已發布的單集或站長可查看所有
DROP POLICY IF EXISTS "podcast_episodes_select_published" ON podcast_episodes;
CREATE POLICY "podcast_episodes_select_published" ON podcast_episodes FOR SELECT USING (
  is_published = true OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- PAL 專案：服務角色完整存取（用於 CLI 工具同步）
DROP POLICY IF EXISTS "podcast_episodes_service_role_full_access" ON podcast_episodes;
CREATE POLICY "podcast_episodes_service_role_full_access" ON podcast_episodes
  FOR ALL
  USING (auth.role() = 'service_role');

-- 站長可插入/更新/刪除
DROP POLICY IF EXISTS "podcast_episodes_insert_admin" ON podcast_episodes;
CREATE POLICY "podcast_episodes_insert_admin" ON podcast_episodes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "podcast_episodes_update_admin" ON podcast_episodes;
CREATE POLICY "podcast_episodes_update_admin" ON podcast_episodes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "podcast_episodes_delete_admin" ON podcast_episodes;
CREATE POLICY "podcast_episodes_delete_admin" ON podcast_episodes FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- Tags policies
-- ============================================================================
DROP POLICY IF EXISTS "tags_select_all" ON tags;
CREATE POLICY "tags_select_all" ON tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "tags_insert_admin" ON tags;
CREATE POLICY "tags_insert_admin" ON tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "tags_update_admin" ON tags;
CREATE POLICY "tags_update_admin" ON tags FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "tags_delete_admin" ON tags;
CREATE POLICY "tags_delete_admin" ON tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- EpisodeTags policies
-- ============================================================================
DROP POLICY IF EXISTS "episode_tags_select_all" ON episode_tags;
CREATE POLICY "episode_tags_select_all" ON episode_tags FOR SELECT USING (true);

DROP POLICY IF EXISTS "episode_tags_insert_admin" ON episode_tags;
CREATE POLICY "episode_tags_insert_admin" ON episode_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "episode_tags_delete_admin" ON episode_tags;
CREATE POLICY "episode_tags_delete_admin" ON episode_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- Comments policies
-- ============================================================================
DROP POLICY IF EXISTS "comments_select_approved" ON comments;
CREATE POLICY "comments_select_approved" ON comments FOR SELECT USING (
  status = 'approved' OR
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "comments_insert_authenticated" ON comments;
CREATE POLICY "comments_insert_authenticated" ON comments FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);

DROP POLICY IF EXISTS "comments_update_owner_or_admin" ON comments;
CREATE POLICY "comments_update_owner_or_admin" ON comments FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "comments_delete_admin" ON comments;
CREATE POLICY "comments_delete_admin" ON comments FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- Profiles policies
-- ============================================================================
DROP POLICY IF EXISTS "profiles_select_public" ON profiles;
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);

DROP POLICY IF EXISTS "profiles_update_owner_or_admin" ON profiles;
CREATE POLICY "profiles_update_owner_or_admin" ON profiles FOR UPDATE USING (
  id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- AffiliateContents policies
-- ============================================================================
DROP POLICY IF EXISTS "affiliate_contents_select_all" ON affiliate_contents;
CREATE POLICY "affiliate_contents_select_all" ON affiliate_contents FOR SELECT USING (true);

DROP POLICY IF EXISTS "affiliate_contents_insert_admin" ON affiliate_contents;
CREATE POLICY "affiliate_contents_insert_admin" ON affiliate_contents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "affiliate_contents_update_admin" ON affiliate_contents;
CREATE POLICY "affiliate_contents_update_admin" ON affiliate_contents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "affiliate_contents_delete_admin" ON affiliate_contents;
CREATE POLICY "affiliate_contents_delete_admin" ON affiliate_contents FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- EpisodeAffiliates policies
-- ============================================================================
DROP POLICY IF EXISTS "episode_affiliates_select_all" ON episode_affiliates;
CREATE POLICY "episode_affiliates_select_all" ON episode_affiliates FOR SELECT USING (true);

DROP POLICY IF EXISTS "episode_affiliates_insert_admin" ON episode_affiliates;
CREATE POLICY "episode_affiliates_insert_admin" ON episode_affiliates FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "episode_affiliates_delete_admin" ON episode_affiliates;
CREATE POLICY "episode_affiliates_delete_admin" ON episode_affiliates FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ============================================================================
-- AffiliateClicks policies
-- ============================================================================
DROP POLICY IF EXISTS "affiliate_clicks_select_admin" ON affiliate_clicks;
CREATE POLICY "affiliate_clicks_select_admin" ON affiliate_clicks FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

DROP POLICY IF EXISTS "affiliate_clicks_insert_all" ON affiliate_clicks;
CREATE POLICY "affiliate_clicks_insert_all" ON affiliate_clicks FOR INSERT WITH CHECK (true);
