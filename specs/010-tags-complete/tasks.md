# Tasks: Tags 功能完善

**Input**: Design documents from `/specs/010-tags-complete/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/tags-api.md

**Organization**: 任務按 User Story 分組，每個 Story 可獨立實作與測試。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可平行執行（不同檔案，無依賴）
- **[Story]**: 對應的 User Story（US1, US2, US3, US4）

---

## Phase 1: Setup

**Purpose**: 資料庫遷移與共用基礎設施

- [x] T001 建立 show_tags 關聯表與 RLS policies 的 SQL migration 檔案 `supabase/migrations/012_show_tags.sql`
- [x] T002 撰寫 shows.tags[] → show_tags 的一次性資料遷移 SQL（含在同一 migration）
- [x] T003 [P] 更新 TypeScript 型別：新增 show_tags、移除 shows.tags 欄位 `src/types/database.ts`
- [x] T004 [P] 建立標籤 Server Actions 檔案 `src/lib/tags/actions.ts`（含 getAllTags、getTagBySlug、getEpisodesByTag、getTagUsageCount、getTagsWithCounts）

**Checkpoint**: 資料庫遷移完成、型別更新、基礎 service 可用

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: 所有 User Story 共用的核心元件

**⚠️ CRITICAL**: US1-US4 的實作需等此階段完成

- [x] T005 建立 TagPicker 共用元件（Combobox 搜尋 + Badge chips 多選顯示，上限 10 個）`src/components/admin/TagPicker.tsx`
- [x] T006 在 AdminSidebar 新增「標籤管理」選單入口（icon: Tag from Lucide）`src/components/admin/AdminSidebar.tsx`

**Checkpoint**: 共用元件就緒，可開始 User Story 實作

---

## Phase 3: User Story 1 - 管理員在後台管理標籤 (Priority: P1) 🎯 MVP

**Goal**: 管理員可在後台建立、編輯、刪除標籤

**Independent Test**: 前往 /admin/tags，建立「科技」→ 編輯為「科技新聞」→ 刪除，確認所有操作正常

### Implementation for User Story 1

- [x] T007 [P] [US1] 建立標籤列表 API Route（GET，含 episode_count 和 show_count 統計）`src/app/api/admin/tags/route.ts`
- [x] T008 [P] [US1] 建立標籤新增 API Route（POST，含名稱唯一性驗證和 slug 驗證）`src/app/api/admin/tags/route.ts`
- [x] T009 [US1] 建立標籤更新 API Route（PATCH，含衝突偵測）`src/app/api/admin/tags/[id]/route.ts`
- [x] T010 [P] [US1] 建立標籤使用統計 API Route（GET，用於刪除確認）`src/app/api/admin/tags/[id]/usage/route.ts`
- [x] T011 [US1] 建立標籤刪除 API Route（DELETE）`src/app/api/admin/tags/[id]/route.ts`
- [x] T012 [US1] 建立標籤管理列表頁面（含使用數量、編輯/刪除按鈕、刪除確認對話框顯示受影響數量）`src/app/(admin)/tags/page.tsx`
- [x] T013 [P] [US1] 建立新增標籤頁面（名稱 + slug 表單，slug 自動產生可覆寫）`src/app/(admin)/tags/new/page.tsx`
- [x] T014 [US1] 建立編輯標籤頁面 `src/app/(admin)/tags/[id]/edit/page.tsx`
- [ ] T015 [US1] 手動驗證：建立/編輯/刪除標籤，確認重複名稱錯誤提示、刪除確認對話框

**Checkpoint**: 標籤 CRUD 完整可用，管理員可自行管理所有標籤

---

## Phase 4: User Story 2 - 管理員為單集與節目指派標籤 (Priority: P1)

**Goal**: 管理員在編輯單集/節目時可指派和移除標籤

**Independent Test**: 編輯任一單集 → 選取「科技」「訪談」標籤 → 儲存 → 重新載入確認標籤保留；編輯任一節目 → 標籤選擇器取代舊的 comma-separated input

### Implementation for User Story 2

- [x] T016 [P] [US2] 建立單集標籤設定 API Route（PUT，全量替換，上限 10 驗證）`src/app/api/admin/episodes/[id]/tags/route.ts`
- [x] T017 [P] [US2] 建立節目標籤設定 API Route（PUT，全量替換）`src/app/api/admin/shows/[id]/tags/route.ts`
- [x] T018 [US2] 在 EpisodeForm 中整合 TagPicker（載入現有標籤、儲存時呼叫 PUT API）`src/components/admin/EpisodeForm.tsx`
- [x] T019 [US2] 在 ShowForm 中以 TagPicker 取代現有 comma-separated tags input（讀取 show_tags 關聯而非 shows.tags[]）`src/components/admin/ShowForm.tsx`
- [ ] T020 [US2] 手動驗證：單集指派標籤（含上限 10 提示）、節目指派標籤、儲存後重載確認

**Checkpoint**: 管理員可為單集和節目指派標籤，舊的 tags input 已被取代

---

## Phase 5: User Story 3 - 訪客透過標籤瀏覽相關單集 (Priority: P2)

**Goal**: 訪客可點擊標籤查看所有相關單集

**Independent Test**: 前往任一有標籤的單集頁 → 點擊標籤 → 跳轉至 /tags/[slug] → 確認顯示相關單集 card grid

### Implementation for User Story 3

- [x] T021 [P] [US3] 建立標籤瀏覽頁面（Server Component，查詢 tag + 關聯的已發布單集，使用 EpisodeCard grid 佈局）`src/app/(public)/tags/[slug]/page.tsx`
- [x] T022 [US3] 將單集詳情頁的標籤 `<span>` 改為可點擊的 `<Link href="/tags/[slug]">`，保持 # prefix 樣式 `src/app/(public)/episodes/[showSlug]/[episodeSlug]/page.tsx`
- [ ] T023 [US3] 手動驗證：點擊標籤跳轉、空標籤頁面的空狀態提示、card grid 佈局與節目頁一致

**Checkpoint**: 訪客可透過標籤探索相關內容

---

## Phase 6: User Story 4 - 訪客在搜尋時使用標籤過濾 (Priority: P3)

**Goal**: 搜尋頁面提供標籤篩選選項

**Independent Test**: 前往 /search → 選取「科技」標籤 → 確認結果僅含該標籤的單集；搭配關鍵字搜尋確認聯合過濾

### Implementation for User Story 4

- [x] T024 [US4] 在 SearchFilters 中啟用標籤篩選 UI（使用 _tags prop，渲染 checkbox list + URL 參數同步）`src/components/search/SearchFilters.tsx`
- [x] T025 [US4] 確認搜尋頁面正確傳遞 tags 參數給 search API（已有 filter_tags 支援，僅需前端串接）`src/app/(public)/search/page.tsx`
- [ ] T026 [US4] 手動驗證：單選/多選標籤篩選、搭配關鍵字聯合過濾、無結果時的清除篩選提示

**Checkpoint**: 搜尋頁面標籤篩選完整可用

---

## Phase 7: Polish & Cross-Cutting Concerns

**Purpose**: 清理與最終驗證

- [x] T027 執行 shows.tags[] 欄位移除（確認所有讀寫已改用 show_tags 後）：新增 migration `ALTER TABLE shows DROP COLUMN tags`
- [x] T028 更新 ShowForm 移除 shows.tags 相關的舊邏輯（comma-separated 解析等）`src/components/admin/ShowForm.tsx`
- [ ] T029 全流程手動驗證：依 quickstart.md 的 5 項驗證步驟完整測試
- [ ] T030 部署至 production 並確認功能正常

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 無依賴，可立即開始
- **Foundational (Phase 2)**: 依賴 Phase 1 完成（T003, T004）
- **US1 (Phase 3)**: 依賴 Phase 2（T005, T006）
- **US2 (Phase 4)**: 依賴 Phase 2（T005）+ Phase 3（需有標籤可指派）
- **US3 (Phase 5)**: 依賴 Phase 1（T004 getEpisodesByTag）；可與 US2 平行
- **US4 (Phase 6)**: 依賴 Phase 1（T004 getAllTags）；可與 US2/US3 平行
- **Polish (Phase 7)**: 依賴所有 User Story 完成

### User Story Dependencies

- **US1 (P1)**: Phase 2 完成後即可開始 — 無其他 Story 依賴
- **US2 (P1)**: 需 US1 完成（需有標籤可以指派）
- **US3 (P2)**: 需 Phase 1 完成 — 可與 US2 平行
- **US4 (P3)**: 需 Phase 1 完成 — 可與 US2/US3 平行

### Parallel Opportunities

- T003 + T004: 型別更新與 server actions 可平行
- T007 + T008 + T010 + T013: 不同 API route 和頁面可平行
- T016 + T017: 單集和節目的標籤 API 可平行
- US3 + US4: 完成 US1 後，US3 和 US4 可平行進行

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. 完成 Phase 1: Setup（遷移 + 型別 + actions）
2. 完成 Phase 2: Foundational（TagPicker + sidebar）
3. 完成 Phase 3: US1 — 標籤 CRUD
4. **STOP and VALIDATE**: 測試後台標籤管理功能
5. 可先部署，確保基礎穩固

### Incremental Delivery

1. Setup + Foundational → 基礎設施就緒
2. US1 → 後台可管理標籤 → 部署（MVP）
3. US2 → 可為內容指派標籤 → 部署
4. US3 + US4（平行）→ 前台可用標籤瀏覽和搜尋 → 部署
5. Polish → 移除舊欄位、全流程驗證 → 最終部署

---

## Notes

- 現有 tags 和 episode_tags 表已存在，不需重建
- search_episodes RPC 已支援 filter_tags 參數，US4 只需前端串接
- 標籤 slug 支援中文（URL-encoded），不強制 `[a-z0-9-]+` 格式
- 遷移 shows.tags[] 時需確保舊標籤名稱正確對應至 tags 表
