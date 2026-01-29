# Schema 整合完成確認

## ✅ 遷移狀態

三個 SQL 遷移腳本已成功執行：

1. ✅ `001_initial_schema_integrated.sql` - 資料表結構
2. ✅ `002_rls_policies_integrated.sql` - Row Level Security 策略
3. ✅ `003_functions_integrated.sql` - 資料庫函數

## 🔍 驗證步驟

### 1. 執行驗證腳本

在 Supabase SQL Editor 中執行：

```sql
-- 執行驗證腳本
-- supabase/migrations/004_verify_integration.sql
```

這個腳本會檢查：
- ✅ 所有表是否存在
- ✅ `podcast_episodes` 表的所有欄位
- ✅ 關鍵索引
- ✅ 觸發器
- ✅ 函數
- ✅ 視圖
- ✅ RLS 策略
- ✅ 外鍵約束
- ✅ 資料同步狀態

### 2. 手動驗證查詢

#### 檢查表結構

```sql
-- 檢查 podcast_episodes 表的所有欄位
SELECT column_name, data_type, is_nullable
FROM information_schema.columns
WHERE table_name = 'podcast_episodes'
ORDER BY ordinal_position;
```

#### 檢查視圖

```sql
-- 測試 episodes 視圖
SELECT * FROM episodes LIMIT 1;
```

#### 檢查觸發器

```sql
-- 檢查同步觸發器
SELECT trigger_name, event_object_table
FROM information_schema.triggers
WHERE event_object_table = 'podcast_episodes'
  AND trigger_name LIKE '%sync%';
```

#### 測試欄位同步

```sql
-- 測試欄位同步（插入測試資料）
INSERT INTO podcast_episodes (
  episode_id, title, summary, reflection, sponsorship_info, is_published
) VALUES (
  'test-001', '測試單集', '測試摘要', '測試反思', '{"test": "value"}'::jsonb, true
);

-- 檢查是否同步
SELECT 
  summary, ai_summary,
  reflection, host_notes,
  sponsorship_info, ai_sponsorship
FROM podcast_episodes
WHERE episode_id = 'test-001';

-- 清理測試資料
DELETE FROM podcast_episodes WHERE episode_id = 'test-001';
```

## 📋 整合完成清單

### 資料表
- [x] `shows` - 節目系列
- [x] `hosts` - 主持人
- [x] `show_hosts` - 節目-主持人關聯
- [x] `podcast_episodes` - 單集節目（整合表）
- [x] `tags` - 標籤
- [x] `episode_tags` - 單集-標籤關聯
- [x] `comments` - 留言
- [x] `profiles` - 用戶檔案
- [x] `affiliate_contents` - 聯盟行銷內容
- [x] `episode_affiliates` - 單集-聯盟行銷關聯
- [x] `affiliate_clicks` - 點擊記錄

### 視圖
- [x] `episodes` - 前端別名視圖（支援讀寫）

### 功能
- [x] 欄位自動同步（summary ↔ ai_summary）
- [x] 欄位自動同步（reflection ↔ host_notes）
- [x] 欄位自動同步（sponsorship_info ↔ ai_sponsorship）
- [x] 全文搜尋索引
- [x] RLS 策略
- [x] 資料庫函數

## 🚀 後續步驟

### 1. 資料遷移（如果已有 PAL 資料）

如果 `podcast_episodes` 表中已有資料，需要補充缺少的欄位：

```sql
-- 建立預設節目系列（如果還沒有）
INSERT INTO shows (name, slug, description)
VALUES ('預設節目', 'default-show', '預設節目系列')
ON CONFLICT (slug) DO NOTHING;

-- 更新現有單集資料
UPDATE podcast_episodes
SET 
  show_id = COALESCE(show_id, (SELECT id FROM shows WHERE slug = 'default-show' LIMIT 1)),
  slug = COALESCE(slug, episode_id),
  original_url = COALESCE(original_url, 'https://example.com'),
  is_published = COALESCE(is_published, true)
WHERE show_id IS NULL OR slug IS NULL OR original_url IS NULL;
```

### 2. 測試應用程式

#### 測試前端讀取

```typescript
// 測試使用 episodes 視圖
const { data } = await supabase
  .from("episodes")
  .select("*")
  .eq("is_published", true)
  .limit(10);
```

#### 測試前端寫入

```typescript
// 測試插入（透過視圖）
const { data } = await supabase
  .from("episodes")
  .insert({
    show_id: "show-uuid",
    title: "測試單集",
    slug: "test-episode",
    original_url: "https://example.com",
    ai_summary: "測試摘要",
    is_published: true,
    episode_id: "external-id"
  })
  .select();
```

#### 測試 PAL 專案寫入

```python
# Python 範例（PAL_AIAnalyzeLocal）
episode = supabase.table("podcast_episodes").insert({
    "episode_id": "external-id",
    "title": "單集標題",
    "summary": "AI 摘要",  # 會自動同步到 ai_summary
    "reflection": "反思內容",  # 會自動同步到 host_notes
    "sponsorship_info": {"key": "value"}  # 會自動同步到 ai_sponsorship
}).execute()
```

### 3. 監控和維護

#### 檢查資料同步

定期檢查欄位同步是否正常：

```sql
-- 檢查未同步的資料
SELECT 
  id,
  episode_id,
  title,
  CASE WHEN summary IS NOT NULL AND ai_summary IS NULL THEN 'summary not synced' END as sync_issue
FROM podcast_episodes
WHERE (summary IS NOT NULL AND ai_summary IS NULL)
   OR (reflection IS NOT NULL AND host_notes IS NULL)
   OR (sponsorship_info IS NOT NULL AND ai_sponsorship IS NULL);
```

#### 手動同步資料（如果需要）

```sql
-- 執行資料遷移函數
SELECT migrate_pal_data_to_frontend_fields();
```

## ⚠️ 注意事項

1. **視圖更新限制**：雖然 `episodes` 視圖支援寫入，但複雜操作建議直接使用 `podcast_episodes` 表

2. **外鍵約束**：`show_id` 可為 NULL，允許逐步遷移。遷移完成後可考慮添加 NOT NULL 約束

3. **全文搜尋**：目前使用 `'simple'` 配置，對中文的搜尋效果可能不如專門的分詞器

4. **欄位優先順序**：視圖中優先使用前端欄位（`ai_summary`），如果為空則使用 PAL 欄位（`summary`）

## 📚 相關文件

- [整合總結](./schema-integration-summary.md)
- [遷移指南](./schema-migration-guide.md)
- [全文搜尋配置](./fulltext-search-config.md)
- [完成說明](./INTEGRATION_COMPLETE.md)

## ✨ 完成

Schema 整合已完成！兩個專案現在可以共用同一個 Supabase 資料庫。

如有任何問題，請參考相關文件或執行驗證腳本進行檢查。
