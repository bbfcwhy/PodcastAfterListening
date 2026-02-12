-- 005: Show 表擴充欄位（RSS 同步與前台顯示）
-- Branch: 005-rss-metadata-transcript
-- 新增 rss_feed_url, hosting_provided_by, show_categories 供 RSS 同步與節目級欄位顯示

ALTER TABLE shows
  ADD COLUMN IF NOT EXISTS rss_feed_url TEXT,
  ADD COLUMN IF NOT EXISTS hosting_provided_by TEXT,
  ADD COLUMN IF NOT EXISTS show_categories TEXT[];

COMMENT ON COLUMN shows.rss_feed_url IS 'RSS Feed URL，供同步使用；NULL 表示不從 RSS 同步';
COMMENT ON COLUMN shows.hosting_provided_by IS 'Hosting provided by XXX；RSS 無標準 tag，可從 description 擷取或留空';
COMMENT ON COLUMN shows.show_categories IS '節目級標籤（對應 itunes:category）';
