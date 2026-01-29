# 測試說明

## E2E 測試

使用 Playwright 進行端到端測試。

### 執行測試

```bash
# 執行所有 E2E 測試
npm run test:e2e

# 使用 UI 模式執行測試（推薦用於開發）
npm run test:e2e:ui
```

### 測試檔案

- `tests/e2e/comment-success-rate.spec.ts` - 測試留言發布成功率 (SC-003)
- `tests/e2e/admin-episode-creation.spec.ts` - 測試站長建立節目時間 (SC-004)
- `tests/e2e/ai-disclaimer-visibility.spec.ts` - 測試 AI 警語可見性 (SC-006)

### 整合測試

- `tests/integration/affiliate-tracking.spec.ts` - 測試聯盟行銷追蹤準確率 (SC-007)

### 負載測試

- `tests/load/concurrent-users.ts` - 測試並發用戶支援 (SC-005)

使用 k6 執行負載測試：

```bash
# 安裝 k6
# macOS: brew install k6
# 或下載: https://k6.io/docs/getting-started/installation/

# 執行負載測試
k6 run --vus 500 --duration 30s tests/load/concurrent-users.ts
```

## 測試前置條件

### 環境變數

確保設定以下環境變數：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 測試資料

測試需要以下資料：
- 至少一個節目系列 (show)
- 至少一個已發布的單集 (episode)
- （可選）測試用的管理員帳號

### 認證測試

需要認證的測試（如留言、管理後台）需要：
- 設定測試用的 OAuth 認證
- 或使用測試模式跳過認證檢查

## 注意事項

- 測試會自動啟動開發伺服器
- 某些測試可能需要實際的資料庫資料
- 認證相關測試需要額外設定
