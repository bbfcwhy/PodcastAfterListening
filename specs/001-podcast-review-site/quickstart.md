# Quickstart: Podcast 聽後回顧網站

**Branch**: `001-podcast-review-site`
**Date**: 2026-01-28

## Prerequisites

- Node.js 18+ (建議使用 LTS 版本)
- pnpm (推薦) 或 npm
- Supabase 帳號 (免費方案即可)
- Git

## 1. 專案初始化

```bash
# 確保在專案根目錄
cd /path/to/PodcastAfterListening

# 安裝 pnpm (如尚未安裝)
npm install -g pnpm

# 建立 Next.js 專案
pnpm create next-app@latest . --typescript --tailwind --eslint --app --src-dir --import-alias "@/*"

# 安裝核心依賴
pnpm add @supabase/supabase-js @supabase/ssr

# 安裝 UI 依賴
pnpm add class-variance-authority clsx tailwind-merge lucide-react

# 安裝開發依賴
pnpm add -D @types/node vitest @vitejs/plugin-react @playwright/test
```

## 2. Supabase 設定

### 2.1 建立專案

1. 登入 [Supabase Dashboard](https://supabase.com/dashboard)
2. 點擊 "New Project"
3. 輸入專案名稱 (e.g., `podcast-review`)
4. 選擇區域 (建議選擇離使用者最近的區域)
5. 設定資料庫密碼 (請妥善保存)

### 2.2 取得連線資訊

在專案設定中取得以下資訊：

- Project URL: `https://xxxxx.supabase.co`
- anon/public key: `eyJhbGciOiJIUzI1NiIsInR5cCI6...`
- service_role key: (僅後端使用，請勿公開)

### 2.3 設定 OAuth Providers

1. 進入 Authentication > Providers
2. 啟用需要的 OAuth providers:

**Google:**
- 在 [Google Cloud Console](https://console.cloud.google.com/) 建立 OAuth 2.0 Client ID
- 設定授權重新導向 URI: `https://xxxxx.supabase.co/auth/v1/callback`
- 將 Client ID 和 Client Secret 填入 Supabase

**GitHub:**
- 在 [GitHub Settings > Developer settings > OAuth Apps](https://github.com/settings/developers) 建立新應用
- 設定 Authorization callback URL: `https://xxxxx.supabase.co/auth/v1/callback`
- 將 Client ID 和 Client Secret 填入 Supabase

### 2.4 執行資料庫遷移

將 `data-model.md` 中的 schema 轉換為 SQL 並在 Supabase SQL Editor 執行：

```sql
-- 請參考 data-model.md 建立對應的 tables
-- 或使用 Supabase CLI 進行 migration 管理
```

## 3. 環境變數設定

建立 `.env.local` 檔案：

```bash
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6...

# 站長設定 (用於識別站長帳號)
ADMIN_EMAIL=your-admin@example.com

# 網站設定
NEXT_PUBLIC_SITE_URL=http://localhost:3000
NEXT_PUBLIC_SITE_NAME=Podcast 聽後筆記
```

## 4. shadcn/ui 設定

```bash
# 初始化 shadcn/ui
pnpm dlx shadcn@latest init

# 安裝常用元件
pnpm dlx shadcn@latest add button card input textarea
pnpm dlx shadcn@latest add dialog dropdown-menu avatar
pnpm dlx shadcn@latest add badge skeleton toast
```

## 5. 專案結構建立

```bash
# 建立目錄結構
mkdir -p src/app/\(public\)/{shows,episodes,search}
mkdir -p src/app/\(admin\)/{dashboard,episodes,comments}
mkdir -p src/app/api/{auth,comments,search,affiliate}
mkdir -p src/components/{ui,episodes,comments,layout}
mkdir -p src/lib/{supabase,auth,spam-filter}
mkdir -p src/types
mkdir -p tests/{e2e,integration,unit}
```

## 6. 驗證安裝

```bash
# 啟動開發伺服器
pnpm dev

# 開啟瀏覽器訪問 http://localhost:3000
```

## 7. 測試設定

### Vitest (單元測試)

建立 `vitest.config.ts`:

```typescript
import { defineConfig } from 'vitest/config'
import react from '@vitejs/plugin-react'
import path from 'path'

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    include: ['tests/unit/**/*.test.ts', 'tests/unit/**/*.test.tsx'],
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
})
```

### Playwright (E2E 測試)

```bash
# 安裝瀏覽器
pnpm exec playwright install
```

建立 `playwright.config.ts`:

```typescript
import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'pnpm dev',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
  },
})
```

## 8. 常用指令

```bash
# 開發
pnpm dev              # 啟動開發伺服器

# 測試
pnpm test             # 執行單元測試
pnpm test:e2e         # 執行 E2E 測試

# 建置
pnpm build            # 建置正式版本
pnpm start            # 啟動正式版本

# 程式碼品質
pnpm lint             # ESLint 檢查
pnpm format           # Prettier 格式化
```

## 9. 部署至 Vercel

```bash
# 安裝 Vercel CLI
pnpm add -g vercel

# 登入並部署
vercel login
vercel

# 設定環境變數
vercel env add NEXT_PUBLIC_SUPABASE_URL
vercel env add NEXT_PUBLIC_SUPABASE_ANON_KEY
# ... 其他環境變數
```

## 10. n8n 工作流整合

確保 n8n 工作流寫入 Supabase 的欄位對應：

| n8n 輸出欄位 | Supabase 欄位 |
|-------------|---------------|
| episode_title | episodes.title |
| episode_url | episodes.original_url |
| ai_summary | episodes.ai_summary |
| ai_sponsorship | episodes.ai_sponsorship |
| published_date | episodes.published_at |

n8n 需使用 Supabase service_role key 才能繞過 RLS 寫入資料。

## Next Steps

1. 執行 `/speckit.tasks` 產生任務清單
2. 依序實作 P1 優先級的 User Stories
3. 完成後執行測試確認功能正常

## Troubleshooting

### OAuth 登入失敗

- 確認 Supabase 中的 Redirect URL 設定正確
- 開發環境使用 `http://localhost:3000`
- 正式環境需更新為實際網域

### 中文全文搜尋不work

PostgreSQL 預設不支援中文分詞，需在 Supabase 啟用額外擴充或使用 `LIKE` 搜尋作為 fallback。

### RLS 權限錯誤

確認已正確設定 Row Level Security policies，並在開發時可暫時停用 RLS 進行測試。
