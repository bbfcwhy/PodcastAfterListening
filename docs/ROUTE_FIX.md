# 路由衝突修復說明

## 問題

Next.js 16 不允許在同一個路徑層級使用不同的動態參數名稱。原本的路由結構：

- `(public)/episodes/[showSlug]/[episodeSlug]` - 公開頁面
- `(admin)/episodes/[id]/edit` - 管理頁面編輯

這兩個路由在 `/episodes/` 層級使用了不同的參數名稱（`showSlug` vs `id`），導致 Next.js 16 報錯。

## 解決方案

將管理後台的編輯路由從 `/admin/episodes/[id]/edit` 改為 `/admin/episodes/edit/[id]`。

### 變更內容

1. **路由結構變更**：
   - 舊：`src/app/(admin)/episodes/[id]/edit/page.tsx`
   - 新：`src/app/(admin)/episodes/edit/[id]/page.tsx`

2. **更新引用**：
   - `src/components/admin/EpisodeTable.tsx` - 更新編輯連結

### 新的路由結構

```
(public)/
  episodes/
    [showSlug]/
      [episodeSlug]/page.tsx  ✅ 公開單集頁面

(admin)/
  episodes/
    edit/
      [id]/page.tsx  ✅ 管理後台編輯頁面（新結構）
    new/page.tsx  ✅ 管理後台新增頁面
    page.tsx  ✅ 管理後台列表頁面
```

## 驗證

修復後，開發伺服器可以正常啟動：

```bash
npm run dev
# ✓ Ready in 768ms
```

## 注意事項

1. **Middleware 警告**：Next.js 16 建議使用 `proxy` 而不是 `middleware`，但這只是警告，不影響功能
2. **向後相容**：如果已有書籤或外部連結指向舊路由，需要更新
3. **API 路由不受影響**：`/api/admin/episodes/[id]` 不受此變更影響

## 相關檔案

- `src/app/(admin)/episodes/edit/[id]/page.tsx` - 新的編輯頁面
- `src/components/admin/EpisodeTable.tsx` - 更新的編輯連結
