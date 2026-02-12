# 實作計畫：Google 登入與 Library 功能

**Branch**: `006-google-login-library` | **Spec**: `specs/006-google-login-library/spec.md`

## 摘要

本計畫旨在實作 Google OAuth 登入整合、自動化使用者註冊 (JIT Provisioning)、基於環境變數的管理員權限控管，以及使用者專屬的 Podcast 收藏庫 (Library) 功能。

## 技術背景 (Technical Context)

- **語言/版本**: TypeScript 5.x, Node.js 18+
- **框架**: Next.js 14 (App Router)
- **資料庫**: Supabase (PostgreSQL)
- **驗證**: Supabase Auth (OAuth - Google)
- **樣式**: Tailwind CSS
- **主要依賴**: `@supabase/ssr`, `lucide-react` (icons)

## 憲章檢查 (Constitution Check)

- [x] **語言規範**: 計畫與任務清單皆使用繁體中文撰寫。
- [x] **SDD**: 已有 `spec.md`，且本計畫將產生 `tasks.md`。
- [x] **驗證優先**: 每個功能皆包含獨立測試與驗收腳本。

## 專案結構 (Project Structure)

```text
src/
├── app/
│   ├── (public)/
│   │   ├── library/             # [NEW] Library 頁面
│   │   │   └── page.tsx
│   ├── auth/
│   │   └── callback/            # [EXISTING] OAuth Callback
│   │       └── route.ts
├── components/
│   ├── library/                 # [NEW] Library 相關元件
│   │   ├── AddToLibraryButton.tsx
│   │   └── LibraryList.tsx
│   └── navbar/
│       └── UserMenu.tsx         # [MODIFY] 整合登入狀態與 Library 連結
├── lib/
│   ├── auth/
│   │   └── actions.ts           # [NEW] Server Actions for Library
└── types/
    └── database.ts              # [MODIFY] 更新 DB Schema 定義
```

## 實作詳細規劃 (Phases)

### Phase 1: 資料庫與型別定義 (Database & Types)

1.  **Schema Update**:
    -   修改 `profiles` 表格：新增 `display_name`, `avatar_url`。
    -   新增 `library_items` 表格：`id`, `user_id`, `show_id`, `position`, `added_at`。
    -   建立 RLS (Row Level Security) 策略：
        -   `profiles`: Users can read/update own profile.
        -   `library_items`: Users can CRUD own items.
2.  **Type Definition**:
    -   更新 `src/types/database.ts` 以反映上述變更。

### Phase 2: 認證流程優化 (Auth & User Sync)

1.  **Auth Context**:
    -   確保登入後能獲取 `display_name` 與 `avatar_url`。
    -   實作 Post-Login Hook (或在 Callback 中) 同步 Google Profile 到 `profiles` 表格。
2.  **Admin Check**:
    -   建立 `isAdmin(email: string)` 函式，讀取 `process.env.ADMIN_EMAILS` 判斷權限。（前端不應暴露此邏輯，僅 Server Side 驗證）。

### Phase 3: Library 功能實作 (Library Feature)

1.  **Server Actions**:
    -   `addToLibrary(showId)`: 新增收藏，處理重複檢查。
    -   `removeFromLibrary(showId)`: 移除收藏。
    -   `updateLibraryOrder(items)`: 更新排序 (position)。
2.  **UI Components**:
    -   `AddToLibraryButton`: 根據收藏狀態顯示 "Add" 或 "In Library" (或 Icon)。
    -   `LibraryList`: 顯示收藏的節目，支援 Drag & Drop 排序 (可使用 `dnd-kit` 或簡單實作)。
3.  **Page Implementation**:
    -   `/library`: 僅限登入使用者訪問，列出 `library_items` join `shows`。

## 驗證計畫 (Verification Plan)

### 自動化測試 (Automated Tests)
-   由於專案目前主要依賴手動測試，本次重點在於單元測試 Server Actions。
-   `tests/unit/library-actions.test.ts`: 測試 `addToLibrary` 重複添加、移除不存在項目等情境。

### 手動驗證 (Manual Verification)
1.  **Login Flow**:
    -   使用 Google 登入，確認 `profiles` 表格中有正確的 `display_name` 與 `avatar_url`。
2.  **Admin Access**:
    -   使用 `ADMIN_EMAILS` 中的帳號登入，確認可見 Admin Link。
    -   使用非 Admin 帳號，確認不可見。
3.  **Library Operations**:
    -   點擊收藏按鈕，確認按鈕狀態即時更新。
    -   進入 `/library`，確認看到剛收藏的節目。
    -   重新整理頁面，確認資料未消失。
    -   測試排序功能 (若實作 Drag & Drop)。
