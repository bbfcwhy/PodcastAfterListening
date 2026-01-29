# Implementation Plan: Podcast 聽後回顧網站

**Branch**: `001-podcast-review-site` | **Date**: 2026-01-28 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-podcast-review-site/spec.md`

## Summary

建立一個 Podcast 聽後回顧網站，讓站長可以分享對 Podcast 節目的個人心得，並展示 AI 自動解析的節目大綱和業配內容。網站採用混合式內容架構（最新單集 + 節目分類），支援訪客透過 OAuth 登入留言討論，並預留聯盟行銷功能。資料由外部 n8n 工作流寫入 Supabase，本系統負責讀取展示和內容管理。

## Technical Context

**Language/Version**: TypeScript 5.x (前後端統一)
**Primary Dependencies**: Next.js 14+ (App Router), @supabase/ssr, shadcn/ui, Tailwind CSS
**Storage**: Supabase (PostgreSQL + Auth + Storage)
**Testing**: Vitest (單元測試) + Playwright (E2E 測試)
**Target Platform**: Web (Chrome/Firefox/Safari/Edge 最新兩個版本)
**Project Type**: Web 應用程式 (全端 Next.js)
**Performance Goals**: 首頁載入 < 3 秒 (ISR)，節目詳情頁載入 < 2 秒，支援 500 併發用戶
**Constraints**: 單人維護、Vercel 部署、中文為主要語言
**Scale/Scope**: 初期 100 集節目，10 個節目系列，預估每日 1000 訪客

> 所有技術選擇已於 [research.md](./research.md) 中確認

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> Constitution 尚未配置具體原則（模板狀態），無特定 Gate 需檢查。
> 建議後續配置 Constitution 以確保開發一致性。

**Status**: PASS (無 Gate 定義)

## Project Structure

### Documentation (this feature)

```text
specs/001-podcast-review-site/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── api.yaml         # OpenAPI specification
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

```text
src/
├── app/                 # 頁面路由
│   ├── (public)/        # 公開頁面
│   │   ├── page.tsx            # 首頁 (最新單集 + 節目分類)
│   │   ├── shows/              # 節目系列頁面
│   │   ├── episodes/           # 單集詳情頁面
│   │   └── search/             # 搜尋頁面
│   ├── (admin)/         # 後台管理 (需驗證)
│   │   ├── dashboard/          # 管理儀表板
│   │   ├── episodes/           # 節目管理
│   │   └── comments/           # 留言審核
│   └── api/             # API Routes
│       ├── auth/               # OAuth 處理
│       ├── comments/           # 留言 CRUD
│       ├── search/             # 搜尋 API
│       └── affiliate/          # 聯盟行銷追蹤
├── components/          # UI 元件
│   ├── ui/                     # 基礎 UI 元件
│   ├── episodes/               # 節目相關元件
│   ├── comments/               # 留言相關元件
│   └── layout/                 # 版面元件
├── lib/                 # 工具函式
│   ├── supabase/               # Supabase 客戶端
│   ├── auth/                   # 驗證邏輯
│   └── spam-filter/            # 留言過濾
├── types/               # TypeScript 型別定義
└── styles/              # 全域樣式

tests/
├── e2e/                 # Playwright E2E 測試
├── integration/         # 整合測試
└── unit/                # 單元測試

public/
└── assets/              # 靜態資源
```

**Structure Decision**: 採用 Web 應用程式結構，使用 App Router 模式組織前端路由，API Routes 處理後端邏輯。考量單人維護和 Supabase 整合，選擇全端框架以簡化部署。

## Complexity Tracking

> 無 Constitution 違規需要說明。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A | - | - |
