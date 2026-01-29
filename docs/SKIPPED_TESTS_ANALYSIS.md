# 被跳過測試的詳細分析

## 測試結果摘要

目前有 **3 個測試被跳過**，這些都是預期的行為，因為需要特定的測試條件。

## 被跳過的測試詳情

### 1. admin-episode-creation.spec.ts
**測試名稱**：`admin should be able to create episode within 2 minutes`

**跳過原因**：
- **主要原因**：`Admin authentication required - test credentials not configured`
- **觸發條件**：當訪問 `/admin/episodes/new` 時，系統檢測到需要管理員認證，會重定向到首頁（URL 包含 `redirect=` 參數）

**程式碼位置**：
```typescript
// tests/e2e/admin-episode-creation.spec.ts:21-24
if (currentUrl.includes("/login") || currentUrl === "/" || currentUrl.includes("redirect=")) {
  test.skip("Admin authentication required - test credentials not configured");
  return;
}
```

**解決方法**：
1. 在測試環境中設定測試用的管理員帳號
2. 在測試中模擬認證狀態
3. 暫時跳過認證檢查（僅限測試環境）

---

### 2. ai-disclaimer-visibility.spec.ts
**測試名稱**：`AI disclaimer should be visible on episode pages`

**跳過原因**：
- **主要原因**：`No episodes available for testing`
- **觸發條件**：首頁上找不到任何單集連結（`episodeCount === 0`）

**程式碼位置**：
```typescript
// tests/e2e/ai-disclaimer-visibility.spec.ts:18-20
if (episodeCount === 0) {
  test.skip("No episodes available for testing");
  return;
}
```

**解決方法**：
1. 在 Supabase 中建立至少一個已發布的單集
2. 執行測試資料準備腳本（`scripts/seed-test-data.sql`）
3. 確保單集的 `is_published` 欄位為 `true`

---

### 3. comment-success-rate.spec.ts
**測試名稱**：`should allow users to successfully post comment on first attempt`

**可能的跳過原因**（依檢查順序）：

1. **`No episodes available for testing`**
   - 觸發條件：首頁上找不到單集連結
   - 程式碼位置：`tests/e2e/comment-success-rate.spec.ts:17-19`

2. **`No episode URL found`**
   - 觸發條件：找到連結但沒有 `href` 屬性
   - 程式碼位置：`tests/e2e/comment-success-rate.spec.ts:24-26`

3. **`Login required - test credentials not configured`**
   - 觸發條件：單集頁面顯示「請先登入」提示
   - 程式碼位置：`tests/e2e/comment-success-rate.spec.ts:39-43`

**解決方法**：
1. 建立測試資料（至少一個已發布的單集）
2. 確認留言功能不需要登入，或設定測試認證
3. 檢查留言表單是否正確顯示

---

## 快速解決方案

### 方案 1：建立測試資料（最簡單）

在 Supabase SQL Editor 中執行以下 SQL：

```sql
-- 建立測試節目系列
INSERT INTO shows (id, name, slug, description, original_url) 
VALUES (
  '00000000-0000-0000-0000-000000000001',
  '測試節目',
  'test-show',
  '這是測試節目',
  'https://example.com/show'
)
ON CONFLICT (slug) DO NOTHING;

-- 建立測試單集（已發布）
INSERT INTO podcast_episodes (
  id,
  show_id,
  title,
  slug,
  is_published,
  ai_summary,
  original_url,
  published_at
)
VALUES (
  '20000000-0000-0000-0000-000000000001',
  '00000000-0000-0000-0000-000000000001',
  '測試單集',
  'test-episode',
  true,
  '這是 AI 生成的測試摘要',
  'https://example.com/episode',
  CURRENT_DATE
)
ON CONFLICT (show_id, slug) DO NOTHING;
```

或者使用現有的測試資料腳本：

```bash
# 在 Supabase SQL Editor 中執行
# scripts/seed-test-data.sql
```

### 方案 2：設定測試認證（進階）

如果需要執行管理後台測試，可以：

1. **建立測試管理員帳號**：
   ```sql
   -- 在 Supabase Dashboard 中建立測試使用者
   -- 然後更新 profiles 表設定 is_admin = true
   ```

2. **在測試中模擬認證**：
   - 使用 Playwright 的認證狀態儲存功能
   - 設定測試環境變數來跳過認證檢查

### 方案 3：使用測試資料準備腳本

已經有準備好的測試資料腳本：

```bash
# 在 Supabase SQL Editor 中執行
# scripts/seed-test-data.sql
```

這個腳本會建立：
- 2 個測試節目系列
- 2 個測試單集
- 2 個測試主持人
- 2 個測試標籤

---

## 測試跳過邏輯說明

這些測試使用條件式跳過（conditional skip），這是良好的測試實踐：

1. **避免測試失敗**：當必要條件不滿足時，跳過測試比失敗更合理
2. **清晰的訊息**：每個跳過都有明確的原因說明
3. **易於除錯**：可以根據跳過訊息快速知道需要什麼條件

---

## 預期行為

在沒有測試資料的情況下：
- ✅ **4 個測試通過**：基本導航和首頁功能測試
- ⏭️ **3 個測試跳過**：需要資料或認證的測試

這是**正常且預期的行為**。

---

## 下一步建議

1. **立即執行**：在 Supabase 中執行 `scripts/seed-test-data.sql` 來建立測試資料
2. **重新執行測試**：執行 `npm run test:e2e` 查看跳過的測試是否減少
3. **可選**：如果需要測試管理後台功能，設定測試認證

---

## 相關資源

- [測試資料設定指南](./TEST_DATA_SETUP.md)
- [測試進度報告](./TEST_PROGRESS.md)
- [測試跳過原因分析](./TEST_SKIP_ANALYSIS.md)
