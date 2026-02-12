-- 006: Add transcript column to episodes
-- Branch: 006-add-transcript
-- 新增 transcript 欄位，用於儲存單集的逐字稿內容

ALTER TABLE episodes
  ADD COLUMN IF NOT EXISTS transcript TEXT;

COMMENT ON COLUMN episodes.transcript IS '單集逐字稿內容';
