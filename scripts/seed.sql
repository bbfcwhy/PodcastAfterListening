-- Seed data for development
-- This script creates sample shows, hosts, and episodes for testing

-- Insert sample shows
INSERT INTO shows (id, name, slug, description, cover_image_url, original_url) VALUES
  ('00000000-0000-0000-0000-000000000001', '科技島讀', 'tech-island', '探討科技與社會的深度內容', 'https://example.com/cover1.jpg', 'https://example.com/show1'),
  ('00000000-0000-0000-0000-000000000002', '星箭廣播', 'star-arrow', '科技創業與產品開發', 'https://example.com/cover2.jpg', 'https://example.com/show2')
ON CONFLICT (slug) DO NOTHING;

-- Insert sample hosts
INSERT INTO hosts (id, name, bio, avatar_url) VALUES
  ('10000000-0000-0000-0000-000000000001', '主持人 A', '科技評論家', 'https://example.com/avatar1.jpg'),
  ('10000000-0000-0000-0000-000000000002', '主持人 B', '創業者', 'https://example.com/avatar2.jpg')
ON CONFLICT DO NOTHING;

-- Link hosts to shows
INSERT INTO show_hosts (show_id, host_id, role) VALUES
  ('00000000-0000-0000-0000-000000000001', '10000000-0000-0000-0000-000000000001', 'host'),
  ('00000000-0000-0000-0000-000000000002', '10000000-0000-0000-0000-000000000002', 'host')
ON CONFLICT DO NOTHING;

-- Insert sample episodes
INSERT INTO episodes (id, show_id, title, slug, published_at, original_url, ai_summary, ai_sponsorship, host_notes, is_published) VALUES
  ('20000000-0000-0000-0000-000000000001', '00000000-0000-0000-0000-000000000001', 'AI 的未來', 'ai-future', '2026-01-15', 'https://example.com/ep1', '本集討論 AI 技術的發展趨勢', '本集由 XX 公司贊助', '這集內容很精彩，值得一聽', true),
  ('20000000-0000-0000-0000-000000000002', '00000000-0000-0000-0000-000000000002', '創業心法', 'startup-tips', '2026-01-20', 'https://example.com/ep2', '分享創業過程中的經驗', NULL, '實用的建議', true)
ON CONFLICT (show_id, slug) DO NOTHING;

-- Insert sample tags
INSERT INTO tags (id, name, slug) VALUES
  ('30000000-0000-0000-0000-000000000001', '科技', 'tech'),
  ('30000000-0000-0000-0000-000000000002', '創業', 'startup')
ON CONFLICT (slug) DO NOTHING;

-- Link tags to episodes
INSERT INTO episode_tags (episode_id, tag_id) VALUES
  ('20000000-0000-0000-0000-000000000001', '30000000-0000-0000-0000-000000000001'),
  ('20000000-0000-0000-0000-000000000002', '30000000-0000-0000-0000-000000000002')
ON CONFLICT DO NOTHING;
