# Schema 整合總結

## 整合完成

已成功整合 PodcastAfterListening 和 PAL_AIAnalyzeLocal 兩個專案的 Supabase schema 需求。

## 核心決策

### 1. 主表命名：`podcast_episodes`

- **保留 PAL_AIAnalyzeLocal 的命名邏輯**：使用 `podcast_episodes` 作為主表名稱
- **建立 `episodes` 視圖**：讓前端代碼可以繼續使用 `episodes` 表名查詢
- **雙向同步**：透過觸發器自動同步 PAL 欄位與前端欄位

### 2. 欄位整合策略

#### PAL_AIAnalyzeLocal 原有欄位（保留）
- `episode_id` (TEXT, UNIQUE) - 外部 ID
- `summary` - AI 摘要
- `reflection` - 反思內容
- `sponsorship_info` (JSONB) - 業配資訊
- `audio_file_url`, `srt_file_url` - 音檔和字幕
- `summary_doc_url`, `reflection_doc_url` - 文件 URL
- `processed_at` - 處理時間
- `published_at` (TIMESTAMPTZ) - 發布時間

#### PodcastAfterListening 前端需求欄位（新增）
- `show_id` (UUID, FK) - 所屬節目系列
- `slug` (TEXT) - URL 友善名稱
- `original_url` (TEXT) - 原始 Podcast 連結
- `is_published` (BOOLEAN) - 發布狀態
- `duration_seconds` (INTEGER) - 節目時長
- `ai_summary` (TEXT) - 對應 `summary`
- `ai_sponsorship` (TEXT) - 對應 `sponsorship_info`
- `host_notes` (TEXT) - 對應 `reflection`

### 3. 資料同步機制

透過 PostgreSQL 觸發器自動同步：

1. **summary ↔ ai_summary**：雙向同步
2. **reflection ↔ host_notes**：雙向同步
3. **sponsorship_info ↔ ai_sponsorship**：JSONB ↔ TEXT 轉換

### 4. 視圖映射

建立 `episodes` 視圖，提供：
- 統一的欄位名稱（前端使用）
- 自動欄位對應（優先使用前端欄位，空值時使用 PAL 欄位）
- 類型轉換（`published_at` TIMESTAMPTZ → DATE）

## 遷移檔案

### 1. `001_initial_schema_integrated.sql`
- 建立所有必要的表
- 整合兩個專案的欄位需求
- 建立同步觸發器
- 建立 `episodes` 視圖
- 執行初始資料遷移

### 2. `002_rls_policies_integrated.sql`
- 啟用所有表的 RLS
- 建立存取控制策略
- 支援 PAL 專案的服務角色存取
- 支援前端網頁的公開讀取

### 3. `003_functions_integrated.sql`
- `search_episodes()` - 全文搜尋函數
- `check_spam()` - 垃圾留言檢查
- `get_episode_by_slugs()` - 透過 slug 取得單集
- `get_episodes_by_show()` - 取得節目的所有單集

## 使用方式

### PAL_AIAnalyzeLocal 專案

繼續使用 `podcast_episodes` 表，使用原有欄位：
- `episode_id`, `summary`, `reflection`, `sponsorship_info` 等

### PodcastAfterListening 專案

可以使用 `episodes` 視圖或直接使用 `podcast_episodes` 表：

```typescript
// 方式 1：使用視圖（推薦，向後相容）
const { data } = await supabase
  .from("episodes")
  .select("*")
  .eq("is_published", true);

// 方式 2：直接使用 podcast_episodes 表
const { data } = await supabase
  .from("podcast_episodes")
  .select("*")
  .eq("is_published", true);
```

## 資料遷移步驟

1. **執行整合遷移腳本**：
   ```sql
   -- 在 Supabase SQL Editor 中依序執行
   -- 001_initial_schema_integrated.sql
   -- 002_rls_policies_integrated.sql
   -- 003_functions_integrated.sql
   ```

2. **建立節目系列資料**：
   ```sql
   INSERT INTO shows (name, slug, description)
   VALUES ('節目名稱', 'show-slug', '節目描述');
   ```

3. **更新現有單集資料**：
   ```sql
   -- 補充缺少的欄位
   UPDATE podcast_episodes
   SET 
     show_id = (SELECT id FROM shows LIMIT 1),  -- 設定對應的節目
     slug = episode_id,  -- 使用 episode_id 作為 slug（或自行生成）
     original_url = 'https://...',  -- 補充原始連結
     is_published = true  -- 設定發布狀態
   WHERE show_id IS NULL;
   ```

4. **驗證資料同步**：
   ```sql
   -- 檢查欄位同步是否正常
   SELECT 
     id,
     summary,
     ai_summary,
     reflection,
     host_notes,
     sponsorship_info,
     ai_sponsorship
   FROM podcast_episodes
   LIMIT 10;
   ```

## 注意事項

1. **外鍵約束**：`show_id` 可為 NULL，允許逐步遷移現有資料
2. **視圖更新限制**：PostgreSQL 視圖更新有限制，建議直接操作 `podcast_episodes` 表進行寫入
3. **欄位優先順序**：視圖中優先使用前端欄位（`ai_summary`），如果為空則使用 PAL 欄位（`summary`）
4. **類型轉換**：`published_at` 在視圖中轉換為 DATE，但底層仍為 TIMESTAMPTZ

## 向後相容性

- ✅ PAL_AIAnalyzeLocal 專案可繼續使用原有欄位名稱
- ✅ PodcastAfterListening 專案可使用 `episodes` 視圖或直接使用 `podcast_episodes` 表
- ✅ 自動同步機制確保兩個專案的資料一致性
- ✅ 保留所有 PAL 專案的欄位，不影響現有功能

## 後續優化建議

1. **統一欄位名稱**：長期可考慮統一使用前端欄位名稱，逐步淘汰 PAL 欄位
2. **資料驗證**：建立檢查函數確保 `show_id` 不為 NULL（遷移完成後）
3. **效能優化**：視需要調整索引策略
4. **文件更新**：更新兩個專案的 API 文件，說明欄位對應關係
