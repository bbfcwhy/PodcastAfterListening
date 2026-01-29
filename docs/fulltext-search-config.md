# 全文搜尋配置說明

## 問題

Supabase 預設不包含 `chinese` 全文搜尋配置，導致遷移腳本執行失敗。

## 解決方案

已將所有全文搜尋配置從 `'chinese'` 改為 `'simple'`。

### `'simple'` 配置說明

- **優點**：
  - PostgreSQL 內建，無需額外擴展
  - 適用於所有語言（包括中文）
  - 簡單可靠，不會因為缺少擴展而失敗

- **缺點**：
  - 不進行詞幹提取（對中文影響較小）
  - 不進行停用詞過濾
  - 中文分詞效果不如專門的中文配置

### 搜尋行為

使用 `'simple'` 配置時：
- 文字會轉換為小寫並按空白字元分割
- 中文內容會按字元或詞組進行匹配
- 搜尋功能可以正常運作，但可能不如專門的中文分詞器精確

## 如果需要更好的中文搜尋

如果未來需要更好的中文全文搜尋效果，可以考慮：

### 選項 1：使用 pg_trgm（已啟用）

`pg_trgm` 擴展已啟用，可以提供相似度搜尋：

```sql
-- 使用相似度搜尋（不需要全文搜尋配置）
SELECT * FROM podcast_episodes
WHERE similarity(title, '搜尋詞') > 0.3
ORDER BY similarity(title, '搜尋詞') DESC;
```

### 選項 2：安裝中文全文搜尋擴展（進階）

如果需要更好的中文分詞，可以考慮安裝 `zhparser` 等擴展，但這需要：
1. Supabase 支援自訂擴展（可能需要 Supabase Pro 或自託管）
2. 手動安裝和配置

### 選項 3：應用層面處理

在應用層面進行中文分詞和搜尋，然後使用資料庫進行精確匹配。

## 當前配置

所有全文搜尋索引和函數現在使用 `'simple'` 配置：

- `idx_shows_name_search` - 節目名稱搜尋索引
- `idx_podcast_episodes_fts` - 單集全文搜尋索引
- `search_episodes()` 函數 - 全文搜尋函數

## 驗證

執行遷移後，可以測試全文搜尋功能：

```sql
-- 測試搜尋功能
SELECT * FROM search_episodes('關鍵字');

-- 測試索引
EXPLAIN ANALYZE
SELECT * FROM podcast_episodes
WHERE to_tsvector('simple', title || ' ' || coalesce(ai_summary, ''))
      @@ plainto_tsquery('simple', '搜尋詞');
```

## 結論

使用 `'simple'` 配置是當前最穩定的選擇，可以確保遷移腳本在 Supabase 上正常執行。如果未來需要更好的中文搜尋效果，可以考慮上述進階選項。
