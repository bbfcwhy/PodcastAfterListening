-- 007: Schema refinement based on user feedback
-- Branch: 007-schema-refinement
-- 1. Shows: 新增 tags 欄位 (Array of Text)
-- 2. Episodes: 新增 sponsorship_doc_url
-- 3. Episodes: 移除 summary, sponsorship_info, host_notes

-- Shows
ALTER TABLE shows
  ADD COLUMN IF NOT EXISTS tags TEXT[];

COMMENT ON COLUMN shows.tags IS 'Spotify 或其他來源的節目標籤';

-- Episodes
ALTER TABLE episodes
  ADD COLUMN IF NOT EXISTS sponsorship_doc_url TEXT;

COMMENT ON COLUMN episodes.sponsorship_doc_url IS 'AI 業配分析文件的 Google Doc 連結';

-- 備份資料 (選擇性，若欄位有資料建議先備份，這裡直接 Drop)
ALTER TABLE episodes
  DROP COLUMN IF EXISTS summary,
  DROP COLUMN IF EXISTS sponsorship_info,
  DROP COLUMN IF EXISTS host_notes;
