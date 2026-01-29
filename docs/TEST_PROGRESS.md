# E2E 測試進度報告

## 測試結果摘要

目前測試狀態：
- **3 個通過** ✓
- **2 個失敗** ✗
- **2 個跳過** ⊘

## 已通過的測試

1. **basic-navigation.spec.ts** - "should display search bar on homepage" ✓
2. **ai-disclaimer-visibility.spec.ts** - "AI disclaimer should be visible on episode pages" ✓
3. **ai-disclaimer-visibility.spec.ts** - "AI disclaimer should be visible on homepage" ✓

## 失敗的測試

### 1. basic-navigation.spec.ts - "should navigate to search page"

**問題**：無法找到搜尋頁面的標題 "搜尋節目"

**根本原因**：
- 搜尋頁面有 SQL 錯誤（`SELECT DISTINCT` 與 `ORDER BY` 衝突）
- 錯誤訊息：`for SELECT DISTINCT, ORDER BY expressions must appear in select list`
- 雖然有 fallback 機制，但頁面載入可能受到影響

**已修復**：
- ✅ 修復了 `search_episodes` 函數的 SQL 語法錯誤（使用 `SELECT DISTINCT ON`）
- ✅ 改進了測試的等待邏輯和選擇器
- ✅ 更新了 `basicSearch` 函數使用 `podcast_episodes` 表

**需要執行**：在 Supabase 中重新執行修復後的 `003_functions_integrated.sql` 中的 `search_episodes` 函數

### 2. admin-episode-creation.spec.ts - "admin should be able to create episode within 2 minutes"

**問題**：無法找到表單元素或頁面標題

**可能原因**：
- 需要管理員認證（測試會被跳過）
- 表單使用 Radix UI Select，不是原生 select 元素
- 沒有測試資料（節目系列）

**已修復**：
- ✅ 更新測試以支援 Radix UI Select 組件
- ✅ 改進了等待邏輯和錯誤處理
- ✅ 修復了變數重複宣告的語法錯誤

## 跳過的測試

1. **comment-success-rate.spec.ts** - 需要測試資料（單集）和認證
2. **admin-episode-creation.spec.ts** - 需要管理員認證和測試資料（節目系列）

## 已修復的問題

1. ✅ Playwright 瀏覽器未安裝
2. ✅ 覆蓋首頁的檔案（刪除 `src/app/page.tsx`）
3. ✅ 測試選擇器問題（使用更精確的選擇器）
4. ✅ SQL 函數語法錯誤（`SELECT DISTINCT` 與 `ORDER BY` 衝突）
5. ✅ `basicSearch` 函數使用錯誤的表名（從 `episodes` 改為 `podcast_episodes`）
6. ✅ 測試中的變數重複宣告錯誤

## 下一步

1. **在 Supabase 中重新執行修復後的 SQL 函數**：
   ```sql
   -- 執行 supabase/migrations/003_functions_integrated.sql 中的 search_episodes 函數修復
   -- 特別注意 SELECT DISTINCT ON 的語法
   ```

2. **準備測試資料**（參考 `docs/TEST_DATA_SETUP.md`）：
   - 建立至少 1 個節目系列
   - 建立至少 1 個已發布的單集

3. **設定測試認證**（可選）：
   - 為管理後台測試設定測試用的管理員帳號

## 相關資源

- [測試資料設定指南](./TEST_DATA_SETUP.md)
- [測試跳過原因分析](./TEST_SKIP_ANALYSIS.md)
- [測試修復記錄](./TEST_FIXES.md)
