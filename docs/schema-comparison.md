# Schema 比較與整合建議

## 現有 Schema 分析

### PAL_AIAnalyzeLocal 專案的 `podcast_episodes` 表

**現有欄位**：
- `episode_id` (TEXT, UNIQUE) - 外部 ID
- `title`, `description`, `published_at`
- `audio_file_url`, `srt_file_url` - 音檔和字幕檔
- `summary_doc_url`, `reflection_doc_url` - 文件 URL
- `sponsorship_info` (JSONB) - 業配資訊（JSON 格式）
- `summary` (TEXT) - AI 摘要
- `reflection` (TEXT) - 反思內容
- `processed_at` - 處理時間

### PodcastAfterListening 專案需要的完整 Schema

**缺少的表**：
1. `shows` - 節目系列
2. `hosts` - 主持人
3. `show_hosts` - 節目-主持人關聯
4. `tags` - 標籤
5. `episode_tags` - 單集-標籤關聯
6. `comments` - 留言
7. `profiles` - 用戶檔案
8. `affiliate_contents` - 聯盟行銷內容
9. `episode_affiliates` - 單集-聯盟行銷關聯
10. `affiliate_clicks` - 點擊記錄

**`episodes` 表的欄位差異**：

| 當前專案需要 | PAL_AIAnalyzeLocal 有 | 說明 |
|------------|---------------------|------|
| `show_id` (FK) | ❌ | **缺少** - 需要關聯到節目系列 |
| `slug` | ❌ | **缺少** - URL 友善名稱 |
| `ai_summary` | ✅ `summary` | 欄位名稱不同，可對應 |
| `ai_sponsorship` | ✅ `sponsorship_info` (JSONB) | 格式不同（JSONB vs TEXT） |
| `host_notes` | ✅ `reflection` | 欄位名稱不同，可對應 |
| `original_url` | ❌ | **缺少** - 原始 Podcast 連結 |
| `is_published` | ❌ | **缺少** - 發布狀態 |
| `duration_seconds` | ❌ | **缺少** - 節目時長 |
| - | `episode_id` (TEXT) | 外部 ID，可保留作為額外欄位 |
| - | `audio_file_url` | 音檔 URL，可保留 |
| - | `srt_file_url` | 字幕檔 URL，可保留 |
| - | `summary_doc_url` | 摘要文件 URL，可保留 |
| - | `reflection_doc_url` | 反思文件 URL，可保留 |
| - | `processed_at` | 處理時間，可保留 |

## 整合建議

### 方案 1：擴展現有 `podcast_episodes` 表（推薦）

保留現有表，添加缺少的欄位，並建立其他必要的表。

**優點**：
- 保留現有資料
- 向後相容
- 可逐步遷移

**步驟**：
1. 在 `podcast_episodes` 表添加缺少的欄位
2. 建立其他必要的表（shows, hosts, comments 等）
3. 建立資料遷移腳本，將現有資料對應到新結構

### 方案 2：建立新的 `episodes` 表，保留 `podcast_episodes` 作為備份

建立符合當前專案需求的完整 schema，保留舊表作為資料來源。

**優點**：
- 結構清晰
- 符合當前專案設計
- 可從舊表同步資料

## 推薦整合方案

建議採用**方案 1**，因為：
1. 保留現有資料和處理流程
2. 可逐步遷移，風險較低
3. 兩個專案可共用同一個 Supabase 實例

## 需要補充的欄位

在 `podcast_episodes` 表中需要添加：

```sql
ALTER TABLE podcast_episodes
  ADD COLUMN IF NOT EXISTS show_id UUID REFERENCES shows(id),
  ADD COLUMN IF NOT EXISTS slug TEXT,
  ADD COLUMN IF NOT EXISTS original_url TEXT,
  ADD COLUMN IF NOT EXISTS is_published BOOLEAN NOT NULL DEFAULT false,
  ADD COLUMN IF NOT EXISTS duration_seconds INTEGER;

-- 將現有欄位對應到新欄位名稱（如果需要）
-- ALTER TABLE podcast_episodes RENAME COLUMN summary TO ai_summary;
-- ALTER TABLE podcast_episodes RENAME COLUMN reflection TO host_notes;
```

## 資料對應關係

| PAL_AIAnalyzeLocal | PodcastAfterListening | 轉換方式 |
|-------------------|----------------------|---------|
| `episode_id` | 保留作為外部 ID | 可作為 `episodes.episode_id` 或額外欄位 |
| `summary` | `ai_summary` | 直接對應 |
| `reflection` | `host_notes` | 直接對應 |
| `sponsorship_info` (JSONB) | `ai_sponsorship` (TEXT) | 需要將 JSONB 轉換為 TEXT |
| `published_at` | `published_at` | 直接對應（類型需轉換：TIMESTAMPTZ → DATE） |
