# Implementation Plan: 後台 UI 風格統一與節目管理

**Branch**: `004-admin-ui-shows` | **Date**: 2026-01-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/004-admin-ui-shows/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

此功能有兩個主要目標：
1. **後台 UI 配色統一**：將後台頁面（側邊欄、表格、表單、按鈕）的樣式對齊前台設計 tokens（canvas、surface、text-primary、cta 等），消除硬編色碼。
2. **節目管理功能**：新增節目（Shows）的 CRUD 功能，包含列表頁 `/shows`、編輯頁 `/shows/{id}/edit`、新增頁 `/shows/new`，並在側邊欄加入「節目管理」連結。

技術上延續既有的 Next.js App Router 架構、Supabase 資料庫、shadcn/ui 元件，以及 003 feature 建立的表單模式（衝突偵測、未儲存提示）。

## Technical Context

**Language/Version**: TypeScript 5.x, Node 18+
**Primary Dependencies**: Next.js 14+, React 19, Supabase (SSR + JS client), Tailwind CSS 4, shadcn/ui, Lucide icons
**Storage**: Supabase (PostgreSQL)；既有表：shows（id, name, slug, description, cover_image_url, original_url, created_at, updated_at）
**Testing**: Playwright E2E（既有）；本 feature 以手動驗收為主
**Target Platform**: Web（瀏覽器）；後台需站長登入（Supabase Auth + profiles.is_admin）
**Project Type**: Web（單一 Next.js App，route groups (admin) / (public)）
**Performance Goals**: 列表分頁每頁約 20 筆；儲存回饋 5 秒內
**Constraints**: 沿用既有 Supabase schema 與 RLS；使用既有設計 tokens；不新增獨立後端服務
**Scale/Scope**: 單一站長、後台樣式調整與節目管理 CRUD

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

專案 `.specify/memory/constitution.md` 為範本（未訂定具體原則）。本 feature 為既有後台之樣式統一與功能擴充，未新增新專案或新架構，視為通過。

## Project Structure

### Documentation (this feature)

```text
specs/004-admin-ui-shows/
├── plan.md              # This file
├── research.md          # Phase 0
├── data-model.md        # Phase 1
├── quickstart.md        # Phase 1
├── contracts/           # Phase 1
└── tasks.md             # Phase 2 (/speckit.tasks)
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (admin)/                    # 後台 route group
│   │   ├── layout.tsx              # 側欄：調整樣式 + 新增「節目管理」連結
│   │   ├── dashboard/page.tsx      # 調整樣式
│   │   ├── episodes/               # 調整樣式
│   │   ├── comments/               # 調整樣式
│   │   ├── affiliates/             # 調整樣式
│   │   └── shows/                  # 【新增】節目管理
│   │       ├── page.tsx            # 節目列表
│   │       ├── new/page.tsx        # 新增節目
│   │       └── [id]/edit/page.tsx  # 編輯節目
│   └── api/
│       └── admin/
│           └── shows/              # 【新增】節目 API
│               ├── route.ts        # GET (list), POST (create)
│               └── [id]/route.ts   # GET, PATCH, DELETE
├── components/
│   ├── admin/
│   │   ├── ShowTable.tsx           # 【新增】節目列表表格
│   │   ├── ShowForm.tsx            # 【新增】節目編輯/新增表單
│   │   ├── EpisodeTable.tsx        # 調整樣式
│   │   ├── EpisodeForm.tsx         # 調整樣式
│   │   ├── CommentModerationTable.tsx  # 調整樣式
│   │   ├── AffiliateForm.tsx       # 調整樣式
│   │   └── AdminPagination.tsx     # 調整樣式
│   └── ui/                         # shadcn 元件（已配置設計 tokens）
├── lib/
│   ├── services/admin/
│   │   ├── shows.ts                # 【新增】節目 CRUD 服務
│   │   ├── episodes.ts             # 既有
│   │   ├── comments.ts             # 既有
│   │   └── affiliates.ts           # 既有
│   └── supabase/
└── types/
    └── database.ts                 # 含 Show 型別
```

**Structure Decision**: 單一 Next.js App；後台為 route group `(admin)`。本 feature 在既有結構上：
1. 調整後台所有頁面與元件的 Tailwind class 使用設計 tokens
2. 新增 `/shows` 路由群組與對應 API、服務、元件

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

（無需填寫）
