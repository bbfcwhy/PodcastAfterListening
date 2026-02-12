# Walkthrough: Google Login & Library

**Feature**: `006-google-login-library`

## 完成項目

1.  **Database**:
    -   `profiles` 表格新增 `display_name`, `avatar_url` 欄位。
    -   新增 `library_items` 表格與 RLS 策略。
    -   產生 `supabase/policies.sql` 遷移檔案。

2.  **Authentication**:
    -   優化 OAuth Callback (`src/app/api/auth/callback/route.ts`) 自動同步 Google 個人資料。
    -   實作 `isAdmin` 權限檢查工具 (`src/lib/auth/admin.ts`)。
    -   新增 `UserMenu` 元件，整合登入/登出/個人選單。

3.  **Library Feature**:
    -   實作 Server Actions: `addToLibrary`, `removeFromLibrary`, `updateLibraryOrder`。
    -   新增 `AddToLibraryButton` 元件，支援即時收藏狀態切換。
    -   新增 `/library` 頁面，顯示使用者收藏的節目。
    -   新增 `LibraryList` 元件，支援拖曳排序 (`dnd-kit`)。

## 驗證步驟 (Verification Steps)

### 1. Google 登入測試
-   點擊右上角 "Login with Google"。
-   完成 Google 驗證後，應導回首頁。
-   右上角應顯示 Google 頭像。
-   點擊頭像應展開選單，顯示名稱與 Email。

### 2. 收藏功能測試
-   進入任意節目頁面 (e.g. `/shows/xxx`)。
-   標題旁應出現 "Library" (或 "+") 按鈕。
-   點擊按鈕，狀態應變更為 "In Library" (或勾選狀態)。
-   點擊 "My Library" (在 User Menu 中) 進入收藏庫。
-   確認剛收藏的節目出現在列表中。

### 3. 排序功能測試
-   在 `/library` 頁面，嘗試拖曳節目卡片。
-   放開後，順序應更新並保持。
-   重整頁面，順序應維持剛調整的狀態。

### 4. 移除測試
-   在 `/library` 頁面，點擊節目卡片上的 "In Library" 按鈕。
-   節目應保留在列表(直到刷新)，或重新進入頁面後消失。
-   或者在節目頁面點擊取消收藏，回到 Library 頁面確認已消失。

## 程式碼品質
-   運行 `npm run lint` 通過。
-   新增單元測試 `tests/unit/library-actions.test.ts`。

## 下一步
-   合併分支 `google-login-library`。
-   部署並設置 `ADMIN_EMAILS` 環境變數。
