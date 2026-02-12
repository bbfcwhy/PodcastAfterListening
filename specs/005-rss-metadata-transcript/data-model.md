# Data Model: 節目／單集 RSS 欄位擴充

**Date**: 2026-01-30
**Branch**: `005-rss-metadata-transcript`

本文件描述在既有 Show / Episode（podcast_episodes）結構上，為支援「從 RSS 同步並顯示」而新增或明確對應的欄位與行為。既有表結構見 `001_initial_schema_integrated.sql` 與 `specs/001-podcast-review-site/data-model.md`。

## 實體擴充摘要

- **Show（節目）**：新增 `rss_feed_url`、`hosting_provided_by`、`show_categories`（RSS itunes:category）；其餘節目圖片、名稱、主持人、關於已存在，由 RSS 同步寫入。
- **Episode（podcast_episodes）**：單集「節目自己填的說明」對應既有 `description`；`duration_seconds` 已存在，由 RSS 同步寫入。
- **Host（主持人）**：既有表；RSS 的 itunes:author 可對應單一 host 或從 description 擷取多主持人後寫入 show_hosts。

## Show（節目）擴充

既有欄位與 RSS 對應（同步時寫入）：

| 既有欄位 | RSS 對應 | 說明 |
|----------|----------|------|
| name | `<channel><title>` | 節目名稱 |
| description | `<channel><description>` 或 `<itunes:summary>` | 關於 |
| cover_image_url | `<itunes:image href="...">` | 節目圖片 |
| original_url | `<channel><link>` | 原始連結（可選） |

**新增欄位（建議 migration）**:

| 欄位 | 型別 | 說明 |
|------|------|------|
| rss_feed_url | TEXT | RSS Feed URL，供同步使用；NULL 表示不從 RSS 同步 |
| hosting_provided_by | TEXT | 「Hosting provided by XXX」；RSS 無標準 tag，可從 description 擷取或留空 |
| show_categories | TEXT[] 或 JSONB | 節目級標籤（對應 itunes:category）；可存陣列如 ["商業","個人故事","技術"] |

主持人：既有 `hosts` + `show_hosts`。RSS 僅有 `<itunes:author>`（單一字串），同步時可建立或更新一筆 Host 並寫入 show_hosts；多主持人需從 description 擷取或手動維護。

## Episode（podcast_episodes）對應

既有欄位與 RSS 對應（同步時寫入）：

| 既有欄位 | RSS 對應 | 說明 |
|----------|----------|------|
| description | `<item><description>`（或 `<content:encoded>`） | 節目自己填的說明 |
| duration_seconds | `<itunes:duration>` | 轉成秒 |
| published_at | `<item><pubDate>` | 轉成 TIMESTAMPTZ |
| title | `<item><title>` | 標題 |
| episode_id | `<item><guid>` 或 穩定識別碼 | 用於 upsert 對應 |

單集「節目說明」顯示：前台讀取 `podcast_episodes.description`，與 `ai_summary`、`host_notes` 區分區塊顯示。

## RSS 同步行為（建議）

- **輸入**：show_id 或 rss_feed_url。
- **步驟**：GET feed → 解析 channel + items → 更新 shows 欄位（含 host/show_hosts）→ 依 guid/slug 對應更新或新增 podcast_episodes（description、duration_seconds、published_at 等）。
- **容錯**：缺欄位不中斷；寫入失敗記錄 log；可選 dry-run 模式。
- **觸發**：後台「手動同步」API 或排程 job（實作細節見 tasks）。

## 逐字稿

依 research.md：Spotify 逐字稿無官方 API 可下載。既有 schema 若有 `srt_file_url` 等欄位，可保留為「創作者上傳或自轉後填入」；本 feature 不新增逐字稿下載流程。

## ER 變更摘要

```
Show (+ rss_feed_url, hosting_provided_by, show_categories)
  └── 其餘同既有

Episode (podcast_episodes)
  └── description 明確為「節目自己填的說明」來源；duration_seconds 由 RSS 同步
```
