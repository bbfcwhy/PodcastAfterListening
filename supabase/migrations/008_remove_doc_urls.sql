-- 008: Remove Google Doc URL columns
-- Reason: User opted for direct text/markdown storage in Supabase.

-- 1. Drop the view that references these columns
DROP VIEW IF EXISTS episodes;

-- 2. Drop columns from the underlying table
ALTER TABLE podcast_episodes
  DROP COLUMN IF EXISTS summary_doc_url,
  DROP COLUMN IF EXISTS reflection_doc_url,
  DROP COLUMN IF EXISTS sponsorship_doc_url;

-- 3. Recreate the view without these columns
CREATE VIEW episodes AS
SELECT 
  id,
  show_id,
  title,
  slug,
  published_at::DATE as published_at,
  original_url,
  ai_summary,
  ai_sponsorship,
  description, 
  duration_seconds,
  is_published,
  created_at,
  updated_at,
  transcript,
  -- Removed: summary_doc_url, reflection_doc_url, sponsorship_doc_url
  episode_id,
  audio_file_url,
  srt_file_url,
  reflection,
  processed_at
FROM podcast_episodes;
