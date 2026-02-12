-- 007 (Final Fix): Schema refinement (Drop View -> Alter Table -> Create View)

-- 1. 先刪除舊的 VIEW (因為我們要移除欄位，不能直接 REPLACE)
DROP VIEW IF EXISTS episodes;

-- 2. 修改 Shows 表 (還沒跑過的話)
ALTER TABLE shows
  ADD COLUMN IF NOT EXISTS tags TEXT[];

-- 3. 修改底層表 podcast_episodes (新增欄位)
ALTER TABLE podcast_episodes
  ADD COLUMN IF NOT EXISTS sponsorship_doc_url TEXT,
  ADD COLUMN IF NOT EXISTS transcript TEXT;

-- 4. 重新建立 VIEW episodes (包含新欄位，不含舊欄位)
CREATE VIEW episodes AS
SELECT 
  id,
  show_id,
  title,
  slug,
  published_at::DATE as published_at, -- 注意型別轉換
  original_url,
  ai_summary,     -- 直接對應
  ai_sponsorship, -- 直接對應
  description,    -- 直接對應
  duration_seconds,
  is_published,
  created_at,
  updated_at,
  -- 新增欄位
  sponsorship_doc_url,
  transcript,
  -- 其他欄位
  episode_id,
  audio_file_url,
  srt_file_url,
  summary_doc_url,
  reflection_doc_url,
  reflection,
  processed_at
FROM podcast_episodes;

-- 5. 安全移除底層表 podcast_episodes 的舊欄位
ALTER TABLE podcast_episodes
  DROP COLUMN IF EXISTS summary,
  DROP COLUMN IF EXISTS sponsorship_info,
  DROP COLUMN IF EXISTS host_notes;
