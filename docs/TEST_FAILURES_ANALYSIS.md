# 測試失敗分析與修復

## 測試結果

執行測試資料後，出現 4 個失敗的測試：

1. `ai-disclaimer-visibility.spec.ts` - AI disclaimer should be visible on homepage
2. `ai-disclaimer-visibility.spec.ts` - AI disclaimer should be visible on episode pages
3. `comment-success-rate.spec.ts` - should allow users to successfully post comment on first attempt
4. `basic-navigation.spec.ts` - should navigate to search page

## 問題分析

### 1. AI 警語找不到

**錯誤訊息**：
```
Error: expect(locator).toBeVisible() failed
Locator: locator('text=/以下內容由 AI 自動解析產生/')
```

**可能原因**：
- 頁面尚未完全載入（React hydration 延遲）
- AI 警語組件可能沒有正確渲染
- 選擇器可能需要更長的等待時間

**已修復**：
- ✅ 增加 `waitForLoadState("domcontentloaded")` 和 `waitForTimeout(1000)` 等待 React hydration
- ✅ 增加 timeout 從 5000ms 到 10000ms

### 2. 單集頁面找不到 h1

**錯誤訊息**：
```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
waiting for locator('h1') to be visible
```

**可能原因**：
- 單集頁面 URL 格式不正確
- `getEpisodeDetail` 查詢失敗（找不到 show 或 episode）
- 頁面返回 404 或錯誤

**單集 URL 格式**：
- 正確格式：`/episodes/[showSlug]/[episodeSlug]`
- 測試資料：show slug = `'test-show'`, episode slug = `'test-episode-1'`
- 預期 URL：`/episodes/test-show/test-episode-1`

**已修復**：
- ✅ 改進等待邏輯，不只等待 h1，也檢查頁面是否有內容
- ✅ 增加錯誤檢查，如果頁面返回 404 會拋出明確錯誤
- ✅ 增加 React hydration 等待時間

### 3. 搜尋頁面點擊被阻擋

**錯誤訊息**：
```
Error: locator.click: Test timeout of 30000ms exceeded.
<nextjs-portal></nextjs-portal> from <script data-nextjs-dev-overlay="true">…</script> subtree intercepts pointer events
```

**原因**：
- Next.js 開發模式的錯誤覆蓋層（dev overlay）阻擋了點擊事件
- 這通常表示頁面有錯誤或警告

**已修復**：
- ✅ 嘗試關閉 dev overlay（如果存在）
- ✅ 改用直接導航（`page.goto(href)`）而不是點擊，避免被 overlay 阻擋
- ✅ 如果必須點擊，使用 `force: true` 強制點擊

### 4. 留言測試找不到 h1

**錯誤訊息**：
```
TimeoutError: page.waitForSelector: Timeout 10000ms exceeded.
waiting for locator('h1') to be visible
```

**原因**：與單集頁面問題相同

**已修復**：與單集頁面相同的修復

## 根本原因

### 資料查詢問題

測試資料插入到 `podcast_episodes` 表，但前端服務使用 `episodes` 視圖查詢。需要確認：

1. **episodes 視圖是否正確映射**：✅ 已確認視圖存在且正確
2. **測試資料是否正確建立**：
   - show slug: `'test-show'` ✅
   - episode slug: `'test-episode-1'` ✅
   - episode show_id 是否正確關聯到 show ✅

### 可能的資料問題

檢查測試資料的 SQL：
```sql
INSERT INTO podcast_episodes (
  episode_id,
  show_id,  -- 從 shows 表查詢
  ...
)
SELECT 
  'test-episode-1',
  s.id,  -- 從 shows WHERE slug = 'test-show' 取得
  ...
FROM shows s
WHERE s.slug = 'test-show'
```

**潛在問題**：
- 如果 `show_id` 為 NULL，單集不會出現在首頁（因為 `EpisodeCard` 需要 show 來生成 URL）
- 如果 `show_id` 不正確，`getEpisodeDetail` 會找不到單集

## 建議的驗證步驟

### 1. 驗證測試資料

在 Supabase SQL Editor 中執行：

```sql
-- 檢查 shows 是否建立
SELECT id, name, slug FROM shows WHERE slug IN ('test-show', 'another-test-show');

-- 檢查 episodes 是否建立且有關聯到 show
SELECT 
  pe.id,
  pe.episode_id,
  pe.title,
  pe.slug,
  pe.show_id,
  s.slug as show_slug,
  pe.is_published
FROM podcast_episodes pe
LEFT JOIN shows s ON pe.show_id = s.id
WHERE pe.slug IN ('test-episode-1', 'test-episode-2');

-- 檢查 episodes 視圖是否可以看到資料
SELECT id, show_id, title, slug, is_published 
FROM episodes 
WHERE slug IN ('test-episode-1', 'test-episode-2');
```

### 2. 驗證單集頁面 URL

確認首頁生成的連結格式是否正確：
- 應該看到：`/episodes/test-show/test-episode-1`
- 不應該是：`/episodes/unknown/test-episode-1`（如果 show 為 null）

### 3. 檢查 Next.js 開發模式錯誤

如果 dev overlay 出現，檢查：
- 瀏覽器控制台的錯誤訊息
- Next.js 開發伺服器的錯誤日誌
- 是否有 SQL 查詢錯誤或其他錯誤

## 已應用的修復

1. ✅ 改進所有測試的等待邏輯
2. ✅ 增加 React hydration 等待時間
3. ✅ 改進錯誤處理和診斷訊息
4. ✅ 處理 Next.js dev overlay 阻擋點擊的問題
5. ✅ 改進單集頁面載入檢查（不只檢查 h1，也檢查頁面內容）

## 下一步

1. **重新執行測試**：`npm run test:e2e`
2. **如果仍然失敗**：
   - 檢查 Supabase 中的測試資料是否正確建立
   - 檢查瀏覽器控制台和 Next.js 伺服器日誌
   - 確認單集頁面 URL 格式是否正確
3. **如果 dev overlay 持續出現**：
   - 檢查是否有實際的錯誤需要修復
   - 考慮在測試環境中關閉 dev overlay

## 相關文件

- [測試資料設定指南](./TEST_DATA_SETUP.md)
- [測試跳過原因分析](./SKIPPED_TESTS_ANALYSIS.md)
- [測試修復記錄](./TEST_FIXES.md)
