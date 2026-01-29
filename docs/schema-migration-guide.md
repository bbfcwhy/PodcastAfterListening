# Schema 遷移指南

## 快速開始

### 1. 執行遷移腳本

在 Supabase SQL Editor 中依序執行以下遷移腳本：

```sql
-- 步驟 1：建立整合的 schema
-- 執行：supabase/migrations/001_initial_schema_integrated.sql

-- 步驟 2：設定 RLS 策略
-- 執行：supabase/migrations/002_rls_policies_integrated.sql

-- 步驟 3：建立資料庫函數
-- 執行：supabase/migrations/003_functions_integrated.sql
```

### 2. 驗證遷移

```sql
-- 檢查表是否建立成功
SELECT table_name 
FROM information_schema.tables 
WHERE table_schema = 'public' 
  AND table_name IN ('podcast_episodes', 'shows', 'hosts', 'comments', 'profiles')
ORDER BY table_name;

-- 檢查視圖是否建立成功
SELECT table_name 
FROM information_schema.views 
WHERE table_schema = 'public' 
  AND table_name = 'episodes';

-- 檢查觸發器是否建立成功
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE trigger_schema = 'public'
  AND event_object_table IN ('podcast_episodes', 'episodes')
ORDER BY trigger_name;
```

## 資料遷移

### 如果已有 PAL_AIAnalyzeLocal 的資料

#### 步驟 1：建立節目系列

```sql
-- 建立一個預設節目系列（如果還沒有）
INSERT INTO shows (name, slug, description, original_url)
VALUES (
  '預設節目',
  'default-show',
  '預設節目系列',
  'https://example.com'
)
ON CONFLICT (slug) DO NOTHING;
```

#### 步驟 2：更新現有單集資料

```sql
-- 補充缺少的欄位
UPDATE podcast_episodes
SET 
  -- 設定 show_id（使用預設節目或根據 episode_id 判斷）
  show_id = (SELECT id FROM shows WHERE slug = 'default-show' LIMIT 1),
  
  -- 使用 episode_id 作為 slug（如果 slug 為空）
  slug = COALESCE(slug, episode_id),
  
  -- 補充 original_url（如果為空）
  original_url = COALESCE(original_url, 'https://example.com'),
  
  -- 設定發布狀態（根據需要調整）
  is_published = COALESCE(is_published, true),
  
  -- 同步欄位（如果尚未同步）
  ai_summary = COALESCE(ai_summary, summary),
  host_notes = COALESCE(host_notes, reflection),
  ai_sponsorship = COALESCE(ai_sponsorship, sponsorship_info::TEXT)
WHERE show_id IS NULL OR slug IS NULL;
```

#### 步驟 3：驗證資料同步

```sql
-- 檢查欄位同步是否正常
SELECT 
  id,
  episode_id,
  title,
  show_id,
  slug,
  summary,
  ai_summary,
  reflection,
  host_notes,
  sponsorship_info,
  ai_sponsorship,
  is_published
FROM podcast_episodes
LIMIT 10;
```

### 如果從零開始

#### 步驟 1：建立節目系列

```sql
INSERT INTO shows (name, slug, description, cover_image_url, original_url)
VALUES 
  ('節目名稱 1', 'show-1', '節目描述', 'https://example.com/cover.jpg', 'https://example.com'),
  ('節目名稱 2', 'show-2', '節目描述', 'https://example.com/cover2.jpg', 'https://example.com');
```

#### 步驟 2：建立主持人

```sql
INSERT INTO hosts (name, bio, avatar_url)
VALUES 
  ('主持人 1', '主持人簡介', 'https://example.com/avatar1.jpg'),
  ('主持人 2', '主持人簡介', 'https://example.com/avatar2.jpg');
```

#### 步驟 3：關聯節目和主持人

```sql
INSERT INTO show_hosts (show_id, host_id, role)
SELECT s.id, h.id, 'host'
FROM shows s, hosts h
WHERE s.slug = 'show-1' AND h.name = '主持人 1';
```

#### 步驟 4：建立單集（透過視圖）

```sql
-- 使用 episodes 視圖建立單集（會自動同步到 podcast_episodes 表）
INSERT INTO episodes (
  show_id, title, slug, published_at, original_url,
  ai_summary, ai_sponsorship, host_notes,
  duration_seconds, is_published, episode_id
)
SELECT 
  id,  -- show_id
  '單集標題',
  'episode-slug',
  '2024-01-01'::DATE,
  'https://example.com/episode',
  'AI 摘要內容',
  '業配內容',
  '站長心得',
  3600,  -- 1 小時
  true,
  'external-episode-id-123'
FROM shows
WHERE slug = 'show-1';
```

## 使用方式

### 讀取操作（使用 `episodes` 視圖）

```typescript
// 前端代碼可以繼續使用 episodes 視圖
const { data } = await supabase
  .from("episodes")
  .select("*")
  .eq("is_published", true)
  .order("published_at", { ascending: false });
```

### 寫入操作（使用 `episodes` 視圖或 `podcast_episodes` 表）

#### 方式 1：使用 `episodes` 視圖（推薦，向後相容）

```typescript
// 插入
const { data } = await supabase
  .from("episodes")
  .insert({
    show_id: "show-uuid",
    title: "單集標題",
    slug: "episode-slug",
    original_url: "https://...",
    ai_summary: "摘要",
    is_published: true,
    episode_id: "external-id"  // PAL 專案使用
  })
  .select();

// 更新
const { data } = await supabase
  .from("episodes")
  .update({ ai_summary: "新摘要" })
  .eq("id", "episode-uuid")
  .select();

// 刪除
await supabase
  .from("episodes")
  .delete()
  .eq("id", "episode-uuid");
```

#### 方式 2：直接使用 `podcast_episodes` 表（更直接）

```typescript
// 插入
const { data } = await supabase
  .from("podcast_episodes")
  .insert({
    show_id: "show-uuid",
    title: "單集標題",
    slug: "episode-slug",
    original_url: "https://...",
    summary: "摘要",  // 會自動同步到 ai_summary
    reflection: "心得",  // 會自動同步到 host_notes
    sponsorship_info: { "key": "value" },  // JSONB，會自動同步到 ai_sponsorship
    is_published: true,
    episode_id: "external-id"
  })
  .select();
```

## 欄位對應關係

| PAL_AIAnalyzeLocal | PodcastAfterListening | 同步方式 |
|-------------------|----------------------|---------|
| `summary` | `ai_summary` | 雙向自動同步（觸發器） |
| `reflection` | `host_notes` | 雙向自動同步（觸發器） |
| `sponsorship_info` (JSONB) | `ai_sponsorship` (TEXT) | 雙向自動同步（觸發器） |
| `published_at` (TIMESTAMPTZ) | `published_at` (DATE) | 視圖轉換 |

## 常見問題

### Q: 視圖可以更新嗎？

A: 可以。我們建立了 INSTEAD OF 觸發器，讓 `episodes` 視圖支援 INSERT/UPDATE/DELETE 操作。這些操作會自動映射到 `podcast_episodes` 表，並觸發欄位同步。

### Q: 如果我只更新 `summary`，`ai_summary` 會自動更新嗎？

A: 會。觸發器會自動同步 `summary` → `ai_summary`。

### Q: 如果我只更新 `ai_summary`，`summary` 會自動更新嗎？

A: 會。觸發器會自動同步 `ai_summary` → `summary`（如果 `summary` 為空）。

### Q: `sponsorship_info` 是 JSONB，如何轉換為 TEXT？

A: 觸發器會自動處理 JSONB ↔ TEXT 的轉換。寫入 `sponsorship_info` 時會同步到 `ai_sponsorship`，寫入 `ai_sponsorship` 時會嘗試轉換為 JSONB 並同步到 `sponsorship_info`。

### Q: 如何查詢 PAL 專案的專屬欄位？

A: 可以直接查詢 `podcast_episodes` 表，或透過 `episodes` 視圖查詢（視圖包含所有欄位）。

```sql
-- 查詢 PAL 專案的欄位
SELECT 
  episode_id,
  audio_file_url,
  srt_file_url,
  summary_doc_url,
  reflection_doc_url,
  processed_at
FROM podcast_episodes;

-- 或透過視圖查詢
SELECT 
  episode_id,
  audio_file_url,
  srt_file_url,
  summary_doc_url,
  reflection_doc_url,
  processed_at
FROM episodes;
```

## 回滾方案

如果需要回滾到原始 schema：

```sql
-- 1. 刪除視圖和觸發器
DROP VIEW IF EXISTS episodes CASCADE;
DROP TRIGGER IF EXISTS episodes_insert ON episodes;
DROP TRIGGER IF EXISTS episodes_update ON episodes;
DROP TRIGGER IF EXISTS episodes_delete ON episodes;

-- 2. 刪除新增的欄位（如果不需要）
ALTER TABLE podcast_episodes
  DROP COLUMN IF EXISTS show_id,
  DROP COLUMN IF EXISTS slug,
  DROP COLUMN IF EXISTS original_url,
  DROP COLUMN IF EXISTS is_published,
  DROP COLUMN IF EXISTS duration_seconds,
  DROP COLUMN IF EXISTS ai_summary,
  DROP COLUMN IF EXISTS ai_sponsorship,
  DROP COLUMN IF EXISTS host_notes;

-- 3. 刪除其他表（如果不需要）
DROP TABLE IF EXISTS shows CASCADE;
DROP TABLE IF EXISTS hosts CASCADE;
DROP TABLE IF EXISTS comments CASCADE;
-- ... 其他表
```

## 下一步

1. ✅ 執行遷移腳本
2. ✅ 驗證資料遷移
3. ✅ 測試讀寫操作
4. ✅ 更新應用程式代碼（如果需要）
5. ✅ 監控資料同步是否正常
