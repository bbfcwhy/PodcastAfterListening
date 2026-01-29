# 環境變數檢查清單

## 必要環境變數

### ✅ Supabase 設定（必須）

這些是專案運作必需的環境變數，必須在 `.env.local` 中設定：

- [ ] `NEXT_PUBLIC_SUPABASE_URL`
  - **取得方式**：Supabase Dashboard > Project Settings > API > Project URL
  - **格式**：`https://xxxxx.supabase.co`
  - **範例**：`https://abcdefghijklmnop.supabase.co`

- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY`
  - **取得方式**：Supabase Dashboard > Project Settings > API > Project API keys > **anon public**（也稱為 **Publishable key**）
  - **格式**：很長的 JWT token
  - **範例**：`eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...`
  - **重要**：使用 **anon public** key，**不要**使用 service_role key。詳細說明請參考 [Supabase Keys 設定指南](./SUPABASE_KEYS_GUIDE.md)

### ✅ 應用程式 URL（必須）

- [ ] `NEXT_PUBLIC_APP_URL`
  - **開發環境**：`http://localhost:3000`
  - **生產環境**：`https://yourdomain.com`
  - **用途**：OAuth 回調、SEO meta tags、分享連結

## 可選環境變數

### 測試環境（可選）

- [ ] `BASE_URL`
  - **用途**：Playwright E2E 測試的基礎 URL
  - **預設值**：`http://localhost:3000`
  - **僅在測試時需要**

## OAuth 設定（在 Supabase Dashboard 中配置）

OAuth providers 的設定**不需要**環境變數，但需要在 Supabase Dashboard 中配置：

- [ ] **Google OAuth**
  - 在 Supabase Dashboard > Authentication > Providers > Google 中配置
  - 需要 Google Cloud Console 的 OAuth 2.0 Client ID 和 Secret

- [ ] **GitHub OAuth**
  - 在 Supabase Dashboard > Authentication > Providers > GitHub 中配置
  - 需要 GitHub Developer Settings 的 OAuth App Client ID 和 Secret

- [ ] **Facebook OAuth**
  - 在 Supabase Dashboard > Authentication > Providers > Facebook 中配置
  - 需要 Facebook Developers 的 App ID 和 Secret

詳細步驟請參考：[Supabase Auth 設定說明](./supabase-auth-setup.md)

## 設定步驟

### 1. 建立 `.env.local` 檔案

```bash
cp .env.example .env.local
```

### 2. 填入 Supabase 資訊

編輯 `.env.local`，填入你的 Supabase 專案資訊：

```env
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 3. 驗證設定

執行以下命令確認環境變數已正確載入：

```bash
npm run dev
```

如果設定正確，應用程式應該能正常啟動並連接到 Supabase。

## 快速檢查

執行以下命令檢查環境變數是否已設定：

```bash
# 檢查 Supabase URL
echo $NEXT_PUBLIC_SUPABASE_URL

# 檢查 Supabase Key（只顯示前 20 個字元）
echo ${NEXT_PUBLIC_SUPABASE_ANON_KEY:0:20}...

# 檢查 App URL
echo $NEXT_PUBLIC_APP_URL
```

## 目前狀態

根據程式碼分析，專案中使用的環境變數：

### ✅ 已使用
- `NEXT_PUBLIC_SUPABASE_URL` - 在 `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/proxy.ts` 中使用
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - 在 `src/lib/supabase/client.ts`, `src/lib/supabase/server.ts`, `src/proxy.ts` 中使用
- `NEXT_PUBLIC_APP_URL` - 在 `src/lib/auth/index.ts`, `src/app/(public)/episodes/[showSlug]/[episodeSlug]/page.tsx` 中使用

### ⚠️ 可選
- `BASE_URL` - 在 `playwright.config.ts` 中使用（測試用，有預設值）

### 📝 未來擴充（目前未使用）
- 分析工具（Google Analytics, Plausible 等）
- 錯誤追蹤（Sentry 等）
- 其他第三方服務

## 相關文件

- [環境變數設定指南](./ENVIRONMENT_VARIABLES.md) - 詳細的環境變數說明
- [Supabase Auth 設定說明](./supabase-auth-setup.md) - OAuth 設定步驟
