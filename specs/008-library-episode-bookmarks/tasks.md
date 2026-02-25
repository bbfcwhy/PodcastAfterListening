# Tasks: Library 收藏功能修復與單集收藏

**Input**: Design documents from `/specs/008-library-episode-bookmarks/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Tests**: 未明確要求，不包含測試任務。

**Organization**: 任務按 User Story 分組，每個 Story 可獨立實作與驗證。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: 可與其他任務平行執行（不同檔案、無相依性）
- **[Story]**: 對應的 User Story（US1, US2, US3）
- 所有路徑皆為相對於專案根目錄

---

## Phase 1: Setup

**Purpose**: 環境確認與型別準備

- [X] T001 在 `src/types/database.ts` 新增 `EpisodeLibraryItem` 型別定義（id, user_id, episode_id, added_at）及 `EpisodeLibraryItemWithEpisode` 型別（含 episode join 和巢狀 show 資訊）

---

## Phase 2: Foundational（阻斷性前置作業）

**Purpose**: 所有 User Story 都依賴的基礎建設

**⚠️ 重要**: 此階段完成前不能開始任何 User Story

- [X] T002 在 Supabase 建立 `episode_library_items` 表（schema 參考 `data-model.md`）：id UUID PK、user_id FK、episode_id FK、added_at TIMESTAMPTZ，UNIQUE(user_id, episode_id)
- [X] T003 在 Supabase 設定 `episode_library_items` 的 RLS 政策：SELECT/INSERT/DELETE 皆限 `auth.uid() = user_id`
- [X] T004 在 `supabase/policies.sql` 記錄新增的表定義和 RLS 政策

**Checkpoint**: 資料庫基礎建設完成，可開始 User Story 實作

---

## Phase 3: User Story 1 — 修復 Library 頁面顯示已收藏頻道 (Priority: P1) 🎯 MVP

**Goal**: 使用者收藏頻道後，Library 頁面能正確顯示已收藏的頻道

**Independent Test**: 登入 → 到頻道頁面點擊收藏 → 前往 Library 頁面 → 確認頻道正確顯示

### Implementation for User Story 1

- [X] T005 [US1] 在 `src/app/(public)/library/page.tsx` 頂部加入 `export const dynamic = "force-dynamic"` 強制每次請求動態渲染
- [X] T006 [US1] 修改 `src/components/library/AddToLibraryButton.tsx`：引入 `useRouter`，在 `addToLibrary` / `removeFromLibrary` 完成後呼叫 `router.refresh()` 清除 Client-Side Router Cache
- [X] T007 [US1] 修改 `src/lib/library/actions.ts`：移除 `revalidatePath("/shows/${showId}")` 無效路徑
- [X] T008 [US1] 修改 `src/components/library/LibraryList.tsx`：修正 stale props 問題，元件內同步 props 到 state

**Checkpoint**: Library Bug 已修復，收藏頻道後 Library 頁面正確顯示

---

## Phase 4: User Story 2 — 單集收藏功能 (Priority: P2)

**Goal**: 使用者可以在單集詳情頁獨立收藏/取消收藏單集

**Independent Test**: 登入 → 到單集詳情頁 → 點擊收藏按鈕 → 確認視覺回饋 → 再次點擊取消收藏

### Implementation for User Story 2

- [X] T009 [P] [US2] 建立 `src/lib/library/episode-actions.ts`：實作 `addEpisodeToLibrary(episodeId)` 和 `removeEpisodeFromLibrary(episodeId)` Server Actions，處理認證檢查、重複約束（23505）、`revalidatePath("/library")`
- [X] T010 [P] [US2] 建立 `src/components/library/AddEpisodeToLibraryButton.tsx`：複用 `AddToLibraryButton` 的設計模式（`useTransition`、`useState`、`router.refresh()`），呼叫 episode-actions 的函式，顯示「收藏單集」/「已收藏」狀態切換
- [X] T011 [US2] 修改 `src/app/(public)/episodes/[showSlug]/[episodeSlug]/page.tsx`：引入 `getCurrentUser`，查詢 `episode_library_items` 判斷是否已收藏，在頁面適當位置渲染 `AddEpisodeToLibraryButton`（僅已登入使用者可見）

**Checkpoint**: 單集收藏功能可用，可在單集詳情頁收藏/取消收藏

---

## Phase 5: User Story 3 — Library 頁面分類顯示 (Priority: P3)

**Goal**: Library 頁面用 Tab 分類顯示已收藏的頻道和單集

**Independent Test**: 在 Library 頁面切換「頻道」和「單集」Tab → 確認各自顯示正確內容

### Implementation for User Story 3

- [X] T012 [P] [US3] 建立 `src/components/library/EpisodeLibraryList.tsx`：顯示已收藏的單集列表（單集標題、所屬頻道名稱、發佈日期），按收藏時間倒序，空狀態顯示「還沒有收藏的單集」並附探索連結
- [X] T013 [US3] 修改 `src/app/(public)/library/page.tsx`：新增查詢 `episode_library_items`（join episodes 和 shows），過濾已刪除的單集（episode IS NOT NULL）
- [X] T014 [US3] 修改 `src/app/(public)/library/page.tsx`：用 shadcn/ui `Tabs` 元件包裝，預設「頻道」Tab 顯示 `LibraryList`，「單集」Tab 顯示 `EpisodeLibraryList`，頻道 Tab 維持拖曳排序功能

**Checkpoint**: Library 頁面完整呈現頻道和單集收藏，可分類切換

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: 全功能驗證與收尾

- [X] T015 執行 `npm run lint` 確認無 lint 錯誤
- [ ] T016 手動驗證完整流程：收藏頻道 → 收藏單集 → Library 頁面 Tab 切換 → 取消收藏 → 確認 edge cases（未登入、已刪除的頻道/單集）

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: 無相依性，立即開始
- **Foundational (Phase 2)**: 依賴 Phase 1 完成，阻斷所有 User Story
- **US1 (Phase 3)**: 依賴 Phase 2（但 US1 為 bug fix，不依賴新表，可在表建立前就開始）
- **US2 (Phase 4)**: 依賴 Phase 2（需要 `episode_library_items` 表）
- **US3 (Phase 5)**: 依賴 Phase 3 和 Phase 4 完成（需要兩種收藏功能都已實作）
- **Polish (Phase 6)**: 依賴所有 User Story 完成

### User Story Dependencies

- **User Story 1 (P1)**: 完全獨立，僅修改既有程式碼
- **User Story 2 (P2)**: 依賴 Foundational 的新表，不依賴 US1
- **User Story 3 (P3)**: 依賴 US1（頻道顯示正常）和 US2（單集收藏存在）

### Parallel Opportunities

- T009 和 T010 可平行（不同檔案，無相依性）
- T012 可與 T009/T010 平行（不同檔案）
- US1 和 US2 可平行進行（不同檔案和功能）

---

## Parallel Example: User Story 2

```text
# 可同時啟動：
Task T009: "建立 episode-actions.ts（Server Actions）"
Task T010: "建立 AddEpisodeToLibraryButton.tsx（UI 元件）"

# T009 和 T010 都完成後：
Task T011: "整合到單集詳情頁"
```

---

## Implementation Strategy

### MVP First（僅 User Story 1）

1. 完成 Phase 1: Setup
2. 完成 Phase 2: Foundational
3. 完成 Phase 3: User Story 1（修復 Library Bug）
4. **停下驗證**: 收藏頻道 → Library 頁面正確顯示
5. 可先部署此修復

### Incremental Delivery

1. Setup + Foundational → 基礎就緒
2. User Story 1 → 修復 Bug → 部署（MVP!）
3. User Story 2 → 單集收藏可用 → 部署
4. User Story 3 → Library 分類顯示 → 部署
5. Polish → 完整驗證 → 最終部署

---

## Notes

- [P] 任務可平行，不同檔案且無相依性
- [Story] 標籤對應 spec.md 的 User Story
- 每個 Checkpoint 後可獨立驗證該 Story
- 每完成一個 Task 或邏輯群組後 commit
