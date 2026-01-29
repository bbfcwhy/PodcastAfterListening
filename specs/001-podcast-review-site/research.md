# Research: Podcast 聽後回顧網站

**Date**: 2026-01-28
**Branch**: `001-podcast-review-site`

## Research Topics

### 1. 前端框架選擇

**Decision**: Next.js 14+ (App Router)

**Rationale**:
- Supabase 官方提供完整的 Next.js 整合套件 (@supabase/ssr)
- App Router 支援 Server Components，可優化首頁載入效能
- Vercel 部署簡單，適合單人維護
- 社群資源豐富，AI 輔助開發工具支援度高
- 內建 API Routes 處理後端邏輯，無需額外後端服務

**Alternatives considered**:
- Nuxt 3: Vue 生態系良好，但 Supabase 整合文件較少
- Remix: 效能優異，但學習曲線較陡
- Astro: 靜態網站優先，但互動功能（留言、搜尋）需額外處理

### 2. Supabase 全文搜尋實作

**Decision**: 使用 PostgreSQL Full-Text Search (tsvector/tsquery) + Supabase Edge Functions

**Rationale**:
- Supabase 底層是 PostgreSQL，原生支援中文全文搜尋（需安裝 zhparser 或使用 pg_jieba）
- 對於 100 集節目規模，PostgreSQL FTS 效能足夠
- 無需額外付費服務（如 Algolia、MeiliSearch）
- 可結合 RLS (Row Level Security) 確保資料安全

**Implementation approach**:
1. 建立 tsvector 欄位儲存索引
2. 建立 GIN 索引加速搜尋
3. 使用 Supabase RPC 呼叫自訂搜尋函數
4. 篩選條件透過 SQL WHERE 子句實作

**Alternatives considered**:
- Algolia: 功能強大但有費用考量
- MeiliSearch: 需自行部署維護
- 純前端搜尋: 資料量增加後效能下降

### 3. OAuth 整合模式

**Decision**: Supabase Auth + OAuth Providers

**Rationale**:
- Supabase Auth 內建 Google/Facebook/GitHub OAuth 支援
- 與 Supabase 資料庫無縫整合（自動建立 auth.users）
- 支援 RLS 基於 auth.uid() 的存取控制
- 前端使用 @supabase/ssr 處理 session 管理

**Implementation approach**:
1. 在 Supabase Dashboard 啟用 OAuth providers
2. 設定 OAuth 應用程式（Google Cloud Console、GitHub Settings 等）
3. 前端使用 signInWithOAuth() 方法
4. Server Components 使用 createServerClient() 取得 session

**Alternatives considered**:
- NextAuth.js: 功能完整但增加額外依賴
- 自建 OAuth: 複雜度高，維護成本大

### 4. 留言垃圾過濾方案

**Decision**: 規則式過濾 + Supabase Edge Function + 人工審核佇列

**Rationale**:
- 初期流量低，規則式過濾足以應付大部分垃圾留言
- 無需付費 AI 審核服務
- Edge Function 可在伺服器端執行，避免前端繞過

**Implementation approach**:
1. **即時規則過濾**:
   - 連結數量限制（> 2 個連結 → 待審）
   - 禁用詞庫比對（可維護黑名單）
   - 重複內容偵測（短時間內相同內容）
   - 過短/過長內容標記
2. **Rate Limiting**: 每用戶每分鐘最多 3 則留言
3. **待審佇列**: 被標記的留言存入待審狀態，站長可批次處理

**Alternatives considered**:
- Akismet: 成熟方案但需付費
- Perspective API: Google 服務，免費額度有限
- 純人工審核: 對單人維護負擔過重

### 5. 快取與降級策略

**Decision**: Next.js ISR (Incremental Static Regeneration) + SWR

**Rationale**:
- ISR 可預生成靜態頁面，Supabase 斷線時仍可提供內容
- SWR 提供客戶端快取，支援 stale-while-revalidate 模式
- 搭配 Next.js revalidate 設定，平衡即時性與效能

**Implementation approach**:
1. **節目列表/詳情頁**: 使用 ISR，revalidate = 3600 (1小時)
2. **搜尋結果**: 客戶端 SWR，快取 5 分鐘
3. **留言**: 即時載入，無快取
4. **降級模式偵測**:
   - 前端偵測 Supabase 連線失敗
   - 顯示快取內容 + 警示 banner
   - 停用留言等即時功能

**Alternatives considered**:
- Redis 快取: 需額外服務維護
- 純 SSG: 無法支援搜尋等動態功能
- 純 SSR: 無離線降級能力

### 6. UI 元件庫選擇

**Decision**: shadcn/ui + Tailwind CSS

**Rationale**:
- shadcn/ui 非 npm 依賴，而是直接複製元件程式碼，完全可控
- Tailwind CSS 與 Next.js 整合度高
- Radix UI 為基礎，accessibility 支援良好
- AI 輔助開發工具對 Tailwind 語法理解度高

**Alternatives considered**:
- Material UI: Bundle size 較大
- Chakra UI: 需額外學習 CSS-in-JS
- 純 CSS Modules: 開發效率較低

### 7. 聯盟行銷追蹤實作

**Decision**: 自訂追蹤 + Supabase 紀錄

**Rationale**:
- 初期無需複雜分析，簡單點擊計數即可
- 資料存於 Supabase，可與其他資料整合分析
- 未來可擴展至更詳細的追蹤

**Implementation approach**:
1. 聯盟連結透過 /api/affiliate/redirect 路由
2. 記錄點擊時間、來源頁面、用戶（如有登入）
3. 重導向至目標 URL
4. 後台顯示點擊統計報表

**Alternatives considered**:
- Google Analytics events: 需額外整合
- 第三方聯盟平台追蹤: 依賴外部服務

## Technology Stack Summary

| 層級 | 技術選擇 |
|------|----------|
| 前端框架 | Next.js 14+ (App Router) |
| UI 元件 | shadcn/ui + Tailwind CSS |
| 後端/API | Next.js API Routes |
| 資料庫 | Supabase (PostgreSQL) |
| 驗證 | Supabase Auth (OAuth) |
| 全文搜尋 | PostgreSQL FTS |
| 部署 | Vercel |
| 測試 | Vitest + Playwright |

## Updated Technical Context

基於以上研究，更新 Technical Context：

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 14+, @supabase/ssr, shadcn/ui, Tailwind CSS
**Storage**: Supabase (PostgreSQL + Auth + Storage)
**Testing**: Vitest (單元測試) + Playwright (E2E 測試)
**Target Platform**: Web (Chrome/Firefox/Safari/Edge latest 2 versions)
**Project Type**: Web 應用程式 (全端 Next.js)
**Performance Goals**: 首頁載入 < 3 秒 (ISR)，節目詳情頁載入 < 2 秒
**Constraints**: 單人維護、Vercel 部署、中文為主
**Scale/Scope**: 100 集節目、500 併發用戶、每日 1000 訪客
