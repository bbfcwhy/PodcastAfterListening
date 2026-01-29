# 重新執行修復後的 search_episodes 函數

## 修復內容說明

`search_episodes` 函數已修復，主要變更：

1. **修復前**：使用 `SELECT DISTINCT` 搭配 `ORDER BY`，導致 PostgreSQL 錯誤
2. **修復後**：使用 `SELECT DISTINCT ON (pe.published_at DESC, pe.id)` 並在 `ORDER BY` 中匹配相同條件

**錯誤訊息**（修復前）：
```
ERROR: 42P10: for SELECT DISTINCT, ORDER BY expressions must appear in select list
```

**修復後的關鍵變更**：
```sql
-- 修復前（錯誤）
SELECT DISTINCT e.*
...
ORDER BY e.published_at DESC;

-- 修復後（正確）
SELECT DISTINCT ON (pe.published_at, pe.id)
  pe.id,
  ...
ORDER BY pe.published_at DESC, pe.id;
```

**重要**：`DISTINCT ON` 子句中不能使用 `DESC`，`DESC` 只能在 `ORDER BY` 子句中使用。

---

## 執行步驟

### 方法 1：在 Supabase Dashboard 中執行（推薦）

1. **登入 Supabase Dashboard**
   - 前往 https://supabase.com/dashboard
   - 選擇你的專案

2. **開啟 SQL Editor**
   - 在左側選單點擊「SQL Editor」
   - 點擊「New query」建立新查詢

3. **複製並貼上修復後的函數**
   
   複製以下 SQL 程式碼（從 `supabase/migrations/003_functions_integrated.sql` 第 8-65 行）：

```sql
CREATE OR REPLACE FUNCTION search_episodes(
  query TEXT,
  filter_show_id UUID DEFAULT NULL,
  filter_tags UUID[] DEFAULT '{}',
  from_date DATE DEFAULT NULL,
  to_date DATE DEFAULT NULL
)
RETURNS TABLE (
  id UUID,
  show_id UUID,
  title TEXT,
  slug TEXT,
  published_at DATE,
  original_url TEXT,
  ai_summary TEXT,
  ai_sponsorship TEXT,
  host_notes TEXT,
  duration_seconds INTEGER,
  is_published BOOLEAN,
  created_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ
) AS $$
BEGIN
  RETURN QUERY
  SELECT DISTINCT ON (pe.published_at, pe.id)
    pe.id,
    pe.show_id,
    pe.title,
    pe.slug,
    pe.published_at::DATE as published_at,
    pe.original_url,
    COALESCE(pe.ai_summary, pe.summary) as ai_summary,
    COALESCE(pe.ai_sponsorship, pe.sponsorship_info::TEXT) as ai_sponsorship,
    COALESCE(pe.host_notes, pe.reflection) as host_notes,
    pe.duration_seconds,
    pe.is_published,
    pe.created_at,
    pe.updated_at
  FROM podcast_episodes pe
  WHERE pe.is_published = true
    AND (query IS NULL OR query = '' OR 
         to_tsvector('simple', 
           pe.title || ' ' || 
           coalesce(pe.ai_summary, pe.summary, '') || ' ' || 
           coalesce(pe.host_notes, pe.reflection, '')
         ) @@ plainto_tsquery('simple', query))
    AND (filter_show_id IS NULL OR pe.show_id = filter_show_id)
    AND (from_date IS NULL OR pe.published_at::DATE >= from_date)
    AND (to_date IS NULL OR pe.published_at::DATE <= to_date)
    AND (array_length(filter_tags, 1) IS NULL OR 
         EXISTS (
           SELECT 1 FROM episode_tags et
           WHERE et.episode_id = pe.id
           AND et.tag_id = ANY(filter_tags)
         ))
  ORDER BY pe.published_at DESC, pe.id;
END;
$$ LANGUAGE plpgsql STABLE;
```

4. **執行 SQL**
   - 點擊「Run」按鈕（或按 `Cmd/Ctrl + Enter`）
   - 確認沒有錯誤訊息

5. **驗證函數已更新**
   
   執行以下測試查詢確認函數正常運作：

```sql
-- 測試搜尋功能（不帶任何篩選條件）
SELECT * FROM search_episodes('', NULL, '{}', NULL, NULL) LIMIT 5;

-- 測試帶關鍵字搜尋
SELECT * FROM search_episodes('測試', NULL, '{}', NULL, NULL) LIMIT 5;
```

如果查詢成功執行並返回結果，表示函數已正確更新。

---

### 方法 2：使用 Supabase CLI（進階）

如果你使用 Supabase CLI 管理資料庫：

```bash
# 1. 確保已安裝 Supabase CLI
# macOS: brew install supabase/tap/supabase

# 2. 登入 Supabase
supabase login

# 3. 連結到你的專案
supabase link --project-ref your-project-ref

# 4. 執行 SQL 檔案中的函數
supabase db execute -f supabase/migrations/003_functions_integrated.sql
```

---

### 方法 3：直接讀取檔案內容執行

如果你想要直接從專案檔案讀取：

1. 開啟 `supabase/migrations/003_functions_integrated.sql`
2. 找到 `search_episodes` 函數（第 8-65 行）
3. 複製整個函數定義
4. 在 Supabase SQL Editor 中貼上並執行

---

## 驗證修復是否成功

### 1. 檢查函數是否存在

```sql
SELECT 
  routine_name,
  routine_type,
  data_type
FROM information_schema.routines
WHERE routine_schema = 'public'
  AND routine_name = 'search_episodes';
```

應該會看到 `search_episodes` 函數。

### 2. 測試搜尋功能

```sql
-- 測試 1：搜尋所有已發布的單集
SELECT COUNT(*) as total_episodes
FROM search_episodes('', NULL, '{}', NULL, NULL);

-- 測試 2：帶關鍵字搜尋
SELECT title, slug, published_at
FROM search_episodes('AI', NULL, '{}', NULL, NULL)
LIMIT 10;

-- 測試 3：帶日期範圍搜尋
SELECT title, published_at
FROM search_episodes('', NULL, '{}', '2026-01-01', '2026-12-31')
LIMIT 10;
```

### 3. 檢查前端搜尋功能

1. 啟動開發伺服器：`npm run dev`
2. 前往搜尋頁面：`http://localhost:3000/search`
3. 輸入關鍵字搜尋
4. 確認沒有錯誤訊息，搜尋結果正常顯示

---

## 常見問題

### Q: 執行時出現權限錯誤？

**A**: 確保你使用的是 Supabase Dashboard 的 SQL Editor，而不是透過其他工具。SQL Editor 會自動使用正確的權限。

### Q: 函數執行成功但搜尋還是失敗？

**A**: 檢查以下項目：
1. 確認 `podcast_episodes` 表中有資料
2. 確認有已發布的單集（`is_published = true`）
3. 檢查瀏覽器控制台是否有錯誤訊息
4. 確認前端程式碼使用正確的函數名稱和參數

### Q: 如何確認函數使用的是修復後的版本？

**A**: 執行以下查詢檢查函數定義：

```sql
SELECT pg_get_functiondef(oid)
FROM pg_proc
WHERE proname = 'search_episodes';
```

在結果中應該看到 `SELECT DISTINCT ON (pe.published_at, pe.id)` 而不是 `SELECT DISTINCT`。注意 `DISTINCT ON` 子句中不包含 `DESC`，`DESC` 只在 `ORDER BY` 子句中。

---

## 修復前後的差異

### 修復前（會出錯）
```sql
SELECT DISTINCT e.*
FROM episodes e
...
ORDER BY e.published_at DESC;
```

**問題**：PostgreSQL 不允許在 `SELECT DISTINCT` 中使用 `ORDER BY` 中未出現在 `SELECT` 列表的欄位。

### 修復後（正確）
```sql
SELECT DISTINCT ON (pe.published_at, pe.id)
  pe.id,
  pe.show_id,
  ...
FROM podcast_episodes pe
...
ORDER BY pe.published_at DESC, pe.id;
```

**解決方案**：
1. 使用 `DISTINCT ON` 並在括號中指定要去重的欄位（不使用 `DESC`）
2. 在 `ORDER BY` 子句中使用 `DESC` 來控制排序方向
3. `ORDER BY` 的第一個表達式必須匹配 `DISTINCT ON` 的第一個表達式

---

## 下一步

修復完成後：

1. ✅ 測試搜尋功能是否正常
2. ✅ 執行 E2E 測試確認沒有回歸問題
3. ✅ 監控搜尋效能（應該比 fallback 機制更快）

如果遇到任何問題，請檢查：
- Supabase Dashboard 的錯誤日誌
- 瀏覽器開發者工具的 Console 和 Network 標籤
- 應用程式的錯誤日誌
