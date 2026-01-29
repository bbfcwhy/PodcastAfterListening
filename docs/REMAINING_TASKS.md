# 未完成的實作與建議事項

## 專案狀態總覽

根據 `tasks.md` 的檢查，**所有 92 個任務都已標記為完成**。但仍有以下事項需要處理：

---

## 🔴 高優先級事項

### 1. ✅ 在 Supabase 中重新執行修復後的 SQL 函數 - **已完成**

**狀態**：✅ 已完成（2026-01-29）

**結果**：
- SQL 函數已成功執行
- 測試查詢驗證通過
- 搜尋功能現在使用優化的 PostgreSQL 全文搜尋函數

**詳細記錄**：請參考 `docs/SQL_FUNCTION_FIXED.md`

---

### 2. 準備測試資料

**問題**：3 個 E2E 測試被跳過，因為缺少測試資料

**需要執行**：
```sql
-- 在 Supabase SQL Editor 中執行
-- scripts/seed-test-data.sql
```

**影響的測試**：
- `ai-disclaimer-visibility.spec.ts` - 需要至少 1 個已發布的單集
- `comment-success-rate.spec.ts` - 需要至少 1 個已發布的單集
- `admin-episode-creation.spec.ts` - 需要至少 1 個節目系列

---

## 🟡 中優先級事項

### 3. 設定測試認證（可選）

**問題**：管理後台測試需要管理員認證

**解決方法**：
1. 在 Supabase Dashboard 中建立測試用的管理員帳號
2. 更新 `profiles` 表設定 `is_admin = true`
3. 在測試中使用 Playwright 的認證狀態儲存功能

**影響的測試**：
- `admin-episode-creation.spec.ts`

---

### 4. 執行負載測試驗證 SC-005

**問題**：負載測試腳本已建立，但尚未執行驗證

**檔案**：`tests/load/concurrent-users.ts`

**需要執行**：
```bash
# 安裝 k6（如果尚未安裝）
# macOS: brew install k6
# 或使用 Docker: docker run -i loadimpact/k6 run - < tests/load/concurrent-users.ts

# 執行負載測試
k6 run --vus 500 --duration 30s tests/load/concurrent-users.ts
```

**驗證標準**：
- 95% 的請求應在 2 秒內完成
- 錯誤率應低於 1%

---

### 5. 完善 Analytics 追蹤（T085）

**狀態**：已建立基礎架構，但僅為 placeholder

**檔案**：`src/lib/analytics.ts`

**目前狀態**：
- 函數已定義但僅輸出 console.log
- 尚未整合實際的 analytics 服務（如 Google Analytics、Plausible）

**建議**：
- 整合 Google Analytics 或 Plausible
- 在關鍵頁面和事件中呼叫追蹤函數
- 設定事件追蹤（頁面瀏覽、留言提交、搜尋等）

---

## 🟢 低優先級事項（優化建議）

### 6. 建立 .env.example 檔案

**狀態**：T005 提到需要建立，但檔案可能不存在

**建議**：
```bash
# 建立 .env.example 包含所有必要的環境變數
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
BASE_URL=http://localhost:3000
```

---

### 7. 文件完善

**已完成的文件**：
- ✅ 測試指南和狀態文件
- ✅ 環境變數設定指南
- ✅ Schema 整合文件
- ✅ 測試跳過原因分析

**可補充的文件**：
- 部署指南（Vercel）
- 開發工作流程文件
- API 文件（如果對外開放）
- 故障排除指南

---

### 8. 效能優化驗證

**狀態**：T087 提到需要效能稽核，但可能尚未執行

**需要驗證**：
- SC-001: 首頁載入 < 3 秒
- SC-002: 單集頁面載入 < 2 秒

**建議**：
- 使用 Lighthouse 進行效能測試
- 檢查 ISR 快取設定是否正確
- 驗證圖片優化是否生效

---

### 9. 錯誤處理完善

**狀態**：T081 提到優雅降級，但可能需要進一步測試

**需要驗證**：
- Supabase 無法連線時是否正確顯示快取內容
- 錯誤訊息是否友善
- 離線狀態處理是否正確

---

### 10. 行動裝置響應式設計驗證

**狀態**：T083 提到需要行動裝置響應式樣式

**建議**：
- 使用 Playwright 的行動裝置模式測試
- 檢查所有頁面在手機、平板上的顯示
- 驗證觸控操作是否順暢

---

## 📋 檢查清單

### 立即執行（必須）

- [x] 在 Supabase 中重新執行修復後的 `search_episodes` 函數 ✅ **已完成**
- [ ] 執行 `scripts/seed-test-data.sql` 建立測試資料
- [ ] 重新執行 E2E 測試驗證修復效果

### 短期內完成（建議）

- [ ] 執行負載測試驗證 SC-005
- [ ] 設定測試認證（如果需要測試管理後台）
- [ ] 建立 `.env.example` 檔案
- [ ] 執行效能稽核（Lighthouse）

### 長期優化（可選）

- [ ] 整合實際的 Analytics 服務
- [ ] 完善文件（部署指南、API 文件等）
- [ ] 測試錯誤處理和優雅降級
- [ ] 驗證行動裝置響應式設計

---

## 🎯 成功標準驗證狀態

| 成功標準 | 狀態 | 測試檔案 | 備註 |
|---------|------|----------|------|
| SC-001 | ⚠️ 待驗證 | - | 需要效能測試 |
| SC-002 | ⚠️ 待驗證 | - | 需要效能測試 |
| SC-003 | ⏭️ 已跳過 | `comment-success-rate.spec.ts` | 需要測試資料 |
| SC-004 | ⏭️ 已跳過 | `admin-episode-creation.spec.ts` | 需要認證和資料 |
| SC-005 | ⚠️ 待驗證 | `concurrent-users.ts` | 需要執行 k6 測試 |
| SC-006 | ✅ 部分通過 | `ai-disclaimer-visibility.spec.ts` | 首頁通過，單集頁面需要資料 |
| SC-007 | ✅ 已建立 | `affiliate-tracking.spec.ts` | 需要執行驗證 |

---

## 📝 總結

**核心功能**：✅ 已完成
- 所有 92 個任務都已標記為完成
- 所有主要功能都已實作
- 所有頁面和組件都已建立

**測試與驗證**：⚠️ 部分完成
- 4 個 E2E 測試通過
- 3 個測試因缺少資料/認證而跳過
- 負載測試腳本已建立但未執行
- 效能測試尚未執行

**優化與完善**：🟡 進行中
- Analytics 追蹤為 placeholder
- 部分文件可能需要補充
- 錯誤處理可能需要進一步測試

---

## 🚀 建議的下一步

1. **立即執行**：建立測試資料並重新執行 SQL 函數
2. **短期內**：執行負載測試和效能稽核
3. **長期**：整合 Analytics 並完善文件

所有核心功能都已實作完成，目前主要是測試驗證和優化工作。
