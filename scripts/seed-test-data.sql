-- 測試資料準備腳本
-- 用於 E2E 測試的基礎資料

-- 建立測試節目系列
INSERT INTO shows (name, slug, description, cover_image_url) 
VALUES 
  ('測試節目系列', 'test-show', '這是用於測試的節目系列', NULL),
  ('另一個測試節目', 'another-test-show', '另一個測試用的節目系列', NULL)
ON CONFLICT (slug) DO UPDATE SET
  name = EXCLUDED.name,
  description = EXCLUDED.description;

-- 建立測試單集
INSERT INTO podcast_episodes (
  episode_id,
  show_id, 
  title, 
  slug, 
  is_published, 
  summary, 
  ai_summary, 
  original_url,
  published_at,
  description
)
SELECT 
  'test-episode-1',  -- episode_id 使用 slug 作為唯一識別
  s.id, 
  '測試單集 1', 
  'test-episode-1', 
  true,
  '這是測試單集的大綱',
  '這是 AI 生成的摘要內容，用於測試 AI 警語的可見性。',
  'https://example.com/episode-1',
  NOW() - INTERVAL '1 day',
  '這是測試單集的描述'
FROM shows s
WHERE s.slug = 'test-show'
ON CONFLICT (episode_id) DO NOTHING;

INSERT INTO podcast_episodes (
  episode_id,
  show_id, 
  title, 
  slug, 
  is_published, 
  summary, 
  ai_summary, 
  original_url,
  published_at,
  description
)
SELECT 
  'test-episode-2',  -- episode_id 使用 slug 作為唯一識別
  s.id, 
  '測試單集 2', 
  'test-episode-2', 
  true,
  '另一個測試單集的大綱',
  '另一個 AI 生成的摘要內容。',
  'https://example.com/episode-2',
  NOW(),
  '另一個測試單集的描述'
FROM shows s
WHERE s.slug = 'test-show'
ON CONFLICT (episode_id) DO NOTHING;

-- 驗證資料
SELECT 
  'Shows created' as status,
  COUNT(*) as count
FROM shows
WHERE slug IN ('test-show', 'another-test-show');

SELECT 
  'Episodes created' as status,
  COUNT(*) as count
FROM podcast_episodes
WHERE slug IN ('test-episode-1', 'test-episode-2');
