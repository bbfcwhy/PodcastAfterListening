# Implementation Plan: 後台輕鬆修改網站內容

**Branch**: `003-admin-content-editing` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)  
**Input**: Feature specification from `/specs/003-admin-content-editing/spec.md`

**Note**: This template is filled in by the `/speckit.plan` command.

## Summary

讓站長在現有後台更快速、方便地找到並修改節目／單集／留言／聯盟內容。主要強化：統一導覽與搜尋、表單驗證與儲存回饋、離開前未儲存提示、n8n 並行更新時的衝突提示、列表分頁。資料來源以 n8n 上傳 Supabase 為主，後台供快速小修；第一版不實作預覽與草稿。

## Technical Context

**Language/Version**: TypeScript 5.x, Node 18+  
**Primary Dependencies**: Next.js 16, React 19, Supabase (SSR + JS client), Tailwind CSS 4  
**Storage**: Supabase (PostgreSQL)；既有表：shows, episodes, comments, affiliate_contents, profiles  
**Testing**: Playwright E2E（既有）；本 feature 以手動／E2E 驗收情境為主  
**Target Platform**: Web（瀏覽器）；後台需站長登入（Supabase Auth + profiles.is_admin）  
**Project Type**: Web（單一 Next.js App，route groups (admin) / (public)）  
**Performance Goals**: 列表分頁每頁約 20 筆；儲存回饋 5 秒內；常用操作 3 次點擊內（見 spec SC）  
**Constraints**: 沿用既有 Supabase schema 與 RLS；不新增獨立後端服務  
**Scale/Scope**: 單一站長、後台列表與表單強化；與 n8n 並行寫入時需衝突偵測

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

專案 `.specify/memory/constitution.md` 為範本（未訂定具體原則）。本 feature 為既有後台之體驗強化，未新增新專案或新架構，視為通過。

## Project Structure

### Documentation (this feature)

```text
specs/003-admin-content-editing/
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
│   │   ├── layout.tsx              # 側欄導覽：儀表板、節目管理、留言審核、聯盟行銷
│   │   ├── dashboard/
│   │   ├── episodes/                # 單集列表、新增、編輯
│   │   ├── comments/               # 留言審核（依狀態篩選）
│   │   └── affiliates/             # 聯盟內容列表、新增、編輯
│   ├── (public)/
│   └── api/
│       └── admin/                  # episodes, comments, affiliates API
├── components/
│   ├── admin/                      # EpisodeTable, EpisodeForm, CommentModerationTable, AffiliateForm
│   └── ui/                         # Pagination, form 元件
├── lib/
│   ├── services/admin/             # episodes, comments
│   └── supabase/
└── types/
    └── database.ts                 # Supabase 表型別（含 updated_at）
```

**Structure Decision**: 單一 Next.js App；後台為 route group `(admin)`，對應儀表板、單集、留言、聯盟。本 feature 在既有頁面與 API 上加入：分頁參數、未儲存提示、衝突偵測（updated_at），不新增頂層模組。

## Complexity Tracking

> **Fill ONLY if Constitution Check has violations that must be justified**

（無需填寫）
