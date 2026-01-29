# Supabase API Keys 設定指南

## 問題：要使用哪個 Key？

**答案：使用 `anon public` key（也稱為 `anon key` 或 `Publishable key`）**

## Supabase Dashboard 中的 Key 類型

在 Supabase Dashboard > Project Settings > API 中，你會看到以下 keys：

### 1. ✅ anon public (Publishable key) - **使用這個**

- **名稱**：`anon public` 或 `anon key` 或 `Publishable key`
- **用途**：前端應用程式使用（可以在瀏覽器端使用）
- **安全性**：公開的，但受到 Row Level Security (RLS) 保護
- **設定位置**：`NEXT_PUBLIC_SUPABASE_ANON_KEY`

**特徵**：
- 通常很長（數百個字元）
- 以 `eyJ` 開頭（JWT token）
- 標示為 "public" 或 "anon"

### 2. ❌ service_role (Secret key) - **不要使用**

- **名稱**：`service_role` 或 `service_role key` 或 `Secret key`
- **用途**：僅後端使用（伺服器端）
- **安全性**：**極度私密**，會繞過所有 RLS 政策
- **警告**：**絕對不要**在前端程式碼或環境變數中使用（除非是純後端 API）

**特徵**：
- 也很長
- 以 `eyJ` 開頭
- 標示為 "secret" 或 "service_role"

## 如何確認你使用的是正確的 Key？

### 方法 1：檢查 Dashboard 標籤

在 Supabase Dashboard > Project Settings > API > Project API keys 中：

- ✅ 使用標示為 **"anon public"** 或 **"Publishable"** 的 key
- ❌ 不要使用標示為 **"service_role"** 或 **"Secret"** 的 key

### 方法 2：檢查 Key 的權限

- **anon public key**：受到 RLS 政策限制，只能存取允許的資料
- **service_role key**：擁有完整資料庫權限，會繞過所有安全政策

### 方法 3：測試 Key

如果使用正確的 key，應用程式應該能：
- ✅ 正常連接到 Supabase
- ✅ 讀取公開資料
- ✅ 執行受 RLS 保護的查詢
- ❌ 不會有權限錯誤（除非 RLS 政策限制）

## 設定步驟

### 1. 取得 anon public key

1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 選擇你的專案
3. 前往 **Project Settings** > **API**
4. 在 **Project API keys** 區塊中，找到 **"anon public"** key
5. 點擊眼睛圖示或 "Reveal" 按鈕顯示 key
6. 複製完整的 key（很長的字串）

### 2. 設定環境變數

在 `.env.local` 中設定：

```env
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InlvdXJwcm9qZWN0cmVmIiwicm9sZSI6ImFub24iLCJpYXQiOjE2NDUxOTI4MDAsImV4cCI6MTk2MDc2ODgwMH0.your_actual_key_here
```

### 3. 驗證設定

執行以下命令確認設定正確：

```bash
npm run dev
```

如果設定正確，應用程式應該能正常啟動並連接到 Supabase。

## 常見問題

### Q: "Publishable key" 和 "anon public key" 是一樣的嗎？

**A:** 是的！不同版本的 Supabase Dashboard 可能使用不同的術語：
- 舊版本：`anon public` 或 `anon key`
- 新版本：`Publishable key`

它們都是同一個 key，可以安全地在前端使用。

### Q: 為什麼可以使用公開的 key？

**A:** 因為 Supabase 使用 Row Level Security (RLS) 來保護資料：
- anon key 是公開的，但只能存取 RLS 政策允許的資料
- 所有資料庫操作都會經過 RLS 檢查
- 即使 key 被洩露，攻擊者也只能存取允許的資料

### Q: 什麼時候需要使用 service_role key？

**A:** 僅在以下情況：
- 純後端 API（不在瀏覽器端執行）
- 需要繞過 RLS 的管理操作
- 資料庫遷移或維護腳本

**重要**：service_role key 絕對不要放在前端程式碼或 `NEXT_PUBLIC_*` 環境變數中。

## 安全最佳實踐

1. ✅ 使用 `anon public` key 在前端
2. ✅ 依賴 RLS 政策保護資料
3. ✅ 定期檢查和更新 RLS 政策
4. ❌ 不要在前端使用 `service_role` key
5. ❌ 不要將任何 key 提交到版本控制

## 相關資源

- [Supabase API Keys 文檔](https://supabase.com/docs/guides/api/api-keys)
- [Row Level Security 說明](https://supabase.com/docs/guides/auth/row-level-security)
- [環境變數設定指南](./ENVIRONMENT_VARIABLES.md)
