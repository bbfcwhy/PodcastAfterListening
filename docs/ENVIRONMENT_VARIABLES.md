# 環境變數設定指南

## 必要環境變數

### Supabase 設定

這些是專案運作必需的環境變數：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
```

**如何取得**：
1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 選擇你的專案
3. 前往 **Project Settings** > **API**
4. 複製以下資訊：
   - **Project URL** → `NEXT_PUBLIC_SUPABASE_URL`
   - **anon public** key（也稱為 **Publishable key**）→ `NEXT_PUBLIC_SUPABASE_ANON_KEY`
   
**重要**：使用 **anon public** key（Publishable key），**不要**使用 service_role key（Secret key）。詳細說明請參考 [Supabase Keys 設定指南](./SUPABASE_KEYS_GUIDE.md)。

### 應用程式 URL

```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

**用途**：
- OAuth 回調 URL
- SEO meta tags（Open Graph, Twitter Cards）
- 分享連結生成

**設定值**：
- 開發環境：`http://localhost:3000`
- 生產環境：`https://yourdomain.com`

## 可選環境變數

### 測試環境

```env
BASE_URL=http://localhost:3000
```

**用途**：Playwright E2E 測試的基礎 URL

**注意**：如果未設定，Playwright 會使用預設值 `http://localhost:3000`

## OAuth 設定

OAuth providers（Google, GitHub, Facebook）的設定**不需要**環境變數。

這些設定需要在 **Supabase Dashboard** 中配置：

1. 前往 **Authentication** > **Providers**
2. 啟用需要的 provider
3. 填入對應的 Client ID 和 Client Secret

詳細步驟請參考：[Supabase Auth 設定說明](./supabase-auth-setup.md)

## 設定步驟

### 1. 複製範例檔案

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

## 環境變數檢查清單

- [ ] `NEXT_PUBLIC_SUPABASE_URL` - Supabase 專案 URL
- [ ] `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase 匿名金鑰
- [ ] `NEXT_PUBLIC_APP_URL` - 應用程式 URL（開發/生產）
- [ ] OAuth providers 已在 Supabase Dashboard 中配置（如需要）

## 安全性注意事項

1. **不要提交 `.env.local` 到版本控制**
   - `.env.local` 已在 `.gitignore` 中
   - 使用 `.env.example` 作為範本

2. **使用正確的金鑰**
   - `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是公開的，可以在瀏覽器端使用
   - 不要使用 `service_role` key（這是私密金鑰，只能在伺服器端使用）

3. **生產環境設定**
   - 在部署平台（Vercel, Netlify 等）設定環境變數
   - 確保 `NEXT_PUBLIC_APP_URL` 指向正確的生產環境 URL

## 疑難排解

### 問題：無法連接到 Supabase

**檢查**：
1. `NEXT_PUBLIC_SUPABASE_URL` 是否正確（包含 `https://`）
2. `NEXT_PUBLIC_SUPABASE_ANON_KEY` 是否完整（很長的字串）
3. Supabase 專案是否正常運作

### 問題：OAuth 登入失敗

**檢查**：
1. OAuth provider 是否已在 Supabase Dashboard 中啟用
2. `NEXT_PUBLIC_APP_URL` 是否正確
3. OAuth 回調 URL 是否正確設定在 provider 設定中

### 問題：環境變數未生效

**解決方案**：
1. 確認檔案名稱是 `.env.local`（不是 `.env`）
2. 重新啟動開發伺服器（`npm run dev`）
3. 確認變數名稱正確（注意大小寫和底線）

## 相關資源

- [Next.js 環境變數文檔](https://nextjs.org/docs/app/building-your-application/configuring/environment-variables)
- [Supabase 環境變數設定](https://supabase.com/docs/guides/getting-started/local-development#environment-variables)
- [Supabase Auth 設定說明](./supabase-auth-setup.md)
