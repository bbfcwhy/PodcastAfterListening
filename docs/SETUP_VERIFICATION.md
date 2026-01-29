# 設定驗證指南

## 環境變數設定確認

### ✅ Supabase 環境變數

確認以下環境變數已正確設定在 `.env.local` 中：

- [x] `NEXT_PUBLIC_SUPABASE_URL` - Supabase 專案 URL
- [x] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase Publishable key
- [ ] `NEXT_PUBLIC_APP_URL` - 應用程式 URL（開發環境：`http://localhost:3000`）

## 驗證步驟

### 1. 檢查環境變數檔案

確認 `.env.local` 檔案存在且包含必要的環境變數：

```bash
cat .env.local
```

應該看到：
```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_key_here
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 2. 啟動開發伺服器

```bash
npm run dev
```

如果設定正確，應該看到：
- ✅ 伺服器成功啟動
- ✅ 沒有 Supabase 連線錯誤
- ✅ 可以訪問 `http://localhost:3000`

### 3. 測試 Supabase 連線

在瀏覽器中打開開發者工具（F12），檢查 Console 是否有 Supabase 相關錯誤。

### 4. 測試資料庫查詢

訪問首頁或任何使用 Supabase 的頁面，確認：
- ✅ 頁面正常載入
- ✅ 沒有資料庫連線錯誤
- ✅ 資料可以正常顯示（如果有資料）

## 常見問題

### 問題：環境變數未生效

**解決方案**：
1. 確認檔案名稱是 `.env.local`（不是 `.env`）
2. 重新啟動開發伺服器（`npm run dev`）
3. 確認變數名稱正確（注意大小寫）

### 問題：Supabase 連線失敗

**檢查**：
1. `NEXT_PUBLIC_SUPABASE_URL` 是否正確（包含 `https://`）
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否完整
3. Supabase 專案是否正常運作
4. 網路連線是否正常

### 問題：Key 格式看起來不對

**說明**：
- 舊版 Supabase：key 以 `eyJ` 開頭（JWT token）
- 新版 Supabase：key 可能以 `sb_publishable_` 開頭
- 兩種格式都是有效的，只要從 Supabase Dashboard 複製即可

## 下一步

環境變數設定完成後，可以：

1. **執行資料庫遷移**（如果還沒執行）：
   - 執行 `supabase/migrations/001_initial_schema_integrated.sql`
   - 執行 `supabase/migrations/002_rls_policies_integrated.sql`
   - 執行 `supabase/migrations/003_functions_integrated.sql`

2. **測試應用程式**：
   - 啟動開發伺服器：`npm run dev`
   - 訪問首頁確認正常運作
   - 測試登入功能（如果已設定 OAuth）

3. **執行 E2E 測試**：
   - `npm run test:e2e`

## 相關文件

- [環境變數設定指南](./ENVIRONMENT_VARIABLES.md)
- [Supabase Keys 設定指南](./SUPABASE_KEYS_GUIDE.md)
- [環境變數檢查清單](./ENV_CHECKLIST.md)
