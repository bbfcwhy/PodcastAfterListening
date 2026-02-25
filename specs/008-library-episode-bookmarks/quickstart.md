# Quickstart: Library 收藏功能修復與單集收藏

**Feature Branch**: `008-library-episode-bookmarks`

## 開發前準備

```bash
git checkout 008-library-episode-bookmarks
npm install
npm run dev
```

## 實作順序（建議）

### Step 1: 修復 Library Bug（P1）

1. **`src/app/(public)/library/page.tsx`** — 加入 `export const dynamic = "force-dynamic"`
2. **`src/components/library/AddToLibraryButton.tsx`** — 操作完成後呼叫 `router.refresh()`
3. **`src/lib/library/actions.ts`** — 修正 `revalidatePath` 的路徑

### Step 2: 新增 episode_library_items 表

1. 在 Supabase 建立 `episode_library_items` 表（參考 `data-model.md`）
2. 設定 RLS 政策
3. 更新 `src/types/database.ts` 新增型別定義

### Step 3: 單集收藏 Server Actions

1. 建立 `src/lib/library/episode-actions.ts`
2. 實作 `addEpisodeToLibrary` 和 `removeEpisodeFromLibrary`

### Step 4: 單集收藏按鈕元件

1. 建立 `src/components/library/AddEpisodeToLibraryButton.tsx`
2. 整合到 `src/app/(public)/episodes/[showSlug]/[episodeSlug]/page.tsx`

### Step 5: Library 頁面分類

1. 修改 `src/app/(public)/library/page.tsx` 查詢單集收藏
2. 新增 `src/components/library/EpisodeLibraryList.tsx`
3. 用 Tabs 元件整合頻道和單集列表

## 驗證

```bash
# 1. 啟動開發伺服器
npm run dev

# 2. 手動測試
# - 登入 → 到頻道頁面收藏 → 到 Library 頁面確認顯示
# - 登入 → 到單集頁面收藏 → 到 Library 頁面切換到「單集」Tab 確認顯示
# - 取消收藏 → 確認從 Library 移除

# 3. Lint 檢查
npm run lint
```

## 關鍵檔案一覽

| 檔案 | 動作 | 說明 |
|------|------|------|
| `src/app/(public)/library/page.tsx` | 修改 | 加 force-dynamic、新增單集查詢、Tab 切換 |
| `src/lib/library/actions.ts` | 修改 | 修正 revalidatePath |
| `src/components/library/AddToLibraryButton.tsx` | 修改 | 加 router.refresh() |
| `src/components/library/LibraryList.tsx` | 修改 | 修正 stale props 問題 |
| `src/lib/library/episode-actions.ts` | 新增 | 單集收藏 Server Actions |
| `src/components/library/AddEpisodeToLibraryButton.tsx` | 新增 | 單集收藏按鈕 |
| `src/components/library/EpisodeLibraryList.tsx` | 新增 | 單集收藏列表 |
| `src/types/database.ts` | 修改 | 新增 EpisodeLibraryItem 型別 |
| `supabase/policies.sql` | 修改 | 新增表和 RLS 政策 |
