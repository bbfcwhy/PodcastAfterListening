-- Enable RLS on all tables
ALTER TABLE shows ENABLE ROW LEVEL SECURITY;
ALTER TABLE hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE show_hosts ENABLE ROW LEVEL SECURITY;
ALTER TABLE episodes ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_contents ENABLE ROW LEVEL SECURITY;
ALTER TABLE episode_affiliates ENABLE ROW LEVEL SECURITY;
ALTER TABLE affiliate_clicks ENABLE ROW LEVEL SECURITY;

-- Shows policies
CREATE POLICY "shows_select_all" ON shows FOR SELECT USING (true);
CREATE POLICY "shows_insert_admin" ON shows FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "shows_update_admin" ON shows FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "shows_delete_admin" ON shows FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Hosts policies (same as shows)
CREATE POLICY "hosts_select_all" ON hosts FOR SELECT USING (true);
CREATE POLICY "hosts_insert_admin" ON hosts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "hosts_update_admin" ON hosts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "hosts_delete_admin" ON hosts FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- ShowHosts policies (same as shows)
CREATE POLICY "show_hosts_select_all" ON show_hosts FOR SELECT USING (true);
CREATE POLICY "show_hosts_insert_admin" ON show_hosts FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "show_hosts_update_admin" ON show_hosts FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "show_hosts_delete_admin" ON show_hosts FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Episodes policies
CREATE POLICY "episodes_select_published" ON episodes FOR SELECT USING (
  is_published = true OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "episodes_insert_admin" ON episodes FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "episodes_update_admin" ON episodes FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "episodes_delete_admin" ON episodes FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Tags policies (read-only for all, admin for write)
CREATE POLICY "tags_select_all" ON tags FOR SELECT USING (true);
CREATE POLICY "tags_insert_admin" ON tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "tags_update_admin" ON tags FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "tags_delete_admin" ON tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- EpisodeTags policies (same as tags)
CREATE POLICY "episode_tags_select_all" ON episode_tags FOR SELECT USING (true);
CREATE POLICY "episode_tags_insert_admin" ON episode_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "episode_tags_delete_admin" ON episode_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Comments policies
CREATE POLICY "comments_select_approved" ON comments FOR SELECT USING (
  status = 'approved' OR
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "comments_insert_authenticated" ON comments FOR INSERT WITH CHECK (
  auth.uid() IS NOT NULL
);
CREATE POLICY "comments_update_owner_or_admin" ON comments FOR UPDATE USING (
  user_id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "comments_delete_admin" ON comments FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- Profiles policies
CREATE POLICY "profiles_select_public" ON profiles FOR SELECT USING (true);
CREATE POLICY "profiles_update_owner_or_admin" ON profiles FOR UPDATE USING (
  id = auth.uid() OR
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- AffiliateContents policies
CREATE POLICY "affiliate_contents_select_all" ON affiliate_contents FOR SELECT USING (true);
CREATE POLICY "affiliate_contents_insert_admin" ON affiliate_contents FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "affiliate_contents_update_admin" ON affiliate_contents FOR UPDATE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "affiliate_contents_delete_admin" ON affiliate_contents FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- EpisodeAffiliates policies (same as affiliate_contents)
CREATE POLICY "episode_affiliates_select_all" ON episode_affiliates FOR SELECT USING (true);
CREATE POLICY "episode_affiliates_insert_admin" ON episode_affiliates FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "episode_affiliates_delete_admin" ON episode_affiliates FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- AffiliateClicks policies
CREATE POLICY "affiliate_clicks_select_admin" ON affiliate_clicks FOR SELECT USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "affiliate_clicks_insert_all" ON affiliate_clicks FOR INSERT WITH CHECK (true);
