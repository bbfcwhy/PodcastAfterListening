# 實作計畫：後台節目管理增強

**Branch**: `007-admin-show-management` | **Spec**: `specs/007-admin-show-management/spec.md`

## 摘要

本計畫旨在實作後台節目列表的增強功能，包括資料庫 Schema 變更 (新增 `position` 欄位)、Server Actions (支援篩選、分頁、排序與拖曳更新) 以及前端介面優化 (整合 `@dnd-kit` 進行拖曳排序)。

## User Review Required

> [!IMPORTANT]
> **Drag-and-Drop 行為**：拖曳排序僅在「預設排序 (By Position)」且「無篩選條件」下啟用。
> **分頁限制**：跨頁拖曳需切換至 "Show All" 模式。

## Proposed Changes

### Database & Types
#### [MODIFY] [policies.sql](file:///Users/bbfcwhy/Projects/PodcastAfterListening/supabase/policies.sql)
-   新增 `ALTER TABLE shows ADD COLUMN position INTEGER DEFAULT 0;`。
-   新增初始化 SQL：依 `created_at` 排序設定初始 `position`。

#### [MODIFY] [database.ts](file:///Users/bbfcwhy/Projects/PodcastAfterListening/src/types/database.ts)
-   更新 `shows` 表格定義，加入 `position: number`。

### Server Actions
#### [MODIFY] [actions.ts](file:///Users/bbfcwhy/Projects/PodcastAfterListening/src/lib/shows/actions.ts) (或建立新檔案)
-   修改 `getShows` (或新增 `getAdminShows`)：
    -   接收參數：`page`, `perPage`, `sort`, `filter` (name/category)。
    -   實作分頁與篩選邏輯。
-   新增 `updateShowOrder(items: { id: string, position: number }[])`：
    -   批次更新 `shows` 表格的 `position`。
    -   鑑權：僅限 Admin 執行。

### UI Components
#### [MODIFY] [ShowList.tsx](file:///Users/bbfcwhy/Projects/PodcastAfterListening/src/components/shows/ShowList.tsx) (Admin 側)
-   整合 `@dnd-kit` (`DndContext`, `SortableContext`)。
-   新增 `SortableShowRow` 元件。
-   實作拖曳事件處理 (`onDragEnd`) 呼叫 `updateShowOrder`。
-   狀態管理：
    -   `isDraggable`: 當 `sort === 'custom'` && `!filter` 時為 true。

#### [NEW] [AdminShowToolbar.tsx](file:///Users/bbfcwhy/Projects/PodcastAfterListening/src/components/admin/shows/AdminShowToolbar.tsx)
-   包含搜尋框、Category 篩選下拉選單。
-   包含排序選單、每頁筆數選單。

#### [MODIFY] [Pagination.tsx](file:///Users/bbfcwhy/Projects/PodcastAfterListening/src/components/ui/Pagination.tsx)
-   確認可重複使用於 Admin 介面。

### Public Interface
#### [MODIFY] [Sidebar.tsx](file:///Users/bbfcwhy/Projects/PodcastAfterListening/src/components/layout/Sidebar.tsx)
-   更新節目獲取邏輯：改為依 `position` 排序 (原本可能是 `updated_at` 或 `created_at`)。

## Verification Plan

### Automated Tests
-   `npm run test` (若有現有測試)。
-   新增 `tests/unit/admin-shows.test.ts` (若專案有測試框架設置)：
    -   測試 `getAdminShows` 的篩選與分頁邏輯。
    -   測試 `updateShowOrder` 是否正確更新 DB。

### Manual Verification
1.  **資料庫遷移**：執行 SQL，確認 `position` 欄位建立且有初始值。
2.  **篩選功能**：輸入關鍵字，確認列表正確過濾。
3.  **分頁功能**：切換 Pagesize (10/50/All)，確認分頁導航正常。
4.  **排序功能**：切換不同排序方式，確認列表順序改變。
5.  **拖曳排序**：
    -   在「預設排序」下拖曳一筆節目。
    -   重整後台頁面，確認順序維持。
    -   查看前台 Sidebar，確認順序同步更新。
    -   嘗試在「非預設排序」或「有篩選」時拖曳，確認功能被禁用。
