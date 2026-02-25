# Implementation Plan: Tags 功能完善

**Branch**: `010-tags-complete` | **Date**: 2026-02-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/010-tags-complete/spec.md`

## Summary

補齊標籤系統的所有缺失環節：後台標籤 CRUD 管理、單集/節目標籤指派、公開標籤瀏覽頁面、搜尋頁標籤篩選。同時將 shows.tags[] 非正規化欄位遷移至正規化 show_tags 關聯表。技術上延續現有 Next.js App Router + Supabase + shadcn/ui 模式，不引入新依賴。

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16 (App Router), React 19, @supabase/ssr, shadcn/ui, Tailwind CSS 4, Lucide icons
**Storage**: Supabase (PostgreSQL) — 使用現有 tags、episode_tags 表，新增 show_tags 表
**Testing**: 手動驗證（延續專案慣例）
**Target Platform**: Cloudflare Workers (via @opennextjs/cloudflare)
**Project Type**: Web application (Next.js fullstack)
**Performance Goals**: 標籤頁面 < 2 秒載入（SC-003）
**Constraints**: 單集標籤上限 10 個；標籤名稱與 slug 唯一
**Scale/Scope**: 預估 < 100 標籤，< 1000 關聯記錄

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 語言規範 | ✅ PASS | 所有文件使用繁體中文 |
| II. Spec-Driven Development | ✅ PASS | spec.md 已完成並通過 clarify |
| III. User-Centric Design | ✅ PASS | 4 個 User Stories 含 measurable Success Criteria |
| IV. Verification First | ✅ PASS | 每個 Story 有 Acceptance Scenarios 和 Independent Test |
| Tech Stack | ✅ PASS | Next.js + TypeScript + Tailwind + Supabase |
| Code Quality | ✅ PASS | 延續現有模組化元件模式 |

**Post-Phase 1 Re-check**: ✅ PASS — 資料模型使用現有正規化結構，API 延續現有 admin route 模式，無新增外部依賴。

## Project Structure

### Documentation (this feature)

```text
specs/010-tags-complete/
├── plan.md              # 本文件
├── research.md          # Phase 0 研究筆記
├── data-model.md        # Phase 1 資料模型
├── quickstart.md        # Phase 1 快速上手指南
├── contracts/
│   └── tags-api.md      # Phase 1 API 合約
└── tasks.md             # Phase 2 任務清單（由 /speckit.tasks 產生）
```

### Source Code (repository root)

```text
src/
├── app/
│   ├── (admin)/tags/
│   │   ├── page.tsx                    # 標籤管理列表
│   │   ├── new/page.tsx                # 新增標籤
│   │   └── [id]/edit/page.tsx          # 編輯標籤
│   ├── (public)/tags/
│   │   └── [slug]/page.tsx             # 標籤瀏覽頁面
│   └── api/admin/
│       ├── tags/
│       │   ├── route.ts                # GET / POST
│       │   └── [id]/
│       │       ├── route.ts            # PATCH / DELETE
│       │       └── usage/route.ts      # GET 使用統計
│       ├── episodes/[id]/tags/route.ts # PUT 單集標籤
│       └── shows/[id]/tags/route.ts    # PUT 節目標籤
├── components/admin/
│   ├── AdminSidebar.tsx                # 修改：新增標籤管理入口
│   ├── TagPicker.tsx                   # 新增：標籤搜尋選擇器
│   ├── EpisodeForm.tsx                 # 修改：新增 TagPicker
│   └── ShowForm.tsx                    # 修改：替換 tags input
├── components/search/
│   └── SearchFilters.tsx               # 修改：啟用 tags 篩選
├── lib/tags/
│   └── actions.ts                      # 新增：Server actions
└── types/
    └── database.ts                     # 修改：新增 show_tags，移除 shows.tags

supabase/
└── migrations/
    └── XXX_show_tags_migration.sql     # 新增：show_tags 表 + 資料遷移
```

**Structure Decision**: 延續現有的 Next.js App Router 結構，admin 頁面放在 `(admin)` route group，公開頁面放在 `(public)` route group，API routes 放在 `api/admin/` 下。

## Complexity Tracking

無 constitution 違規，無需記錄。
