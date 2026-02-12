# Tasks: 後台 UI 風格統一與節目管理

**Input**: Design documents from `/specs/004-admin-ui-shows/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 本 feature 以手動驗收為主，不含自動化測試任務。

**Organization**: 任務依 User Story 分組，可獨立實作與驗收。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可平行執行（不同檔案、無相依）
- **[Story]**: 所屬 User Story（如 US1, US2）
- 包含完整檔案路徑

---

## Phase 1: Setup

**Purpose**: 確認專案結構與既有元件狀態

- [x] T001 確認分支 `004-admin-ui-shows` 已建立並切換
- [x] T002 確認 `src/types/database.ts` 已有 Show 型別定義

---

## Phase 2: Foundational (節目管理基礎設施)

**Purpose**: 建立節目管理的服務層與 API，為所有節目相關 User Story 提供基礎

**⚠️ CRITICAL**: US2、US3、US4 需此階段完成後才能開始

- [x] T003 建立節目服務 `src/lib/services/admin/shows.ts`（getAllShows, getShowById, createShow, updateShow）
- [x] T004 [P] 建立節目 API GET/POST `src/app/api/admin/shows/route.ts`
- [x] T005 [P] 建立節目 API GET/PATCH `src/app/api/admin/shows/[id]/route.ts`

**Checkpoint**: 節目 API 可用，可開始實作 UI

---

## Phase 3: User Story 1 + 5 - 後台 UI 配色與側邊欄 (Priority: P1) 🎯 MVP

**Goal**: 後台 UI 使用與前台一致的設計 tokens，側邊欄新增「節目管理」連結

**Independent Test**: 檢視後台任一頁面，確認配色與前台一致，側邊欄顯示「節目管理」

### Implementation

- [x] T006 [US1][US5] 調整後台 layout 側邊欄樣式（含 hover 與選中狀態）並新增「節目管理」連結 `src/app/(admin)/layout.tsx`
- [x] T007 [P] [US1] 調整儀表板頁面樣式 `src/app/(admin)/dashboard/page.tsx`
- [x] T008 [P] [US1] 調整單集列表表格樣式 `src/components/admin/EpisodeTable.tsx`
- [x] T009 [P] [US1] 調整單集表單樣式 `src/components/admin/EpisodeForm.tsx`
- [x] T010 [P] [US1] 調整留言審核表格樣式 `src/components/admin/CommentModerationTable.tsx`
- [x] T011 [P] [US1] 調整聯盟行銷表單樣式 `src/components/admin/AffiliateForm.tsx`
- [x] T012 [P] [US1] 調整分頁元件樣式 `src/components/admin/AdminPagination.tsx`
- [x] T013 [P] [US1] 調整單集管理頁面樣式 `src/app/(admin)/episodes/page.tsx`
- [x] T014 [P] [US1] 調整留言審核頁面樣式 `src/app/(admin)/comments/page.tsx`
- [x] T015 [P] [US1] 調整聯盟行銷頁面樣式 `src/app/(admin)/affiliates/page.tsx`

**Checkpoint**: 後台所有既有頁面配色與前台一致，側邊欄可點擊「節目管理」

---

## Phase 4: User Story 2 - 節目列表頁面 (Priority: P2)

**Goal**: 管理員可查看所有節目列表

**Independent Test**: 訪問 `/shows`，確認顯示節目列表與分頁

### Implementation

- [x] T016 [P] [US2] 建立節目列表表格元件（含封面圖片 fallback 處理）`src/components/admin/ShowTable.tsx`
- [x] T017 [US2] 建立節目列表頁面（含分頁功能）`src/app/(admin)/shows/page.tsx`

**Checkpoint**: `/shows` 頁面可顯示節目列表

---

## Phase 5: User Story 3 - 編輯節目頁面 (Priority: P2)

**Goal**: 管理員可編輯單一節目資訊

**Independent Test**: 訪問 `/shows/{id}/edit`，修改欄位並儲存，確認資料庫已更新

### Implementation

- [x] T018 [P] [US3] 建立節目表單元件（含衝突偵測、未儲存提示、slug 唯一性驗證）`src/components/admin/ShowForm.tsx`
- [x] T019 [US3] 建立編輯節目頁面 `src/app/(admin)/shows/[id]/edit/page.tsx`

**Checkpoint**: `/shows/{id}/edit` 頁面可編輯並儲存節目資訊

---

## Phase 6: User Story 4 - 新增節目頁面 (Priority: P3)

**Goal**: 管理員可新增節目

**Independent Test**: 訪問 `/shows/new`，填寫表單並建立，確認節目已新增

### Implementation

- [x] T020 [US4] 建立新增節目頁面 `src/app/(admin)/shows/new/page.tsx`

**Checkpoint**: `/shows/new` 頁面可建立新節目

---

## Phase 7: Clarification Enhancements (新增需求)

**Purpose**: 實作 clarify session 中確認的新需求

**Source**: spec.md Clarifications Session 2026-01-31

### 7.1 空狀態與錯誤處理

- [x] T024 [US2] 新增節目列表空狀態 UI（插圖 + 「尚無節目，點此新增」按鈕）`src/components/admin/ShowTable.tsx`
- [x] T025 [P] [US3][US4] 新增 API 錯誤處理 UI（錯誤類型提示 + 重試按鈕）`src/components/admin/ShowForm.tsx`

### 7.2 欄位驗證強化

- [x] T026 [P] [US3][US4] 新增 name 長度限制驗證（最長 200 字元）`src/components/admin/ShowForm.tsx`
- [x] T027 [P] [US3][US4] 新增 description 長度限制驗證（最長 2000 字元，含字數顯示）`src/components/admin/ShowForm.tsx`

### 7.3 可及性 (Accessibility)

- [x] T028 [P] [US1] 確保所有表單欄位有對應 `<label>` 並透過 `aria-describedby` 關聯錯誤訊息 `src/components/admin/ShowForm.tsx`
- [x] T029 [P] [US1] 確保動態訊息（Toast）使用 `role="alert"` 或 `aria-live` `src/components/admin/ShowForm.tsx`
- [x] T030 [P] [US1] 確保後台互動元件支援鍵盤操作（Tab 導覽驗證）`src/app/(admin)/layout.tsx`

**Checkpoint**: 所有 clarification 需求已實作

---

## Phase 8: Final Validation

**Purpose**: 最終驗收與清理

- [x] T021 執行 `quickstart.md` 驗收清單
- [x] T022 確認無硬編色碼殘留（grep 搜尋 `#[0-9a-fA-F]{3,6}`）
- [x] T023 執行 `npm run build` 確認無編譯錯誤
- [x] T031 重新執行 `npm run build` 確認新增功能無編譯錯誤
- [x] T032 手動測試空狀態 UI、錯誤處理、可及性功能（建議啟動 dev server 驗證）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 無相依，立即開始
- **Foundational (Phase 2)**: 相依 Setup 完成
- **US1+US5 (Phase 3)**: 無相依於 Foundational（僅調整樣式）
- **US2 (Phase 4)**: 相依 Foundational 完成
- **US3 (Phase 5)**: 相依 Foundational 完成，與 US2 可平行
- **US4 (Phase 6)**: 相依 Foundational 完成，與 US2/US3 可平行
- **Clarification Enhancements (Phase 7)**: 相依 Phase 4-6 完成（補強既有功能）
- **Final Validation (Phase 8)**: 相依所有任務完成

### User Story Dependencies

- **US1 (P1)**: 無相依，可獨立完成
- **US5 (P1)**: 合併於 US1 layout 任務
- **US2 (P2)**: 相依 Foundational，需 ShowTable、shows API
- **US3 (P2)**: 相依 Foundational，需 ShowForm、shows API
- **US4 (P3)**: 相依 Foundational，複用 ShowForm

### Parallel Opportunities

- T007-T015 皆可平行（不同檔案）
- T004, T005 可平行（不同 route 檔案）
- T016, T018 可平行（不同元件檔案）
- US2, US3, US4 在 Foundational 完成後可平行
- T025-T030 皆可平行（Phase 7 補強任務，不同關注點）

---

## Parallel Example: Phase 3 (US1 樣式調整)

```bash
# 可同時執行的任務：
Task: "調整儀表板頁面樣式 src/app/(admin)/dashboard/page.tsx"
Task: "調整單集列表表格樣式 src/components/admin/EpisodeTable.tsx"
Task: "調整單集表單樣式 src/components/admin/EpisodeForm.tsx"
Task: "調整留言審核表格樣式 src/components/admin/CommentModerationTable.tsx"
Task: "調整聯盟行銷表單樣式 src/components/admin/AffiliateForm.tsx"
```

---

## Implementation Strategy

### MVP First (Phase 1-3 Only)

1. 完成 Phase 1: Setup
2. 完成 Phase 3: US1+US5（後台樣式統一）
3. **STOP and VALIDATE**: 檢視後台配色是否與前台一致
4. 可先 demo 樣式改進

### Incremental Delivery

1. Phase 1-2 → 基礎設施就緒
2. Phase 3 → 後台樣式統一（視覺改進）
3. Phase 4 → 節目列表可用
4. Phase 5 → 節目可編輯
5. Phase 6 → 節目可新增
6. Phase 7 → 最終驗收

---

## Notes

- [P] 任務可平行執行
- [Story] 標籤對應 spec.md 的 User Story
- 每個 User Story 可獨立完成與驗收
- 樣式調整使用設計 tokens：`bg-surface`, `bg-canvas`, `text-text-primary`, `bg-cta`, `bg-hover`, `border-border-subtle`
- 表單複用既有 EpisodeForm/AffiliateForm 的衝突偵測與未儲存提示模式
