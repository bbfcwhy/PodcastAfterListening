# Quickstart: 節目／單集 RSS 欄位與同步

本文件供開發與驗收時快速對齊環境與情境。

---

## 前置條件

- Node 18+
- 專案依賴已安裝：`npm install`
- Supabase 專案已設定，且 `.env.local` 含 Supabase 相關變數
- 至少一筆節目（Show）與單集（Episode）存在；若實作 RSS 同步，需有可用的 RSS Feed URL

---

## 啟動與驗收情境

1. 開發伺服器：`npm run dev`
2. 前台：進入節目詳情頁（如 `/shows/{slug}`）與單集詳情頁（如 `/episodes/{showSlug}/{episodeSlug}`）。

**驗收情境對齊（spec 摘要）**：

- **節目級欄位**：節目頁／單集頁的節目區塊顯示節目圖片、節目名稱、主持人、關於、Hosting provided by（若有）、Tags（show_categories）；若某欄位未同步或為空，不報錯、可留空或佔位。
- **單集說明**：單集詳情頁有「單集說明」區塊，內容為節目自己填的說明（對應 RSS item description）；與 AI 大綱、站長心得分開顯示；無內容時顯示「本集無單集說明」。
- **RSS 同步**：已實作 `POST /api/admin/shows/[id]/sync-rss`（需管理員登入）。對指定節目觸發同步後，檢查 DB 與前台是否更新節目／單集欄位；缺欄位或無效 feed 時不崩潰、回傳明確狀態。
- **逐字稿**：本 feature 不實作 Spotify 逐字稿下載；策略已記錄於 [research.md](./research.md)（自轉或創作者／第三方匯入）。

**實作後驗收步驟**：

1. 為一筆節目設定 `rss_feed_url`（DB 或後台），並以管理員身分登入。
2. 呼叫 `POST /api/admin/shows/{show_id}/sync-rss`，檢查回應 `{ ok, show_updated, episodes_updated, errors? }`。
3. 重新載入節目詳情頁與單集詳情頁，確認節目級欄位與單集說明是否顯示（依 RSS 資料）。
4. 單集頁確認「單集說明」區塊與「節目大綱」「站長心得」分開顯示。

---

## 與既有流程並行時

- 節目／單集資料可由 **n8n** 寫入（既有流程），**RSS 同步**為補充或替代來源；同步時以 show_id + episode guid/slug 對應 upsert，不強制覆蓋 n8n 寫入的 ai_summary、host_notes。
- 若節目尚未設定 `rss_feed_url`，不執行 RSS 同步；前台顯示既有資料或佔位。

---

## 相關文件

- [spec.md](../spec.md)：完整規格與驗收情境
- [plan.md](../plan.md)：技術脈絡與結構
- [research.md](../research.md)：RSS 欄位對應與 Spotify 逐字稿結論
- [data-model.md](../data-model.md)：Show / Episode 擴充欄位
- [contracts/README.md](./contracts/README.md)：前台欄位與 RSS 同步契約
