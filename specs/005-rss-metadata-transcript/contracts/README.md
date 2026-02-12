# API / 行為契約: 節目／單集 RSS 欄位與同步

本 feature 在既有前台讀取與後台管理上，新增「RSS 同步」觸發與節目／單集欄位顯示契約。API 若採 REST，可依下列契約實作與測試對齊。

---

## 1. 前台節目／單集欄位（行為契約）

**適用**：節目詳情頁、單集詳情頁的資料來源（Server Component 或 API）。

**契約**：

- 節目（Show）對外須能提供：`name`、`description`、`cover_image_url`、`original_url`、`hosting_provided_by`、`show_categories`（或 tags）；主持人經由既有 `hosts` / `show_hosts` 關聯提供。
- 單集（Episode）對外須能提供：`title`、`description`（節目自己填的說明）、`duration_seconds`、`published_at`、`ai_summary`、`host_notes` 等；其中 `description` 與 `ai_summary`、`host_notes` 須區分顯示。
- 若欄位為空（未同步或 RSS 未提供），前台不報錯；可選擇不顯示該區塊或顯示佔位。

**資料來源**：上述欄位由 RSS 同步寫入 DB 或既有 n8n 流程寫入；前台僅讀取已儲存之欄位。

---

## 2. RSS 同步觸發（行為契約）

**適用**：後台手動觸發或排程 job 呼叫之「RSS 同步」邏輯。

**契約**：

- **輸入**：節目 ID（show_id）或 RSS Feed URL（rss_feed_url）。若以 show_id 查詢，則使用該節目的 `rss_feed_url`；若為 URL 則可先解析再對應或建立節目。
- **步驟**：GET feed（HTTP）→ 解析 XML（channel + items）→ 更新 shows 表（name、description、cover_image_url、hosting_provided_by、show_categories、host/show_hosts）→ 依 guid/slug 對應 upsert podcast_episodes（description、duration_seconds、published_at、title 等）。
- **輸出**：同步結果（成功／失敗、更新筆數、錯誤訊息）；失敗時不影響已成功寫入的筆數（可部分成功）。
- **容錯**：缺欄位不中斷；網路逾時或非 XML 回應時回傳明確錯誤；可選 dry-run（不寫入 DB）。

**API 設計建議**（可選）：

- `POST /api/admin/shows/:id/sync-rss`：對指定節目依其 `rss_feed_url` 執行同步；需管理員權限。
- 回應：`200` + `{ ok: true, show_updated: boolean, episodes_updated: number, errors?: string[] }`；`4xx/5xx` + 錯誤說明。

---

## 3. 既有端點（不變更契約）

- 節目／單集之 **GET** 列表與詳情：若已回傳上述新欄位（hosting_provided_by、show_categories、description 等），則符合本 feature 契約；無需變更 URL 或版本。
- 後台節目管理（004-admin-ui-shows）：若實作節目 CRUD，可一併支援 `rss_feed_url`、`hosting_provided_by`、`show_categories` 的讀寫；契約以 004 與本 005 重疊處為準。

---

## 4. 測試要點

- 前台：節目頁／單集頁載入後，確認顯示節目圖片、名稱、主持人、關於、Hosting（若有）、Tags；單集顯示「節目說明」區塊且與 AI 大綱、站長心得分開。
- RSS 同步：提供測試用 RSS URL，觸發同步後檢查 DB 欄位是否更新；缺欄位或無效 XML 時不崩潰、回傳明確狀態。
- 安全：前台顯示之 description/about 須經跳脫或有限 HTML，避免 XSS。
