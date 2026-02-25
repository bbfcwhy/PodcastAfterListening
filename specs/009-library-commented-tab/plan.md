# Implementation Plan: Library 頁面「我的留言」Tab

**Branch**: `009-library-commented-tab` | **Date**: 2026-02-25 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/009-library-commented-tab/spec.md`

## Summary

在 Library 頁面新增第三個 Tab「我的留言」，顯示使用者曾留言過的單集列表。查詢現有 `comments` 表，在應用層按 episode_id 分組後，顯示單集資訊與留言數量。不需要新增資料表。

## Technical Context

**Language/Version**: TypeScript 5.x
**Primary Dependencies**: Next.js 16 (App Router), React 19, @supabase/ssr, shadcn/ui, date-fns, Tailwind CSS 4
**Storage**: Supabase (PostgreSQL) — 查詢現有 `comments` 表，不新增表
**Testing**: 手動測試
**Target Platform**: Web (Cloudflare Workers 部署)
**Project Type**: Web application (Next.js fullstack)
**Performance Goals**: 「我的留言」Tab 載入速度與其他 Tab 一致
**Constraints**: 與現有 UI 風格一致，使用 shadcn/ui 元件
**Scale/Scope**: 影響 1 個現有檔案、新增 1 個檔案

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

| 原則 | 狀態 | 說明 |
|------|------|------|
| I. 繁體中文 | ✅ 通過 | 所有文件以繁體中文撰寫 |
| II. Spec-Driven Development | ✅ 通過 | 已有 spec.md，plan.md 由此生成 |
| III. User-Centric Design | ✅ 通過 | 由 User Story 和 Success Criteria 驅動 |
| IV. Verification First | ✅ 通過 | Acceptance Scenarios 已定義 |
| Tech Stack | ✅ 通過 | 使用 Next.js, TypeScript, Tailwind CSS, Supabase |
| Code Quality | ✅ 通過 | 複用既有模式，模組化元件設計 |

## Project Structure

### Documentation (this feature)

```text
specs/009-library-commented-tab/
├── plan.md              # 本檔案
├── research.md          # 查詢方案研究
├── data-model.md        # 資料模型（使用現有表）
├── quickstart.md        # 開發快速入門
├── contracts/           # 查詢 contract
│   └── library-commented-query.md
└── tasks.md             # 待 /speckit.tasks 生成
```

### Source Code (變更範圍)

```text
src/
├── app/(public)/
│   └── library/
│       └── page.tsx                    # [修改] 新增留言查詢、Tabs 3 欄、「我的留言」Tab
└── components/library/
    └── CommentedEpisodeList.tsx        # [新增] 留言過的單集列表元件
```

**Structure Decision**: 遵循既有的 Next.js App Router 專案結構。僅新增一個元件檔案，修改一個頁面檔案。

## 查詢方案

### 步驟

1. **查詢 comments 表**: 取得使用者所有 approved 留言的 `episode_id` 和 `created_at`
2. **應用層分組**: 按 `episode_id` 分組，計算留言數和最新留言時間
3. **查詢 episodes VIEW**: 用分組後的 episode_id 列表，查詢單集詳情（含 shows join）
4. **過濾**: 移除已刪除的單集（episode 為 null）
5. **合併排序**: 合併留言統計和單集詳情，按最新留言時間倒序

### 為什麼不用 RPC

- 使用者留言過的單集數量通常 < 100，應用層分組效能足夠
- 避免額外維護資料庫函式
- 保持與既有查詢模式一致
