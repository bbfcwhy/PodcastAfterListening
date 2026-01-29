# Supabase Auth 配置說明

## T036: 配置 Supabase Auth Providers

此任務需要在 Supabase Dashboard 手動配置 OAuth providers。

### 步驟

1. 登入 [Supabase Dashboard](https://app.supabase.com)
2. 選擇你的專案
3. 前往 **Authentication** > **Providers**
4. 啟用以下 providers：

#### Google OAuth

1. 點擊 **Google** provider
2. 啟用 **Enable Google provider**
3. 在 [Google Cloud Console](https://console.cloud.google.com/) 建立 OAuth 2.0 憑證：
   - 建立新專案或選擇現有專案
   - 前往 **APIs & Services** > **Credentials**
   - 點擊 **Create Credentials** > **OAuth client ID**
   - 應用程式類型選擇 **Web application**
   - 授權重新導向 URI 填入：`https://<your-project-ref>.supabase.co/auth/v1/callback`
4. 複製 **Client ID** 和 **Client Secret** 到 Supabase Dashboard

#### GitHub OAuth

1. 點擊 **GitHub** provider
2. 啟用 **Enable GitHub provider**
3. 在 [GitHub Developer Settings](https://github.com/settings/developers) 建立 OAuth App：
   - 點擊 **New OAuth App**
   - Application name: 你的應用名稱
   - Homepage URL: 你的網站 URL
   - Authorization callback URL: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. 複製 **Client ID** 和 **Client Secret** 到 Supabase Dashboard

#### Facebook OAuth

1. 點擊 **Facebook** provider
2. 啟用 **Enable Facebook provider**
3. 在 [Facebook Developers](https://developers.facebook.com/) 建立 App：
   - 建立新 App
   - 新增 **Facebook Login** 產品
   - 設定 **Valid OAuth Redirect URIs**: `https://<your-project-ref>.supabase.co/auth/v1/callback`
4. 複製 **App ID** 和 **App Secret** 到 Supabase Dashboard

### 環境變數

確保 `.env.local` 包含：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_APP_URL=http://localhost:3000
```

### 測試

配置完成後，可以透過以下方式測試：

1. 訪問網站並點擊登入按鈕
2. 選擇 OAuth provider
3. 完成 OAuth 流程
4. 確認成功重導向回網站並顯示用戶資訊
