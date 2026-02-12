# Research: 後台輕鬆修改網站內容

**Feature**: 003-admin-content-editing  
**Date**: 2026-01-29

本文件記錄 Phase 0 技術決策，供 plan 與實作參考。

---

## 1. 離開前未儲存變更提示

**Decision**: 使用瀏覽器 `beforeunload` + 站內導覽時由 React 狀態偵測「dirty」表單，顯示確認對話框（不強制阻擋離開，可讓使用者選擇取消離開）。

**Rationale**: 規格要求「若有未儲存變更須提示；不強制阻擋離開但可讓使用者取消離開」。beforeunload 涵蓋關閉分頁／重新整理；站內導覽（如點「返回列表」）由 React 攔截（例如 useBlocker 或 Link 的 onClick + state）顯示自訂 modal，避免靜默離開。

**Alternatives considered**: 僅 beforeunload（無法自訂文案且部分瀏覽器限制）；僅站內攔截（關閉分頁時無法提示）→ 兩者並用。

---

## 2. n8n 與站長並行更新時的衝突處理

**Decision**: 以 `updated_at` 做樂觀偵測。站長進入編輯頁時帶入當時的 `updated_at`；儲存前（或定時）向後端查詢該筆目前 `updated_at`，若比帶入的還新則視為「有更新版本」，前端提示並提供：重新載入、覆蓋、放棄儲存。

**Rationale**: 規格要求「偵測到遠端有更新時須提示站長，提供選項」。既有 schema 已有 `updated_at`（episodes, comments, affiliate_contents），不需新增版本號欄位。n8n 寫入會更新 `updated_at`，站長儲存時也可更新，比對即可。

**Alternatives considered**: 樂觀鎖（version 欄位）→ 需改 schema 與 n8n；最後寫入勝出→ 規格已否決。

---

## 3. 列表分頁

**Decision**: 後端支援 `page` 與 `pageSize`（預設 20）；前端列表頁使用既有或新增的 Pagination 元件，查詢參數反映目前頁碼（如 `?page=2`），以利書籤與重新整理。

**Rationale**: 規格要求「列表採分頁，如每頁 20 筆，須提供分頁控制」。既有 codebase 已有 `Pagination` 元件（components/ui/Pagination.tsx），可複用或微調。API 改為支援 offset/limit 或 page/pageSize，Supabase 使用 `.range((page-1)*pageSize, page*pageSize - 1)`。

**Alternatives considered**: 僅前端分頁（一次取全部）→ 資料變多時效能差；捲動載入更多→ 規格已選分頁。

---

## 4. 站長登入與權限

**Decision**: 沿用既有機制：Supabase Auth + `profiles.is_admin`；proxy（原 middleware）保護 `/admin` 路徑，未登入或非 is_admin 則導向首頁或登入。

**Rationale**: 規格假設「站長登入後台」；專案已實作 proxy 與 is_admin 檢查，本 feature 不變更認證模型。

**Alternatives considered**: 新增角色表→ 規格為單一站長，不需。

---

## 5. 預覽與草稿

**Decision**: 第一版不實作。規格與澄清已明確：資料以 n8n→Supabase 為主，後台供快速小修，預覽與草稿非本版範圍。

**Rationale**: 若未來有需求可另案加入（例如草稿存至另一表或 `is_published` 延遲更新）。
