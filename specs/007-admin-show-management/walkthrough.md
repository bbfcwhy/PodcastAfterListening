# Walkthrough - Admin Show Management Enhancements

**Feature**: `007-admin-show-management`

## 1. 變更總覽 (Changes Overview)

-   **Database**: `shows` 表格新增 `position` 欄位，用於自訂排序。
-   **Header**: 節目管理介面新增 Toolbar，支援搜尋、分類篩選、排序切換與分頁設定。
-   **List**: 節目列表改為支援 Drag-and-Drop (DnD) 排序。
    -   僅在「自訂排序」且「無篩選條件」下啟用拖曳。
-   **Public**: 前台 Sidebar 與首頁節目列表改為依 `position` 排序（預設與後台一致）。

## 2. 驗證步驟 (Verification Steps)

### 2.1 資料庫遷移
-   [ ] 確認 `shows` 表格已有 `position` 欄位，且舊資料已初始化。

### 2.2 後台功能 (Admin Show Management)
1.  **進入** `/admin/shows`。
2.  **搜尋與篩選**：
    -   [ ] 輸入關鍵字，確認列表更新。
    -   [ ] 選擇分類，確認列表更新。
3.  **排序與分頁**：
    -   [ ] 切換排序方式（如依名稱、建立時間），確認順序改變。
    -   [ ] 切換每頁筆數 (10/50/All)，確認分頁正常。
4.  **拖曳排序 (Drag-and-Drop)**：
    -   [ ] 確保排序為「自訂排序」且無搜尋/篩選條件。
    -   [ ] 拖曳任一節目改變順序。
    -   [ ] 重整頁面，確認順序已儲存。
    -   [ ] 嘗試在有篩選條件下拖曳，確認功能被禁用（無 Drag Handle）。

### 2.3 前台整合 (Public Integration)
-   [ ] 進入首頁 `/` 或查看 Sidebar。
-   [ ] 確認節目順序與後台「自訂排序」一致。
-   [ ] 在後台調整順序後，前台應即時反映（需重整或等待 Revalidate）。

## 3. 程式碼結構 (Code Structure)

-   `src/lib/shows/actions.ts`: 後端邏輯 (`getAdminShows`, `updateShowOrder`, `getShowCategories`)。
-   `src/components/admin/shows/`:
    -   `AdminShowToolbar.tsx`: 搜尋列元件。
    -   `ShowList.tsx`: 主列表元件 (包含 DnD context)。
    -   `SortableShowRow.tsx`: 可拖曳列元件。
-   `src/lib/services/shows.ts`: 更新公開 API `getShows` 的預設排序。
