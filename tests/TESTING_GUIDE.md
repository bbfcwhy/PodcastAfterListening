# 測試指南

## 問題說明

由於 Next.js 16 的路由限制，Playwright 的自動伺服器啟動可能會遇到路由衝突錯誤。這是因為我們有兩個不同的動態路由結構：
- `(public)/episodes/[showSlug]/[episodeSlug]` - 公開頁面
- `(admin)/episodes/[id]/edit` - 管理頁面

雖然它們在不同的路由組中，但 Next.js 16 在開發模式下可能會報告這個警告。

## 解決方案

### 方案 1：手動啟動伺服器（推薦）

1. 在一個終端啟動開發伺服器：
```bash
npm run dev
```

2. 在另一個終端執行測試：
```bash
npm run test:e2e
```

這樣可以避免 Playwright 自動啟動伺服器時的路由衝突問題。

### 方案 2：使用 UI 模式

使用 Playwright 的 UI 模式可以更好地調試測試：

```bash
npm run test:e2e:ui
```

### 方案 3：調整路由結構（進階）

如果需要完全解決路由衝突，可以考慮調整管理後台的路由結構：
- 將 `/admin/episodes/[id]/edit` 改為 `/admin/episodes/edit/[id]`

但這需要修改多個檔案，且當前結構在生產環境中運作正常。

## 測試執行

### 基本測試

```bash
# 手動啟動伺服器後執行測試
npm run dev  # 終端 1
npm run test:e2e  # 終端 2
```

### 特定測試

```bash
# 執行特定測試檔案
npx playwright test tests/e2e/ai-disclaimer-visibility.spec.ts

# 執行特定測試案例
npx playwright test -g "AI disclaimer should be visible"
```

### 除錯模式

```bash
# 使用 UI 模式
npm run test:e2e:ui

# 使用 headed 模式（顯示瀏覽器）
npx playwright test --headed

# 使用 debug 模式
npx playwright test --debug
```

## 測試覆蓋範圍

### E2E 測試

- ✅ 基本導航 (`basic-navigation.spec.ts`)
- ✅ 留言發布成功率 (`comment-success-rate.spec.ts`)
- ✅ 管理後台建立節目 (`admin-episode-creation.spec.ts`)
- ✅ AI 警語可見性 (`ai-disclaimer-visibility.spec.ts`)

### 整合測試

- ✅ 聯盟行銷追蹤 (`affiliate-tracking.spec.ts`)

### 負載測試

- ✅ 並發用戶支援 (`concurrent-users.ts`)

## 測試資料需求

測試需要以下資料才能正常執行：

1. **至少一個節目系列** (show)
2. **至少一個已發布的單集** (episode)
3. **（可選）測試用的管理員帳號**

如果沒有資料，某些測試會自動跳過（使用 `test.skip()`）。

## 環境變數

確保設定以下環境變數：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
BASE_URL=http://localhost:3000  # 測試用
```

## 注意事項

1. **路由衝突警告**：開發模式下可能會看到路由衝突警告，但不影響功能
2. **認證測試**：需要認證的測試需要額外設定 OAuth 或使用測試模式
3. **資料依賴**：某些測試需要實際的資料庫資料
4. **時間限制**：測試有超時設定，如果伺服器啟動較慢可能需要調整

## 疑難排解

### 問題：伺服器無法啟動

**解決方案**：手動啟動伺服器，然後執行測試

### 問題：測試找不到元素

**解決方案**：
- 檢查頁面是否正確載入
- 使用 `page.pause()` 暫停測試進行檢查
- 使用 `page.screenshot()` 截圖查看頁面狀態

### 問題：認證相關測試失敗

**解決方案**：
- 設定測試用的 OAuth 認證
- 或修改測試以跳過認證檢查
