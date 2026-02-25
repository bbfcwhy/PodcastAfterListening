-- 013: 將 shows.show_categories[] 匯入 tags 表並建立 show_tags 關聯
-- Feature: 010-tags-complete

-- 1. 從 show_categories 提取所有唯一分類名稱，插入 tags 表（若不存在）
INSERT INTO tags (name, slug)
SELECT DISTINCT unnest(s.show_categories) AS cat_name, unnest(s.show_categories) AS cat_slug
FROM shows s
WHERE s.show_categories IS NOT NULL AND array_length(s.show_categories, 1) > 0
ON CONFLICT (name) DO NOTHING;

-- 2. 建立 show_tags 關聯
INSERT INTO show_tags (show_id, tag_id)
SELECT s.id, t.id
FROM shows s, unnest(s.show_categories) AS cat_name
JOIN tags t ON t.name = cat_name
WHERE s.show_categories IS NOT NULL AND array_length(s.show_categories, 1) > 0
ON CONFLICT DO NOTHING;
