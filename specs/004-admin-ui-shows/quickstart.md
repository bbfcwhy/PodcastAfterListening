# Quickstart: 後台 UI 風格統一與節目管理

**Feature**: 004-admin-ui-shows
**Date**: 2026-01-30

## 快速驗收清單

### UI 風格統一

- [ ] 後台側邊欄使用 `bg-surface` 底色
- [ ] 側邊欄導覽項目 hover 使用 `bg-hover`
- [ ] 後台頁面主區域使用 `bg-canvas` 底色
- [ ] 表格使用 `bg-surface` 底色、`border-border-subtle` 分隔線
- [ ] 表格行 hover 使用 `bg-hover`
- [ ] 主按鈕使用 `bg-cta` + `text-text-primary`
- [ ] 無硬編色碼（如 `#xxx`）直接寫在元件上

### 節目管理功能

- [ ] 側邊欄顯示「節目管理」連結，位於「儀表板」之後
- [ ] 點擊「節目管理」導向 `/shows` 頁面
- [ ] `/shows` 頁面顯示節目列表（名稱、slug、封面、建立時間）
- [ ] 點擊「編輯」導向 `/shows/{id}/edit`
- [ ] 點擊「新增節目」導向 `/shows/new`
- [ ] `/shows/new` 可填寫節目資訊並建立
- [ ] `/shows/{id}/edit` 預填現有資料，可修改並儲存
- [ ] slug 重複時顯示錯誤訊息
- [ ] 修改未儲存時離開頁面，顯示確認對話框
- [ ] 同時編輯產生衝突時，顯示衝突提示

## 本地開發

```bash
# 啟動開發伺服器
npm run dev

# 訪問後台
open http://localhost:3000/dashboard

# 訪問節目管理
open http://localhost:3000/shows
```

## 相關檔案

### 新增檔案

- `src/app/(admin)/shows/page.tsx` - 節目列表頁
- `src/app/(admin)/shows/new/page.tsx` - 新增節目頁
- `src/app/(admin)/shows/[id]/edit/page.tsx` - 編輯節目頁
- `src/app/api/admin/shows/route.ts` - 節目 API
- `src/app/api/admin/shows/[id]/route.ts` - 單一節目 API
- `src/components/admin/ShowTable.tsx` - 節目列表表格
- `src/components/admin/ShowForm.tsx` - 節目表單
- `src/lib/services/admin/shows.ts` - 節目服務層

### 修改檔案

- `src/app/(admin)/layout.tsx` - 側邊欄樣式 + 新增連結
- `src/app/(admin)/dashboard/page.tsx` - 樣式調整
- `src/components/admin/EpisodeTable.tsx` - 樣式調整
- `src/components/admin/EpisodeForm.tsx` - 樣式調整
- `src/components/admin/CommentModerationTable.tsx` - 樣式調整
- `src/components/admin/AffiliateForm.tsx` - 樣式調整
- `src/components/admin/AdminPagination.tsx` - 樣式調整
