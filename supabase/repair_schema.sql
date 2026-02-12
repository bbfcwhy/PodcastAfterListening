-- 綜合修復腳本 (Repair & Verify Script)

-- 1. 確保 show_categories 存在
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shows' AND column_name = 'show_categories') THEN
        ALTER TABLE shows ADD COLUMN show_categories TEXT[];
        COMMENT ON COLUMN shows.show_categories IS '節目級標籤';
    END IF;
END $$;

-- 2. 確保 position 存在
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shows' AND column_name = 'position') THEN
        ALTER TABLE shows ADD COLUMN position INTEGER DEFAULT 0;
    END IF;
END $$;

-- 3. 確保 rss_feed_url 與 hosting_provided_by 存在 (完整性檢查)
DO $$
BEGIN
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shows' AND column_name = 'rss_feed_url') THEN
        ALTER TABLE shows ADD COLUMN rss_feed_url TEXT;
    END IF;
    IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'shows' AND column_name = 'hosting_provided_by') THEN
        ALTER TABLE shows ADD COLUMN hosting_provided_by TEXT;
    END IF;
END $$;

-- 4. 重置 position (若尚未初始化)
WITH ranked_shows AS (
  SELECT id, ROW_NUMBER() OVER (ORDER BY created_at DESC) as new_rank
  FROM shows
)
UPDATE shows
SET position = ranked_shows.new_rank
FROM ranked_shows
WHERE shows.id = ranked_shows.id AND (shows.position IS NULL OR shows.position = 0);

-- 5. 輸出當前資料庫 Schema 狀態 (供您確認)
SELECT 
    column_name, 
    data_type 
FROM 
    information_schema.columns 
WHERE 
    table_name = 'shows'
ORDER BY 
    column_name;
