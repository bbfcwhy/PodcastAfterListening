-- Integrated Database Functions: PodcastAfterListening + PAL_AIAnalyzeLocal
-- 整合兩個專案的資料庫函數

-- ============================================================================
-- Search episodes function
-- 搜尋單集，支援全文搜尋、節目篩選、標籤篩選、日期範圍
-- ============================================================================
CREATE OR REPLACE FUNCTION search_episodes(
  query TEXT,
  filter_show_id UUID DEFAULT NULL,
  filter_tags UUID[] DEFAULT '{}',
  from_date DATE DEFAULT NULL,
  to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  show_id UUID,
  title TEXT,
  slug TEXT,
  published_at DATE,
  original_url TEXT,
  ai_summary TEXT,
  ai_sponsorship TEXT,
  host_notes TEXT,
  duration_seconds INTEGER,
  is_published BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (pe.published_at, pe.id)
    pe.id,
    pe.show_id,
    pe.title,
    pe.slug,
    pe.published_at::DATE as published_at,
    pe.original_url,
    COALESCE(pe.ai_summary, pe.summary) as ai_summary,
    COALESCE(pe.ai_sponsorship, pe.sponsorship_info::TEXT) as ai_sponsorship,
    COALESCE(pe.host_notes, pe.reflection) as host_notes,
    pe.duration_seconds,
    pe.is_published,
    pe.created_at,
    pe.updated_at
  FROM podcast_episodes pe
  WHERE pe.is_published = true
    AND (query IS NULL OR query = '' OR 
         to_tsvector('simple', 
           pe.title || ' ' || 
           coalesce(pe.ai_summary, pe.summary, '') || ' ' || 
           coalesce(pe.host_notes, pe.reflection, '')
         ) @@ plainto_tsquery('simple', query))
    AND (filter_show_id IS NULL OR pe.show_id = filter_show_id)
    AND (from_date IS NULL OR pe.published_at::DATE >= from_date)
    AND (to_date IS NULL OR pe.published_at::DATE <= to_date)
    AND (array_length(filter_tags, 1) IS NULL OR 
         EXISTS (
           SELECT 1 FROM episode_tags et
           WHERE et.episode_id = pe.id
           AND et.tag_id = ANY(filter_tags)
         ))
  ORDER BY pe.published_at DESC, pe.id;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Check spam function
-- 檢查留言是否為垃圾內容，回傳 spam_score (0-1)
-- ============================================================================
CREATE OR REPLACE FUNCTION check_spam(content TEXT)
RETURNS REAL AS $$
DECLARE
  score REAL := 0;
  link_count INTEGER;
  spam_keywords TEXT[] := ARRAY['spam', '垃圾', '廣告', '推廣', '賺錢', '投資', '免費'];
  keyword_count INTEGER := 0;
BEGIN
  -- Count links (http/https)
  SELECT array_length(string_to_array(content, 'http'), 1) - 1 INTO link_count;
  IF link_count > 2 THEN
    score := score + 0.5;
  ELSIF link_count > 0 THEN
    score := score + 0.2;
  END IF;

  -- Check for spam keywords
  SELECT COUNT(*) INTO keyword_count
  FROM unnest(spam_keywords) AS keyword
  WHERE LOWER(content) LIKE '%' || LOWER(keyword) || '%';
  
  IF keyword_count > 0 THEN
    score := score + (keyword_count * 0.2);
  END IF;

  -- Check content length (very short or very long might be spam)
  IF length(content) < 10 THEN
    score := score + 0.1;
  ELSIF length(content) > 1000 THEN
    score := score + 0.1;
  END IF;

  -- Check for excessive repetition
  IF length(content) > 0 THEN
    DECLARE
      char_count INTEGER;
      unique_chars INTEGER;
    BEGIN
      -- Simple heuristic: if content has very few unique characters, might be spam
      SELECT COUNT(DISTINCT char) INTO unique_chars
      FROM unnest(string_to_array(content, NULL)) AS char;
      
      IF unique_chars < 5 AND length(content) > 20 THEN
        score := score + 0.2;
      END IF;
    END;
  END IF;

  -- Cap at 1.0
  IF score > 1.0 THEN
    score := 1.0;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql STABLE;

-- ============================================================================
-- Get episode by slug
-- 透過節目 slug 和單集 slug 取得單集資料
-- ============================================================================
CREATE OR REPLACE FUNCTION get_episode_by_slugs(
  show_slug TEXT,
  episode_slug TEXT
)
RETURNS TABLE (
  id UUID,
  show_id UUID,
  title TEXT,
  slug TEXT,
  published_at DATE,
  original_url TEXT,
  ai_summary TEXT,
  ai_sponsorship TEXT,
  host_notes TEXT,
  duration_seconds INTEGER,
  is_published BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ,
  -- PAL 專案欄位
  episode_id TEXT,
  description TEXT,
  audio_file_url TEXT,
  srt_file_url TEXT,
  summary_doc_url TEXT,
  reflection_doc_url TEXT,
  sponsorship_info JSONB,
  summary TEXT,
  reflection TEXT,
  processed_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pe.id,
    pe.show_id,
    pe.title,
    pe.slug,
    pe.published_at::DATE,
    pe.original_url,
    COALESCE(pe.ai_summary, pe.summary) as ai_summary,
    COALESCE(pe.ai_sponsorship, pe.sponsorship_info::TEXT) as ai_sponsorship,
    COALESCE(pe.host_notes, pe.reflection) as host_notes,
    pe.duration_seconds,
    pe.is_published,
    pe.created_at,
    pe.updated_at,
    pe.episode_id,
    pe.description,
    pe.audio_file_url,
    pe.srt_file_url,
    pe.summary_doc_url,
    pe.reflection_doc_url,
    pe.sponsorship_info,
    pe.summary,
    pe.reflection,
    pe.processed_at
  FROM podcast_episodes pe
  INNER JOIN shows s ON pe.show_id = s.id
  WHERE s.slug = show_slug
    AND pe.slug = episode_slug
    AND (pe.is_published = true OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  LIMIT 1;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;

-- ============================================================================
-- Get episodes by show
-- 取得指定節目的所有已發布單集
-- ============================================================================
CREATE OR REPLACE FUNCTION get_episodes_by_show(
  show_slug TEXT,
  limit_count INTEGER DEFAULT 50,
  offset_count INTEGER DEFAULT 0
)
RETURNS TABLE (
  id UUID,
  show_id UUID,
  title TEXT,
  slug TEXT,
  published_at DATE,
  original_url TEXT,
  ai_summary TEXT,
  ai_sponsorship TEXT,
  host_notes TEXT,
  duration_seconds INTEGER,
  is_published BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT 
    pe.id,
    pe.show_id,
    pe.title,
    pe.slug,
    pe.published_at::DATE,
    pe.original_url,
    COALESCE(pe.ai_summary, pe.summary) as ai_summary,
    COALESCE(pe.ai_sponsorship, pe.sponsorship_info::TEXT) as ai_sponsorship,
    COALESCE(pe.host_notes, pe.reflection) as host_notes,
    pe.duration_seconds,
    pe.is_published,
    pe.created_at,
    pe.updated_at
  FROM podcast_episodes pe
  INNER JOIN shows s ON pe.show_id = s.id
  WHERE s.slug = show_slug
    AND (pe.is_published = true OR 
         EXISTS (SELECT 1 FROM profiles WHERE id = auth.uid() AND is_admin = true))
  ORDER BY pe.published_at DESC
  LIMIT limit_count
  OFFSET offset_count;
END;
$$ LANGUAGE plpgsql STABLE SECURITY DEFINER;
