# API Contracts: 後台輕鬆修改網站內容

本 feature 在既有後台 API 上擴充：分頁參數、衝突偵測（updated_at）。以下為行為契約，供實作與測試對齊。

---

## 1. 列表分頁（行為契約）

**適用**：單集列表、留言列表、聯盟內容列表（不論目前為 Server Component 直接查 DB 或經由 API）。

**契約**：

- 列表查詢支援參數：`page`（從 1 起）、`pageSize`（預設 20，上限可訂如 100）。
- 回應須包含：`items`（該頁資料）、`total`（符合篩選之總筆數，供前端算總頁數）。
- 若為 Server Component 直接呼叫 service：service 函式簽名須支援 `page`, `pageSize`，回傳 `{ items, total }` 或等價結構。

**範例**（概念）：

- `GET /api/admin/comments?status=pending&page=2&pageSize=20` → `{ comments: Comment[], total: number }`
- 單集列表若改為 API：`GET /api/admin/episodes?page=1&pageSize=20&is_published=all` → `{ episodes: Episode[], total: number }`

---

## 2. 編輯儲存與衝突偵測（行為契約）

**適用**：單集、聯盟內容（及留言狀態更新）的 PATCH/PUT。

**契約**：

- 客戶端在編輯頁載入時取得該筆的 `updated_at`（或由伺服器在表單初始資料中帶出）。
- **選項 A（建議）**：儲存時客戶端送出現有 `updated_at`（如 request body 或 header）。伺服器更新前比對 DB 中該筆的 `updated_at`；若 DB 較新，回傳 `409 Conflict` 與目前 `updated_at`，前端據此顯示「有更新版本」並提供重新載入／覆蓋／放棄。
- **選項 B**：提供 `GET /api/admin/episodes/:id?fields=updated_at`（或單一 check 端點）讓前端在儲存前輪詢或手動檢查；若較新則提示。儲存仍為一般 PATCH，不強制送 version。

**回應**：

- 成功：`200` + 更新後資源（含新 `updated_at`）。
- 驗證失敗：`400` + 錯誤訊息與欄位（符合 FR-003、FR-004）。
- 衝突（選項 A）：`409` + `{ reason: "newer_version", current_updated_at: string }`。

---

## 3. 既有端點（不變更契約，僅擴充）

- **GET /api/admin/comments**：新增 query `page`, `pageSize`；回應新增 `total`。
- **PATCH /api/admin/comments/:id**：可選支援衝突偵測（見上）。
- **GET /api/admin/episodes/:id**（若存在）、**PATCH /api/admin/episodes/:id**：可選支援衝突偵測；列表若改為透過 API，則支援 `page`, `pageSize`, `total`。
- **GET /api/admin/affiliates**、**PATCH /api/admin/affiliates/:id**：同上，分頁與衝突偵測為選配擴充。

---

## 4. 測試要點

- 列表：傳入 `page=2&pageSize=20`，確認回傳筆數 ≤ 20 且 `total` 與實際符合。
- 衝突：兩次更新同一筆，第二次送舊 `updated_at`，預期 409（若實作選項 A）。
- 儲存回饋：成功 200、驗證失敗 400 與欄位錯誤訊息。
