# 測試資料設定指南

## 問題

所有 E2E 測試都被跳過，主要原因是：
1. **沒有測試資料**（沒有節目系列、沒有單集）
2. **需要認證但沒有測試憑證**
3. **開發伺服器未啟動**

## 解決方案

### 步驟 1：啟動開發伺服器

```bash
npm run dev
```

確認伺服器在 `http://localhost:3000` 正常運行。

### 步驟 2：準備測試資料

#### 方法 A：使用 SQL 腳本（推薦）

在 Supabase SQL Editor 中執行：

```bash
# 查看腳本內容
cat scripts/seed-test-data.sql

# 然後在 Supabase Dashboard > SQL Editor 中執行
```

或直接執行：

```sql
-- 建立測試節目系列
INSERT INTO shows (name, slug, description) 
VALUES ('測試節目系列', 'test-show', '這是用於測試的節目系列')
ON CONFLICT (slug) DO NOTHING;

-- 建立測試單集
INSERT INTO podcast_episodes (
  show_id, title, slug, is_published, 
  summary, ai_summary, original_url
)
SELECT 
  id, '測試單集', 'test-episode', true,
  '這是測試單集的大綱',
  '這是 AI 生成的摘要',
  'https://example.com/episode'
FROM shows WHERE slug = 'test-show'
ON CONFLICT DO NOTHING;
```

#### 方法 B：透過管理後台建立

1. 登入管理後台（需要管理員帳號）
2. 建立節目系列
3. 建立單集

### 步驟 3：驗證資料

確認資料已建立：

```sql
-- 檢查節目系列
SELECT id, name, slug FROM shows WHERE slug = 'test-show';

-- 檢查單集
SELECT id, title, slug, is_published 
FROM podcast_episodes 
WHERE slug = 'test-episode';
```

### 步驟 4：重新執行測試

```bash
npm run test:e2e
```

## 測試資料需求

### 基本測試資料

- **至少 1 個節目系列 (show)**
  - 名稱：任意
  - Slug：任意（建議使用 `test-show`）
  - 已發布：是

- **至少 1 個已發布的單集 (episode)**
  - 標題：任意
  - Slug：任意（建議使用 `test-episode`）
  - 所屬節目：上述節目系列
  - 已發布：是
  - 有 AI 摘要：是（用於測試 AI 警語）

### 進階測試資料（可選）

- **測試用的管理員帳號**（用於管理後台測試）
- **測試用的留言**（用於留言功能測試）

## 測試資料清理

測試完成後，可以清理測試資料：

```sql
-- 清理測試資料（謹慎使用）
DELETE FROM podcast_episodes WHERE slug LIKE 'test-%';
DELETE FROM shows WHERE slug LIKE 'test-%';
```

## 自動化測試資料準備

可以建立一個腳本自動準備測試資料：

```bash
#!/bin/bash
# scripts/prepare-test-data.sh

echo "準備測試資料..."

# 在 Supabase 中執行 SQL 腳本
# 這需要 Supabase CLI 或 API 存取
supabase db execute -f scripts/seed-test-data.sql

echo "測試資料準備完成！"
```

## 相關資源

- [測試資料準備腳本](../scripts/seed-test-data.sql)
- [測試跳過原因分析](./TEST_SKIP_ANALYSIS.md)
- [測試指南](./TESTING_GUIDE.md)
