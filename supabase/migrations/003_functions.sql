-- Search episodes function
CREATE OR REPLACE FUNCTION search_episodes(
  query TEXT,
  filter_show_id UUID DEFAULT NULL,
  filter_tags UUID[] DEFAULT '{}',
  from_date DATE DEFAULT NULL,
  to_date DATE DEFAULT NULL
)
RETURNS SETOF episodes AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT e.*
  FROM episodes e
  WHERE e.is_published = true
    AND (query IS NULL OR query = '' OR 
         to_tsvector('chinese', e.title || ' ' || coalesce(e.ai_summary, '') || ' ' || coalesce(e.host_notes, '')) @@ plainto_tsquery('chinese', query))
    AND (filter_show_id IS NULL OR e.show_id = filter_show_id)
    AND (from_date IS NULL OR e.published_at >= from_date)
    AND (to_date IS NULL OR e.published_at <= to_date)
    AND (array_length(filter_tags, 1) IS NULL OR 
         EXISTS (
           SELECT 1 FROM episode_tags et
           WHERE et.episode_id = e.id
           AND et.tag_id = ANY(filter_tags)
         ))
  ORDER BY e.published_at DESC;
END;
$$ LANGUAGE plpgsql STABLE;

-- Check spam function
CREATE OR REPLACE FUNCTION check_spam(content TEXT)
RETURNS REAL AS $$
DECLARE
  score REAL := 0;
  link_count INTEGER;
  spam_keywords TEXT[] := ARRAY['spam', '垃圾', '廣告', '推廣'];
  keyword_count INTEGER := 0;
BEGIN
  -- Count links
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

  -- Cap at 1.0
  IF score > 1.0 THEN
    score := 1.0;
  END IF;

  RETURN score;
END;
$$ LANGUAGE plpgsql STABLE;
