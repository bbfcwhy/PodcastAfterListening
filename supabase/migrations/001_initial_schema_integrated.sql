-- Integrated Schema: PodcastAfterListening + PAL_AIAnalyzeLocal
-- 整合兩個專案的 Supabase schema 需求
-- 命名邏輯以 PAL_AIAnalyzeLocal 為主，資料順序以前端網頁需求為主

-- Enable required extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "pg_trgm";

-- ============================================================================
-- Shows table (節目系列)
-- ============================================================================
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
CREATE INDEX IF NOT EXISTS idx_shows_name_search ON shows USING GIN (to_tsvector('simple', name || ' ' || coalesce(description, '')));

-- ============================================================================
-- Hosts table (主持人)
-- ============================================================================
CREATE TABLE IF NOT EXISTS hosts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  bio TEXT,
  avatar_url TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- ShowHosts junction table (節目-主持人關聯)
-- ============================================================================
CREATE TABLE IF NOT EXISTS show_hosts (
  show_id UUID NOT NULL REFERENCES shows(id) ON DELETE CASCADE,
  host_id UUID NOT NULL REFERENCES hosts(id) ON DELETE CASCADE,
  role TEXT DEFAULT 'host',
  PRIMARY KEY (show_id, host_id)
);

-- ============================================================================
-- Podcast Episodes table (單集節目)
-- 使用 podcast_episodes 作為主表，保留 PAL_AIAnalyzeLocal 的命名邏輯
-- 整合兩個專案的所有欄位需求
-- ============================================================================
CREATE TABLE IF NOT EXISTS podcast_episodes (
  -- Primary key
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  
  -- PAL_AIAnalyzeLocal 原有欄位（保留命名）
  episode_id TEXT NOT NULL UNIQUE,  -- 外部 ID，PAL 專案使用
  title TEXT NOT NULL,
  description TEXT,
  published_at TIMESTAMPTZ,  -- PAL 使用 TIMESTAMPTZ，前端需求是 DATE，保留兩者相容
  audio_file_url TEXT,  -- PAL 專案：音檔 URL
  srt_file_url TEXT,  -- PAL 專案：字幕檔 URL
  summary_doc_url TEXT,  -- PAL 專案：摘要文件 URL
  reflection_doc_url TEXT,  -- PAL 專案：反思文件 URL
  sponsorship_info JSONB,  -- PAL 專案：業配資訊（JSONB 格式）
  summary TEXT,  -- PAL 專案：AI 摘要（對應前端的 ai_summary）
  reflection TEXT,  -- PAL 專案：反思內容（對應前端的 host_notes）
  processed_at TIMESTAMPTZ,  -- PAL 專案：處理時間
  
  -- PodcastAfterListening 前端需求欄位
  show_id UUID REFERENCES shows(id) ON DELETE SET NULL,  -- 所屬節目系列（可為空，允許逐步遷移）
  slug TEXT,  -- URL 友善名稱
  original_url TEXT,  -- 原始 Podcast 連結
  is_published BOOLEAN NOT NULL DEFAULT false,  -- 是否公開顯示
  duration_seconds INTEGER,  -- 節目時長（秒）
  
  -- 前端需求的別名欄位（與 PAL 欄位對應，方便查詢）
  -- 這些欄位可以透過計算欄位或視圖提供，但為了效能我們也建立實際欄位
  ai_summary TEXT,  -- 對應 summary（前端使用）
  ai_sponsorship TEXT,  -- 對應 sponsorship_info（前端使用，從 JSONB 轉換）
  host_notes TEXT,  -- 對應 reflection（前端使用）
  
  -- Timestamps
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
  -- 注意：unique_show_slug 約束在 ALTER TABLE 部分處理，以支援 PostgreSQL < 15
);

-- ============================================================================
-- Add missing columns to existing podcast_episodes table (if table already exists)
-- 如果表已存在，添加缺少的欄位
-- ============================================================================
ALTER TABLE podcast_episodes
  ADD COLUMN IF NOT EXISTS show_id UUID,
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS original_url TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER,
  ADD COLUMN IF NOT EXISTS ai_summary TEXT,
  ADD COLUMN IF NOT EXISTS ai_sponsorship TEXT,
  ADD COLUMN IF NOT EXISTS host_notes TEXT;

-- Add foreign key constraint for show_id (if not exists)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'podcast_episodes_show_id_fkey'
    AND table_name = 'podcast_episodes'
  ) THEN
    ALTER TABLE podcast_episodes
      ADD CONSTRAINT podcast_episodes_show_id_fkey 
      FOREIGN KEY (show_id) REFERENCES shows(id) ON DELETE SET NULL;
  END IF;
END $$;

-- Add unique constraint for show_id + slug (if not exists)
-- 注意：使用部分唯一索引來處理 NULL 值，因為 UNIQUE NULLS NOT DISTINCT 需要 PostgreSQL 15+
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints 
    WHERE constraint_name = 'unique_show_slug'
    AND table_name = 'podcast_episodes'
  ) THEN
    -- 嘗試使用 PostgreSQL 15+ 語法
    BEGIN
      ALTER TABLE podcast_episodes
        ADD CONSTRAINT unique_show_slug UNIQUE NULLS NOT DISTINCT (show_id, slug);
    EXCEPTION WHEN OTHERS THEN
      -- 如果失敗（PostgreSQL < 15），使用部分唯一索引
      CREATE UNIQUE INDEX IF NOT EXISTS unique_show_slug_idx 
        ON podcast_episodes(show_id, slug) 
        WHERE show_id IS NOT NULL AND slug IS NOT NULL;
    END;
  END IF;
END $$;

-- Indexes for podcast_episodes
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_episode_id ON podcast_episodes(episode_id);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_show_id ON podcast_episodes(show_id) WHERE show_id IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_slug ON podcast_episodes(slug) WHERE slug IS NOT NULL;
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_published_at ON podcast_episodes(published_at DESC);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_processed_at ON podcast_episodes(processed_at DESC);
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_is_published ON podcast_episodes(is_published) WHERE is_published = true;
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_created_at ON podcast_episodes(created_at DESC);
-- Full-text search index
CREATE INDEX IF NOT EXISTS idx_podcast_episodes_fts ON podcast_episodes USING GIN (
  to_tsvector('simple', 
    title || ' ' || 
    coalesce(ai_summary, summary, '') || ' ' || 
    coalesce(host_notes, reflection, '')
  )
);

-- ============================================================================
-- Tags table (標籤)
-- ============================================================================
CREATE TABLE IF NOT EXISTS tags (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  slug TEXT NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- EpisodeTags junction table (單集-標籤關聯)
-- ============================================================================
CREATE TABLE IF NOT EXISTS episode_tags (
  episode_id UUID NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  tag_id UUID NOT NULL REFERENCES tags(id) ON DELETE CASCADE,
  PRIMARY KEY (episode_id, tag_id)
);

-- ============================================================================
-- Comments table (留言)
-- ============================================================================
CREATE TABLE IF NOT EXISTS comments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  episode_id UUID NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
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

-- ============================================================================
-- Profiles table (用戶檔案，擴展 auth.users)
-- ============================================================================
CREATE TABLE IF NOT EXISTS profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT,
  avatar_url TEXT,
  is_admin BOOLEAN NOT NULL DEFAULT false,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- ============================================================================
-- AffiliateContents table (聯盟行銷內容)
-- ============================================================================
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

-- ============================================================================
-- EpisodeAffiliates junction table (單集-聯盟行銷關聯)
-- ============================================================================
CREATE TABLE IF NOT EXISTS episode_affiliates (
  episode_id UUID NOT NULL REFERENCES podcast_episodes(id) ON DELETE CASCADE,
  affiliate_id UUID NOT NULL REFERENCES affiliate_contents(id) ON DELETE CASCADE,
  position INTEGER DEFAULT 0,
  PRIMARY KEY (episode_id, affiliate_id)
);

-- ============================================================================
-- AffiliateClicks table (聯盟行銷點擊記錄)
-- ============================================================================
CREATE TABLE IF NOT EXISTS affiliate_clicks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  affiliate_id UUID NOT NULL REFERENCES affiliate_contents(id) ON DELETE CASCADE,
  episode_id UUID REFERENCES podcast_episodes(id) ON DELETE SET NULL,
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  clicked_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  user_agent TEXT,
  referer TEXT
);

CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_affiliate_id ON affiliate_clicks(affiliate_id);
CREATE INDEX IF NOT EXISTS idx_affiliate_clicks_clicked_at ON affiliate_clicks(clicked_at);

-- ============================================================================
-- Updated_at trigger function
-- ============================================================================
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Apply updated_at triggers
DROP TRIGGER IF EXISTS update_shows_updated_at ON shows;
CREATE TRIGGER update_shows_updated_at BEFORE UPDATE ON shows
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_hosts_updated_at ON hosts;
CREATE TRIGGER update_hosts_updated_at BEFORE UPDATE ON hosts
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

DROP TRIGGER IF EXISTS update_podcast_episodes_updated_at ON podcast_episodes;
CREATE TRIGGER update_podcast_episodes_updated_at BEFORE UPDATE ON podcast_episodes
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

-- ============================================================================
-- Data synchronization triggers
-- 同步 PAL 欄位與前端欄位，確保資料一致性
-- ============================================================================

-- 當 summary 更新時，同步到 ai_summary
CREATE OR REPLACE FUNCTION sync_summary_to_ai_summary()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.summary IS DISTINCT FROM OLD.summary THEN
    NEW.ai_summary = NEW.summary;
  END IF;
  IF NEW.ai_summary IS DISTINCT FROM OLD.ai_summary AND (NEW.summary IS NULL OR NEW.summary = '') THEN
    NEW.summary = NEW.ai_summary;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_summary_trigger ON podcast_episodes;
CREATE TRIGGER sync_summary_trigger
  BEFORE INSERT OR UPDATE ON podcast_episodes
  FOR EACH ROW
  EXECUTE FUNCTION sync_summary_to_ai_summary();

-- 當 reflection 更新時，同步到 host_notes
CREATE OR REPLACE FUNCTION sync_reflection_to_host_notes()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.reflection IS DISTINCT FROM OLD.reflection THEN
    NEW.host_notes = NEW.reflection;
  END IF;
  IF NEW.host_notes IS DISTINCT FROM OLD.host_notes AND (NEW.reflection IS NULL OR NEW.reflection = '') THEN
    NEW.reflection = NEW.host_notes;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_reflection_trigger ON podcast_episodes;
CREATE TRIGGER sync_reflection_trigger
  BEFORE INSERT OR UPDATE ON podcast_episodes
  FOR EACH ROW
  EXECUTE FUNCTION sync_reflection_to_host_notes();

-- 當 sponsorship_info 更新時，同步到 ai_sponsorship（JSONB → TEXT）
CREATE OR REPLACE FUNCTION sync_sponsorship_info_to_ai_sponsorship()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.sponsorship_info IS DISTINCT FROM OLD.sponsorship_info THEN
    NEW.ai_sponsorship = CASE 
      WHEN NEW.sponsorship_info IS NULL THEN NULL
      ELSE NEW.sponsorship_info::TEXT
    END;
  END IF;
  IF NEW.ai_sponsorship IS DISTINCT FROM OLD.ai_sponsorship AND (NEW.sponsorship_info IS NULL) THEN
    -- 嘗試將 TEXT 轉回 JSONB（如果格式正確）
    BEGIN
      NEW.sponsorship_info = NEW.ai_sponsorship::JSONB;
    EXCEPTION WHEN OTHERS THEN
      -- 如果轉換失敗，保持原值
      NULL;
    END;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS sync_sponsorship_trigger ON podcast_episodes;
CREATE TRIGGER sync_sponsorship_trigger
  BEFORE INSERT OR UPDATE ON podcast_episodes
  FOR EACH ROW
  EXECUTE FUNCTION sync_sponsorship_info_to_ai_sponsorship();

-- ============================================================================
-- Episodes view (前端別名視圖)
-- 提供統一的 episodes 視圖，讓前端代碼可以使用 episodes 表名
-- 同時映射欄位名稱以符合前端需求
-- 
-- 注意：PostgreSQL 視圖更新有限制，寫入操作建議直接使用 podcast_episodes 表
-- 但為了向後相容，我們建立一個 INSTEAD OF 觸發器來處理視圖的寫入操作
-- ============================================================================
CREATE OR REPLACE VIEW episodes AS
SELECT 
  id,
  show_id,
  title,
  slug,
  published_at::DATE as published_at,  -- 轉換為 DATE 類型以符合前端需求
  original_url,
  -- 優先使用前端欄位，如果為空則使用 PAL 欄位
  COALESCE(ai_summary, summary) as ai_summary,
  COALESCE(ai_sponsorship, sponsorship_info::TEXT) as ai_sponsorship,
  COALESCE(host_notes, reflection) as host_notes,
  duration_seconds,
  is_published,
  created_at,
  updated_at,
  -- 保留 PAL 專案的欄位供查詢使用
  episode_id,
  description,
  audio_file_url,
  srt_file_url,
  summary_doc_url,
  reflection_doc_url,
  sponsorship_info,
  summary,
  reflection,
  processed_at
FROM podcast_episodes;

-- 建立 INSTEAD OF 觸發器以支援透過視圖進行寫入操作
-- INSERT 觸發器
CREATE OR REPLACE FUNCTION episodes_insert_trigger()
RETURNS TRIGGER AS $$
DECLARE
  inserted_id UUID;
BEGIN
  INSERT INTO podcast_episodes (
    show_id, title, slug, published_at, original_url,
    ai_summary, ai_sponsorship, host_notes,
    duration_seconds, is_published,
    -- 同步到 PAL 欄位
    summary, reflection, sponsorship_info,
    episode_id
  ) VALUES (
    NEW.show_id, NEW.title, NEW.slug, NEW.published_at::TIMESTAMPTZ, NEW.original_url,
    NEW.ai_summary, NEW.ai_sponsorship, NEW.host_notes,
    NEW.duration_seconds, COALESCE(NEW.is_published, false),
    -- 同步到 PAL 欄位
    NEW.ai_summary, NEW.host_notes,
    CASE WHEN NEW.ai_sponsorship IS NOT NULL THEN NEW.ai_sponsorship::JSONB ELSE NULL END,
    COALESCE(NEW.episode_id, gen_random_uuid()::TEXT)
  )
  RETURNING id INTO inserted_id;
  
  -- 更新 NEW 的 id
  NEW.id = inserted_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS episodes_insert ON episodes;
CREATE TRIGGER episodes_insert
  INSTEAD OF INSERT ON episodes
  FOR EACH ROW
  EXECUTE FUNCTION episodes_insert_trigger();

-- UPDATE 觸發器
CREATE OR REPLACE FUNCTION episodes_update_trigger()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE podcast_episodes
  SET
    show_id = COALESCE(NEW.show_id, OLD.show_id),
    title = COALESCE(NEW.title, OLD.title),
    slug = COALESCE(NEW.slug, OLD.slug),
    published_at = COALESCE(NEW.published_at::TIMESTAMPTZ, OLD.published_at),
    original_url = COALESCE(NEW.original_url, OLD.original_url),
    ai_summary = COALESCE(NEW.ai_summary, OLD.ai_summary),
    ai_sponsorship = COALESCE(NEW.ai_sponsorship, OLD.ai_sponsorship),
    host_notes = COALESCE(NEW.host_notes, OLD.host_notes),
    duration_seconds = COALESCE(NEW.duration_seconds, OLD.duration_seconds),
    is_published = COALESCE(NEW.is_published, OLD.is_published),
    -- 同步到 PAL 欄位
    summary = COALESCE(NEW.ai_summary, OLD.ai_summary, OLD.summary),
    reflection = COALESCE(NEW.host_notes, OLD.host_notes, OLD.reflection),
    sponsorship_info = CASE 
      WHEN NEW.ai_sponsorship IS NOT NULL THEN NEW.ai_sponsorship::JSONB
      WHEN OLD.ai_sponsorship IS NOT NULL THEN OLD.ai_sponsorship::JSONB
      ELSE OLD.sponsorship_info
    END
  WHERE id = OLD.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS episodes_update ON episodes;
CREATE TRIGGER episodes_update
  INSTEAD OF UPDATE ON episodes
  FOR EACH ROW
  EXECUTE FUNCTION episodes_update_trigger();

-- DELETE 觸發器
CREATE OR REPLACE FUNCTION episodes_delete_trigger()
RETURNS TRIGGER AS $$
BEGIN
  DELETE FROM podcast_episodes WHERE id = OLD.id;
  RETURN OLD;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS episodes_delete ON episodes;
CREATE TRIGGER episodes_delete
  INSTEAD OF DELETE ON episodes
  FOR EACH ROW
  EXECUTE FUNCTION episodes_delete_trigger();

-- ============================================================================
-- Initial data migration helper function
-- 協助將現有的 PAL 資料對應到新欄位
-- ============================================================================
CREATE OR REPLACE FUNCTION migrate_pal_data_to_frontend_fields()
RETURNS void AS $$
BEGIN
  -- 同步 summary → ai_summary
  UPDATE podcast_episodes
  SET ai_summary = summary
  WHERE ai_summary IS NULL AND summary IS NOT NULL;
  
  -- 同步 reflection → host_notes
  UPDATE podcast_episodes
  SET host_notes = reflection
  WHERE host_notes IS NULL AND reflection IS NOT NULL;
  
  -- 同步 sponsorship_info → ai_sponsorship
  UPDATE podcast_episodes
  SET ai_sponsorship = sponsorship_info::TEXT
  WHERE ai_sponsorship IS NULL AND sponsorship_info IS NOT NULL;
END;
$$ LANGUAGE plpgsql;

-- 執行初始資料遷移（如果表中有資料）
SELECT migrate_pal_data_to_frontend_fields();
