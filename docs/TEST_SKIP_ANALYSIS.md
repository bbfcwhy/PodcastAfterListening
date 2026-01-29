# 測試跳過原因分析

## 測試報告結果

根據測試報告，所有 7 個測試都被標記為 "skipped"（跳過）。

## 跳過原因分析

### 1. basic-navigation.spec.ts (3 個測試)

這些測試**不應該**被跳過，因為它們是基本功能測試，不需要特殊資料或認證。

**可能原因**：
- 開發伺服器未啟動（port 3000 沒有服務）
- 頁面無法載入
- 測試執行時發生錯誤

### 2. comment-success-rate.spec.ts (1 個測試)

**跳過條件**：
- 沒有單集可用（`test.skip("No episodes available for testing")`）
- 需要登入但沒有測試憑證（`test.skip("Login required - test credentials not configured")`）

### 3. admin-episode-creation.spec.ts (1 個測試)

**跳過條件**：
- 需要管理員認證但沒有測試憑證（`test.skip("Admin authentication required - test credentials not configured")`）
- 沒有節目系列可用（`test.skip("No shows available - need to create a show first")`）

### 4. ai-disclaimer-visibility.spec.ts (2 個測試)

**跳過條件**：
- 沒有單集可用（`test.skip("No episodes available for testing")`）
- 首頁測試可能因為頁面無法載入而失敗

## 解決方案

### 方案 1：確保開發伺服器正在運行

測試執行前，確保開發伺服器正在運行：

```bash
# 終端 1：啟動開發伺服器
npm run dev

# 終端 2：執行測試
npm run test:e2e
```

### 方案 2：準備測試資料

在 Supabase 中建立測試資料：

1. **建立至少一個節目系列 (show)**
2. **建立至少一個已發布的單集 (episode)**

可以使用 SQL 腳本或透過管理後台建立。

### 方案 3：設定測試認證

對於需要認證的測試，可以：

1. **使用測試模式**：在測試中模擬認證狀態
2. **設定測試憑證**：建立測試用的 OAuth 認證
3. **跳過認證檢查**：在測試環境中暫時跳過認證

### 方案 4：改進測試以處理空資料狀態

修改測試，使其在沒有資料時也能執行基本檢查：

```typescript
// 即使沒有單集，也可以測試首頁是否正常載入
test("should load homepage successfully", async ({ page }) => {
  await page.goto("/");
  await page.waitForLoadState("networkidle");
  
  // 檢查頁面是否正常載入（即使沒有內容）
  await expect(page.locator("body")).toBeVisible();
});
```

## 快速修復步驟

### 1. 啟動開發伺服器

```bash
npm run dev
```

確認伺服器在 `http://localhost:3000` 正常運行。

### 2. 建立測試資料

在 Supabase Dashboard 或使用 SQL 建立：

```sql
-- 建立測試節目系列
INSERT INTO shows (name, slug, description) 
VALUES ('測試節目', 'test-show', '這是測試節目');

-- 建立測試單集
INSERT INTO podcast_episodes (show_id, title, slug, is_published, summary)
SELECT id, '測試單集', 'test-episode', true, '這是測試單集'
FROM shows WHERE slug = 'test-show'
LIMIT 1;
```

### 3. 重新執行測試

```bash
npm run test:e2e
```

## 測試資料準備腳本

可以建立一個測試資料準備腳本：

```sql
-- scripts/seed-test-data.sql
-- 建立測試節目系列
INSERT INTO shows (name, slug, description) 
VALUES ('測試節目', 'test-show', '這是測試節目')
ON CONFLICT (slug) DO NOTHING;

-- 建立測試單集
INSERT INTO podcast_episodes (
  show_id, title, slug, is_published, 
  summary, ai_summary, original_url
)
SELECT 
  s.id, 
  '測試單集', 
  'test-episode', 
  true,
  '這是測試單集的大綱',
  '這是 AI 生成的摘要',
  'https://example.com/episode'
FROM shows s
WHERE s.slug = 'test-show'
ON CONFLICT DO NOTHING;
```

## 相關資源

- [測試指南](./TESTING_GUIDE.md)
- [測試狀態](./TEST_STATUS.md)
- [E2E 測試設定說明](./E2E_TEST_SETUP.md)
