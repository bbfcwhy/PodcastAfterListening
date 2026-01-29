# Schema 整合完成

## ✅ 整合狀態

已成功整合 PodcastAfterListening 和 PAL_AIAnalyzeLocal 兩個專案的 Supabase schema 需求。

## 📁 建立的檔案

### 遷移腳本
1. **`supabase/migrations/001_initial_schema_integrated.sql`**
   - 整合的資料表結構
   - 保留 PAL_AIAnalyzeLocal 的命名邏輯（`podcast_episodes`）
   - 添加前端網頁需要的欄位
   - 建立欄位同步觸發器
   - 建立 `episodes` 視圖（支援讀寫）

2. **`supabase/migrations/002_rls_policies_integrated.sql`**
   - Row Level Security 策略
   - 支援 PAL 專案的服務角色存取
   - 支援前端網頁的公開讀取

3. **`supabase/migrations/003_functions_integrated.sql`**
   - `search_episodes()` - 全文搜尋
   - `check_spam()` - 垃圾留言檢查
   - `get_episode_by_slugs()` - 透過 slug 取得單集
   - `get_episodes_by_show()` - 取得節目的所有單集

### 文件
1. **`docs/schema-integration-summary.md`** - 整合總結
2. **`docs/schema-migration-guide.md`** - 遷移指南
3. **`docs/INTEGRATION_COMPLETE.md`** - 本文件

## 🎯 核心特性

### 1. 雙向欄位同步
- `summary` ↔ `ai_summary`
- `reflection` ↔ `host_notes`
- `sponsorship_info` (JSONB) ↔ `ai_sponsorship` (TEXT)

### 2. 向後相容
- PAL_AIAnalyzeLocal 可繼續使用原有欄位名稱
- PodcastAfterListening 可使用 `episodes` 視圖
- 自動同步確保資料一致性

### 3. 統一查詢介面
- 建立 `episodes` 視圖，支援讀寫操作
- 前端代碼可繼續使用 `episodes` 表名
- 視圖自動處理欄位映射和類型轉換

## 🚀 下一步

### 1. 執行遷移（在 Supabase SQL Editor）

```sql
-- 依序執行以下腳本：
-- 001_initial_schema_integrated.sql
-- 002_rls_policies_integrated.sql
-- 003_functions_integrated.sql
```

### 2. 資料遷移（如果已有 PAL 資料）

```sql
-- 建立預設節目系列
INSERT INTO shows (name, slug, description)
VALUES ('預設節目', 'default-show', '預設節目系列')
ON CONFLICT (slug) DO NOTHING;

-- 更新現有單集資料
UPDATE podcast_episodes
SET 
  show_id = (SELECT id FROM shows WHERE slug = 'default-show' LIMIT 1),
  slug = COALESCE(slug, episode_id),
  original_url = COALESCE(original_url, 'https://example.com'),
  is_published = COALESCE(is_published, true),
  ai_summary = COALESCE(ai_summary, summary),
  host_notes = COALESCE(host_notes, reflection),
  ai_sponsorship = COALESCE(ai_sponsorship, sponsorship_info::TEXT)
WHERE show_id IS NULL OR slug IS NULL;
```

### 3. 驗證整合

```sql
-- 檢查表結構
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'podcast_episodes'
ORDER BY ordinal_position;

-- 檢查視圖
SELECT * FROM episodes LIMIT 1;

-- 測試欄位同步
INSERT INTO episodes (show_id, title, slug, original_url, ai_summary, is_published)
SELECT id, '測試單集', 'test-episode', 'https://test.com', '測試摘要', true
FROM shows LIMIT 1;

-- 檢查同步
SELECT id, summary, ai_summary, reflection, host_notes
FROM podcast_episodes
WHERE slug = 'test-episode';
```

## 📝 使用說明

### PAL_AIAnalyzeLocal 專案

繼續使用 `podcast_episodes` 表和原有欄位：

```python
# Python 範例
episode = supabase.table("podcast_episodes").insert({
    "episode_id": "external-id",
    "title": "單集標題",
    "summary": "AI 摘要",
    "reflection": "反思內容",
    "sponsorship_info": {"key": "value"}
}).execute()
```

### PodcastAfterListening 專案

使用 `episodes` 視圖（推薦）或直接使用 `podcast_episodes` 表：

```typescript
// TypeScript 範例 - 使用視圖
const { data } = await supabase
  .from("episodes")
  .insert({
    show_id: "show-uuid",
    title: "單集標題",
    slug: "episode-slug",
    original_url: "https://...",
    ai_summary: "摘要",
    is_published: true
  })
  .select();

// 或直接使用 podcast_episodes 表
const { data } = await supabase
  .from("podcast_episodes")
  .insert({
    show_id: "show-uuid",
    title: "單集標題",
    slug: "episode-slug",
    summary: "摘要",  // 會自動同步到 ai_summary
    is_published: true,
    episode_id: "external-id"
  })
  .select();
```

## ⚠️ 注意事項

1. **視圖更新限制**：雖然我們建立了 INSTEAD OF 觸發器支援視圖寫入，但複雜的更新操作建議直接使用 `podcast_episodes` 表。

2. **外鍵約束**：`show_id` 可為 NULL，允許逐步遷移現有資料。遷移完成後可考慮添加 NOT NULL 約束。

3. **欄位優先順序**：視圖中優先使用前端欄位（`ai_summary`），如果為空則使用 PAL 欄位（`summary`）。

4. **類型轉換**：`published_at` 在視圖中轉換為 DATE，但底層仍為 TIMESTAMPTZ。

## 🔍 疑難排解

### 問題：視圖無法更新

**解決方案**：檢查觸發器是否正確建立：
```sql
SELECT trigger_name, event_object_table, action_timing, event_manipulation
FROM information_schema.triggers
WHERE event_object_table = 'episodes';
```

### 問題：欄位未同步

**解決方案**：檢查同步觸發器：
```sql
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'podcast_episodes'
  AND trigger_name LIKE '%sync%';
```

### 問題：RLS 策略阻擋存取

**解決方案**：檢查 RLS 策略：
```sql
SELECT schemaname, tablename, policyname, permissive, roles, cmd, qual
FROM pg_policies
WHERE tablename = 'podcast_episodes';
```

## 📚 相關文件

- [整合總結](./schema-integration-summary.md)
- [遷移指南](./schema-migration-guide.md)
- [Schema 比較](./schema-comparison.md)

## ✨ 完成

整合已完成！兩個專案現在可以共用同一個 Supabase 資料庫，同時保持各自的命名邏輯和資料結構。

## ✅ 遷移執行狀態

**三個 SQL 遷移腳本已成功執行**：
1. ✅ `001_initial_schema_integrated.sql` - 資料表結構
2. ✅ `002_rls_policies_integrated.sql` - RLS 策略
3. ✅ `003_functions_integrated.sql` - 資料庫函數

## 🔍 驗證建議

執行驗證腳本確認整合是否成功：

```sql
-- 在 Supabase SQL Editor 中執行
-- supabase/migrations/004_verify_integration.sql
```

詳細驗證步驟請參考：[Schema 整合完成確認](./schema-integration-complete.md)
