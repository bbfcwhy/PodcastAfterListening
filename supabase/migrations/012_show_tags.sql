-- 012: 建立 show_tags 關聯表並遷移 shows.tags[] 資料
-- Feature: 010-tags-complete

-- 1. 建立 show_tags 關聯表
CREATE TABLE IF NOT EXISTS show_tags (
  show_id UUID REFERENCES shows(id) ON DELETE CASCADE NOT NULL,
  tag_id UUID REFERENCES tags(id) ON DELETE CASCADE NOT NULL,
  PRIMARY KEY (show_id, tag_id)
);

-- 2. 啟用 RLS
ALTER TABLE show_tags ENABLE ROW LEVEL SECURITY;

-- 3. RLS Policies
CREATE POLICY "show_tags_select_all" ON show_tags FOR SELECT USING (true);
CREATE POLICY "show_tags_insert_admin" ON show_tags FOR INSERT WITH CHECK (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);
CREATE POLICY "show_tags_delete_admin" ON show_tags FOR DELETE USING (
  EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true)
);

-- 4. 遷移 shows.tags[] 至正規化結構
-- 4a. 從 shows.tags[] 提取所有唯一標籤名稱，插入 tags 表（若不存在）
INSERT INTO tags (name, slug)
SELECT DISTINCT unnest(s.tags) AS tag_name, unnest(s.tags) AS tag_slug
FROM shows s
WHERE s.tags IS NOT NULL AND array_length(s.tags, 1) > 0
ON CONFLICT (name) DO NOTHING;

-- 4b. 建立 show_tags 關聯
INSERT INTO show_tags (show_id, tag_id)
SELECT s.id, t.id
FROM shows s, unnest(s.tags) AS tag_name
JOIN tags t ON t.name = tag_name
WHERE s.tags IS NOT NULL AND array_length(s.tags, 1) > 0
ON CONFLICT DO NOTHING;

-- 5. 移除 shows.tags 欄位（遷移完成）
ALTER TABLE shows DROP COLUMN IF EXISTS tags;
