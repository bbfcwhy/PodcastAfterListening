-- 007 (Fix): Schema refinement (Table + View Update)
-- 修正說明：episodes 是一個 VIEW，底層表是 podcast_episodes。
-- 因此我們必須先修改 podcast_episodes，然後更新 VIEW 的定義。

-- 1. 修改 Shows 表 (這是標準表，直接修改)
ALTER TABLE shows
  ADD COLUMN IF NOT EXISTS tags TEXT[];
COMMENT ON COLUMN shows.tags IS 'Spotify 或其他來源的節目標籤';

-- 2. 修改底層表 podcast_episodes (新增欄位)
ALTER TABLE podcast_episodes
  ADD COLUMN IF NOT EXISTS sponsorship_doc_url TEXT,
  ADD COLUMN IF NOT EXISTS transcript TEXT;

COMMENT ON COLUMN podcast_episodes.sponsorship_doc_url IS 'AI 業配分析文件的 Google Doc 連結';
COMMENT ON COLUMN podcast_episodes.transcript IS '單集逐字稿內容';

-- 3. 更新 VIEW episodes (重定義 VIEW 以包含新欄位，並移除即將刪除的欄位)
CREATE OR REPLACE VIEW episodes AS
SELECT 
  id,
  show_id,
  title,
  slug,
  published_at::DATE as published_at,
  original_url,
  -- 直接使用 ai_summary，不再 fallback 到 summary
  ai_summary,
  -- 直接使用 ai_sponsorship，不再 fallback 到 sponsorship_info
  ai_sponsorship,
  -- 使用 description 作為 host_notes (或直接移除 host_notes 欄位，視前端需求)
  -- 根據您的需求：host_notes 移除，用 description 取代。
  -- 但這裡我們還是要對應到 database.ts 的介面。
  -- 如果 database.ts 已經移除了 host_notes，這裡就不需要 select 它了。
  -- 假設 database.ts 移除了 summary, sponsorship_info, host_notes
  description, 
  duration_seconds,
  is_published,
  created_at,
  updated_at,
  -- 新增欄位
  sponsorship_doc_url,
  transcript,
  -- 其他可能遺漏的欄位 (根據 database.ts)
  episode_id,
  audio_file_url,
  srt_file_url,
  summary_doc_url,
  reflection_doc_url,
  reflection,
  processed_at
FROM podcast_episodes;

-- 4. 移除底層表 podcast_episodes 的舊欄位
-- 只有在 VIEW 更新完畢不再引用這些欄位後，才能刪除
ALTER TABLE podcast_episodes
  DROP COLUMN IF EXISTS summary,
  DROP COLUMN IF EXISTS sponsorship_info,
  DROP COLUMN IF EXISTS host_notes;
