# Quickstart: Library 頁面「我的留言」Tab

**Feature Branch**: `009-library-commented-tab`

## 開發前準備

```bash
git checkout 009-library-commented-tab
npm install
npm run dev
```

## 實作順序（建議）

### Step 1: 新增 CommentedEpisodeList 元件

1. 建立 `src/components/library/CommentedEpisodeList.tsx`
2. 複用 `EpisodeLibraryList.tsx` 的設計模式
3. 額外顯示留言數量（例如「3 則留言」）

### Step 2: 修改 Library 頁面

1. 新增查詢使用者的 approved 留言（comments 表）
2. 在應用層按 episode_id 分組、計數、取最新時間
3. 查詢對應的單集詳情（episodes VIEW + shows join）
4. 將 Tabs 從 2 欄改為 3 欄，新增「我的留言」Tab

## 驗證

```bash
# 1. 啟動開發伺服器
npm run dev

# 2. 手動測試
# - 登入 → 到任一單集詳情頁留言 → 到 Library 頁面
# - 點擊「我的留言」Tab → 確認該單集出現並顯示留言數量
# - 確認空狀態（沒有留言時顯示提示文字）

# 3. Lint 檢查
npm run lint
```

## 關鍵檔案一覽

| 檔案 | 動作 | 說明 |
|------|------|------|
| `src/app/(public)/library/page.tsx` | 修改 | 新增留言查詢、Tabs 改為 3 欄、新增「我的留言」Tab |
| `src/components/library/CommentedEpisodeList.tsx` | 新增 | 留言過的單集列表元件 |
