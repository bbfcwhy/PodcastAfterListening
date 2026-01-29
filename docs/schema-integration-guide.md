# Schema 整合指南

## 問題分析

你提供的 `podcast_episodes` 表**不足以**支援 PodcastAfterListening 專案的所有功能。

## 缺少的內容

### 1. 缺少的表（10 個）

- `shows` - 節目系列表
- `hosts` - 主持人表
- `show_hosts` - 節目-主持人關聯表
- `tags` - 標籤表
- `episode_tags` - 單集-標籤關聯表
- `comments` - 留言表
- `profiles` - 用戶檔案表
- `affiliate_contents` - 聯盟行銷內容表
- `episode_affiliates` - 單集-聯盟行銷關聯表
- `affiliate_clicks` - 點擊記錄表

### 2. `podcast_episodes` 表缺少的欄位

| 欄位 | 類型 | 說明 | 是否必需 |
|------|------|------|---------|
| `show_id` | UUID (FK) | 關聯到節目系列 | ✅ **必需** |
| `slug` | TEXT | URL 友善名稱 | ✅ **必需** |
| `original_url` | TEXT | 原始 Podcast 連結 | ✅ **必需** |
| `is_published` | BOOLEAN | 發布狀態 | ✅ **必需** |
| `duration_seconds` | INTEGER | 節目時長 | ⚠️ 建議 |
| `ai_summary` | TEXT | AI 大綱（對應現有的 `summary`） | ✅ **必需** |
| `ai_sponsorship` | TEXT | 業配內容（對應現有的 `sponsorship_info`） | ✅ **必需** |
| `host_notes` | TEXT | 站長心得（對應現有的 `reflection`） | ✅ **必需** |

### 3. 欄位對應關係

現有欄位可以對應，但需要調整：

| 現有欄位 | 新欄位名稱 | 轉換需求 |
|---------|----------|---------|
| `summary` | `ai_summary` | 可直接對應 |
| `reflection` | `host_notes` | 可直接對應 |
| `sponsorship_info` (JSONB) | `ai_sponsorship` (TEXT) | 需要將 JSONB 轉為 TEXT |
| `published_at` (TIMESTAMPTZ) | `published_at` (DATE) | 類型轉換 |

## 整合方案

### 推薦方案：擴展現有表 + 建立新表

1. **保留 `podcast_episodes` 表**：維持現有資料和處理流程
2. **添加缺少的欄位**：在現有表上添加新欄位
3. **建立其他必要的表**：shows, hosts, comments 等
4. **建立視圖或別名**：讓代碼可以統一使用 `episodes` 名稱

### 執行步驟

1. **執行整合遷移腳本**：
   ```sql
   -- 在 Supabase SQL Editor 中執行
   -- supabase/migrations/000_integrate_existing_schema.sql
   ```

2. **資料遷移**（如果需要）：
   - 將現有的 `summary` → `ai_summary`
   - 將現有的 `reflection` → `host_notes`
   - 將 `sponsorship_info` (JSONB) → `ai_sponsorship` (TEXT)

3. **建立節目系列資料**：
   - 需要手動或透過腳本建立 `shows` 資料
   - 將 `podcast_episodes` 的資料關聯到對應的 `show_id`

4. **更新代碼**：
   - 如果使用視圖，代碼可以繼續使用 `episodes` 表名
   - 或者更新服務層代碼，直接使用 `podcast_episodes` 表

## 注意事項

1. **外鍵約束**：添加 `show_id` 後，需要先建立 `shows` 資料才能設定外鍵
2. **資料完整性**：現有的 `podcast_episodes` 資料需要補充 `show_id`、`slug`、`original_url` 等欄位
3. **向後相容**：保留現有欄位（如 `episode_id`、`audio_file_url` 等）以維持相容性
4. **RLS 策略**：需要更新 RLS 策略以支援新的表結構

## 快速檢查清單

- [ ] 執行 `000_integrate_existing_schema.sql` 遷移腳本
- [ ] 建立至少一個 `shows` 記錄
- [ ] 更新現有 `podcast_episodes` 記錄，補充 `show_id`、`slug`、`original_url`
- [ ] 執行 `001_initial_schema.sql` 和 `002_rls_policies.sql`（如果尚未執行）
- [ ] 執行 `003_functions.sql` 建立搜尋函數
- [ ] 測試資料讀取和寫入

## 結論

**現有的 `podcast_episodes` 表不夠用**，需要：
1. 添加 8 個缺少的欄位
2. 建立 10 個新的表
3. 建立關聯和外鍵約束
4. 更新 RLS 策略

建議使用提供的整合遷移腳本，可以保留現有資料並擴展功能。
