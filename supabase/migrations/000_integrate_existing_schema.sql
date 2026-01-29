-- Integration Migration: 整合現有的 podcast_episodes 表
-- 此遷移腳本將現有的 PAL_AIAnalyzeLocal schema 與 PodcastAfterListening schema 整合

-- 步驟 1: 檢查並擴展現有的 podcast_episodes 表
-- 如果表已存在，添加缺少的欄位；如果不存在，則建立完整表

-- 首先，確保必要的擴展已啟用
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- 檢查 podcast_episodes 表是否存在
DO $$
BEGIN
  -- 如果表不存在，建立完整表
  IF NOT EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'podcast_episodes') THEN
    CREATE TABLE podcast_episodes (
      id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
      episode_id TEXT NOT NULL UNIQUE,
      title TEXT NOT NULL,
      description TEXT,
      published_at TIMESTAMPTZ,
      audio_file_url TEXT,
      srt_file_url TEXT,
      summary_doc_url TEXT,
      reflection_doc_url TEXT,
      sponsorship_info JSONB,
      summary TEXT,
      reflection TEXT,
      processed_at TIMESTAMPTZ,
      created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
      updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
  END IF;
END $$;

-- 添加缺少的欄位（如果不存在）
ALTER TABLE podcast_episodes
  ADD COLUMN IF NOT EXISTS show_id UUID,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS original_url TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS ai_summary TEXT,
  ADD COLUMN IF NOT EXISTS ai_sponsorship TEXT,
  ADD COLUMN IF NOT EXISTS host_notes TEXT;

-- 將現有資料對應到新欄位（如果新欄位為空且舊欄位有值）
UPDATE podcast_episodes
SET 
  ai_summary = COALESCE(ai_summary, summary),
  host_notes = COALESCE(host_notes, reflection),
  ai_sponsorship = COALESCE(
    ai_sponsorship,
    CASE 
      WHEN sponsorship_info IS NOT NULL THEN sponsorship_info::TEXT
      ELSE NULL
    END
  )
WHERE ai_summary IS NULL OR host_notes IS NULL OR ai_sponsorship IS NULL;

-- 建立索引（如果不存在）
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_episode_id ON podcast_episodes(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_show_id ON podcast_episodes(show_id) WHERE show_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_slug ON podcast_episodes(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_published_at ON podcast_episodes(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_is_published ON podcast_episodes(is_published) WHERE is_published = true;

-- 步驟 2: 建立 shows 表（如果不存在）
CREATE TABLE IF NOT EXISTS shows (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  slug TEXT NOT NULL UNIQUE,
  description TEXT,
  cover_image_url TEXT,
  original_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_shows_slug ON shows(slug);
CREATE INDEX IF NOT EXISTS idx_shows_name_search ON shows USING GIN (to_tsvector('chinese', name || ' ' || coalesce(description, '')));

-- 步驟 3: 建立其他必要的表（使用現有的 001_initial_schema.sql 中的定義）
-- 這裡只列出關鍵表，完整定義請參考 001_initial_schema.sql

-- Hosts table
CREATE TABLE IF NOT EXISTS hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ShowHosts junction table
CREATE TABLE IF NOT EXISTS show_hosts (
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'host',
  PRIMARY KEY (show_id, host_id)
);

-- Tags table
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EpisodeTags junction table
CREATE TABLE IF NOT EXISTS episode_tags (
  episode_id UUID NOT NULL,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (episode_id, tag_id)
);

-- Comments table
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  content TEXT NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'hidden', 'spam')),
  spam_score REAL DEFAULT 0 CHECK (spam_score >= 0 AND spam_score <= 1),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_comments_episode_id ON comments(episode_id);
CREATE INDEX IF NOT EXISTS idx_comments_user_id ON comments(user_id);
CREATE INDEX IF NOT EXISTS idx_comments_status ON comments(status);
CREATE INDEX IF NOT EXISTS idx_comments_pending ON comments(status, created_at) WHERE status = 'pending';

-- Profiles table
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- AffiliateContents table
CREATE TABLE IF NOT EXISTS affiliate_contents (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  target_url TEXT NOT NULL,
  image_url TEXT,
  is_active BOOLEAN NOT NULL DEFAULT true,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- EpisodeAffiliates junction table
CREATE TABLE IF NOT EXISTS episode_affiliates (
  episode_id UUID NOT NULL,
  affiliate_id UUID NOT NULL REFERENCES affiliate_contents(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  PRIMARY KEY (episode_id, affiliate_id)
);

-- AffiliateClicks table
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliate_contents(id) ON DELETE CASCADE,
  episode_id UUID,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  referer TEXT
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at);

-- 步驟 4: 建立外鍵約束（如果 podcast_episodes 表存在且 show_id 欄位已添加）
DO $$
BEGIN
  -- 為 podcast_episodes 添加外鍵約束（如果欄位存在且約束不存在）
  IF EXISTS (SELECT FROM information_schema.columns WHERE table_name = 'podcast_episodes' AND column_name = 'show_id') THEN
    -- 檢查外鍵約束是否已存在
    IF NOT EXISTS (
      SELECT 1 FROM information_schema.table_constraints 
      WHERE constraint_name = 'podcast_episodes_show_id_fkey'
    ) THEN
      ALTER TABLE podcast_episodes
        ADD CONSTRAINT podcast_episodes_show_id_fkey 
        FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE SET NULL;
    END IF;
  END IF;

  -- 為 comments 添加外鍵約束（指向 podcast_episodes 或 episodes）
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'comments_episode_id_fkey'
  ) THEN
    -- 嘗試指向 podcast_episodes（如果存在）
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'podcast_episodes') THEN
      ALTER TABLE comments
        ADD CONSTRAINT comments_episode_id_fkey 
        FOREIGN KEY (episode_id) REFERENCES podcast_episodes(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- 為 episode_tags 添加外鍵約束
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'episode_tags_episode_id_fkey'
  ) THEN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'podcast_episodes') THEN
      ALTER TABLE episode_tags
        ADD CONSTRAINT episode_tags_episode_id_fkey 
        FOREIGN KEY (episode_id) REFERENCES podcast_episodes(id) ON DELETE CASCADE;
    END IF;
  END IF;

  -- 為 episode_affiliates 添加外鍵約束
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'episode_affiliates_episode_id_fkey'
  ) THEN
    IF EXISTS (SELECT FROM information_schema.tables WHERE table_name = 'podcast_episodes') THEN
      ALTER TABLE episode_affiliates
        ADD CONSTRAINT episode_affiliates_episode_id_fkey 
        FOREIGN KEY (episode_id) REFERENCES podcast_episodes(id) ON DELETE CASCADE;
    END IF;
  END IF;
END $$;

-- 步驟 5: 建立視圖或別名，讓代碼可以同時使用 podcast_episodes 和 episodes
-- 選項 A: 建立視圖將 podcast_episodes 映射為 episodes
CREATE OR REPLACE VIEW episodes AS
SELECT 
  id,
  show_id,
  title,
  slug,
  published_at::DATE as published_at,
  original_url,
  COALESCE(ai_summary, summary) as ai_summary,
  COALESCE(ai_sponsorship, sponsorship_info::TEXT) as ai_sponsorship,
  COALESCE(host_notes, reflection) as host_notes,
  duration_seconds,
  is_published,
  created_at,
  updated_at
FROM podcast_episodes;

-- 選項 B: 或者建立別名表（如果 PostgreSQL 版本支援）
-- CREATE TABLE episodes AS TABLE podcast_episodes WITH NO DATA;

-- 步驟 6: 建立 updated_at 觸發器（如果不存在）
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 為 podcast_episodes 添加觸發器（如果不存在）
DROP TRIGGER IF EXISTS update_podcast_episodes_updated_at ON podcast_episodes;
CREATE TRIGGER update_podcast_episodes_updated_at 
  BEFORE UPDATE ON podcast_episodes 
  FOR EACH ROW 
  EXECUTE FUNCTION update_updated_at_column();

-- 為其他表添加觸發器
DROP TRIGGER IF EXISTS update_shows_updated_at ON shows;
CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON shows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hosts_updated_at ON hosts;
CREATE TRIGGER update_hosts_updated_at BEFORE UPDATE ON hosts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_comments_updated_at ON comments;
CREATE TRIGGER update_comments_updated_at BEFORE UPDATE ON comments
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_profiles_updated_at ON profiles;
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON profiles
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_affiliate_contents_updated_at ON affiliate_contents;
CREATE TRIGGER update_affiliate_contents_updated_at BEFORE UPDATE ON affiliate_contents
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
