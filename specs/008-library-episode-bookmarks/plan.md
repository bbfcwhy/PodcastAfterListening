# Implementation Plan: Library 收藏功能修復與單集收藏

**Branch**: `008-library-episode-bookmarks` | **Date**: 2026-02-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/008-library-episode-bookmarks/spec.md`

## Summary

修復 Library 頁面因 Next.js Client-Side Router Cache 導致不顯示已收藏頻道的 Bug，並新增獨立的單集收藏功能（含新資料表、Server Actions、UI 元件），最後在 Library 頁面加入 Tab 分類切換。

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16 (App Router), React 19, @supabase/ssr, shadcn/ui, @radix-ui/react-tabs, @dnd-kit, Tailwind CSS 4
**Storage**: Supabase (PostgreSQL) — 新增 `episode_library_items` 表
**Testing**: Playwright (E2E), 手動測試
**Target Platform**: Web (Cloudflare Workers 部署)
**Project Type**: Web application (Next.js fullstack)
**Performance Goals**: 收藏操作視覺回饋 < 1 秒，Library 頁面載入不因新功能明顯變慢
**Constraints**: 與現有 UI 風格一致，使用 shadcn/ui 元件
**Scale/Scope**: 影響 5 個現有檔案、新增 3 個檔案、1 個新資料表

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 繁體中文 | ✅ 通過 | 所有文件以繁體中文撰寫 |
| II. Spec-Driven Development | ✅ 通過 | 已有 spec.md，plan.md 由此生成 |
| III. User-Centric Design | ✅ 通過 | 由 User Stories 和 Success Criteria 驅動 |
| IV. Verification First | ✅ 通過 | Acceptance Scenarios 已定義，quickstart.md 含驗證步驟 |
| Tech Stack | ✅ 通過 | 使用 Next.js, TypeScript, Tailwind CSS, Supabase |
| Code Quality | ✅ 通過 | 模組化元件設計，複用既有模式 |

## Project Structure

### Documentation (this feature)

```text
specs/008-library-episode-bookmarks/
├── plan.md              # 本檔案
├── research.md          # Bug 根因分析與技術方案
├── data-model.md        # 資料模型設計
├── quickstart.md        # 開發快速入門
├── contracts/           # API/Action contracts
│   └── episode-library-actions.md
└── tasks.md             # 待 /speckit.tasks 生成
```

### Source Code (變更範圍)

```text
src/
├── app/(public)/
│   ├── library/
│   │   └── page.tsx              # [修改] force-dynamic、Tab 切換、單集查詢
│   └── episodes/
│       └── [showSlug]/
│           └── [episodeSlug]/
│               └── page.tsx      # [修改] 加入單集收藏按鈕
├── components/library/
│   ├── AddToLibraryButton.tsx    # [修改] 加 router.refresh()
│   ├── LibraryList.tsx           # [修改] 修正 stale props
│   ├── AddEpisodeToLibraryButton.tsx  # [新增] 單集收藏按鈕
│   └── EpisodeLibraryList.tsx    # [新增] 單集收藏列表
├── lib/library/
│   ├── actions.ts                # [修改] 修正 revalidatePath
│   └── episode-actions.ts        # [新增] 單集收藏 Server Actions
└── types/
    └── database.ts               # [修改] 新增 EpisodeLibraryItem 型別

supabase/
└── policies.sql                  # [修改] 新增 episode_library_items 表和 RLS
```

**Structure Decision**: 遵循既有的 Next.js App Router 專案結構，新檔案放在對應的現有目錄下，與頻道收藏的程式碼組織方式一致。

## Bug 修復方案（P1）

### 根因

Next.js Client-Side Router Cache 快取了 Library 頁面的空狀態。使用者收藏頻道後透過 `<Link>` 導航回 Library，看到的是快取版本。

### 修復步驟

1. **Library 頁面加入 `export const dynamic = "force-dynamic"`** — Library 是認證相關頁面，不應被靜態快取
2. **AddToLibraryButton 加入 `router.refresh()`** — 清除 Client-Side Router Cache
3. **修正 `revalidatePath` 路徑** — 移除無效的 UUID 路徑 revalidation
4. **LibraryList 修正 stale props** — 使用 `key` prop 或 `useEffect` 同步

## 新功能方案（P2 + P3）

### 單集收藏

1. 新增 `episode_library_items` 表（詳見 `data-model.md`）
2. 新增 `episode-actions.ts`：`addEpisodeToLibrary`、`removeEpisodeFromLibrary`
3. 新增 `AddEpisodeToLibraryButton.tsx`：複用 `AddToLibraryButton` 的設計模式
4. 在單集詳情頁整合按鈕

### Library 分類顯示

1. 使用 shadcn/ui `Tabs` 元件（`@radix-ui/react-tabs`，已安裝）
2. 預設顯示「頻道」Tab
3. 「單集」Tab 顯示收藏的單集列表（含所屬頻道名稱）
4. 頻道 Tab 維持現有的拖曳排序功能
