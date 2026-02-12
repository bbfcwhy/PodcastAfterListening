# Implementation Plan: 節目／單集 RSS 欄位與逐字稿來源

**Branch**: `005-rss-metadata-transcript` | **Date**: 2026-01-30 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/005-rss-metadata-transcript/spec.md`

## Summary

在網站上顯示節目自己的圖片、名稱、主持人、關於、Hosting provided by、Tags，以及每集「節目自己填的說明」；資料來源為 RSS Feed（channel / item 對應既有 Show / Episode）。RSS 同步可為排程或後台手動觸發。Spotify 逐字稿無官方 API 可程式下載，逐字稿來源策略記錄於 research.md，本 feature 不實作逐字稿下載，僅釐清並記錄。

## Technical Context

**Language/Version**: TypeScript 5.x（延續既有專案）
**Primary Dependencies**: Next.js 16 (App Router), @supabase/ssr, 既有 UI / services
**Storage**: Supabase (PostgreSQL)；Show / Episode 擴充欄位或對應表
**Testing**: 既有 Vitest + Playwright；可為 RSS 解析與同步加單元／整合測試
**Target Platform**: Web（與 001 一致）
**Project Type**: Web 應用程式（全端 Next.js）
**Performance Goals**: RSS 同步單一 feed 可接受數十秒；前台讀取與現有頁面一致
**Constraints**: 單人維護、RSS 解析須容錯（缺欄位不中斷）、不依賴 Spotify 官方逐字稿 API
**Scale/Scope**: 初期節目數與單集數與 001 同；RSS 同步為批次／排程，非高頻

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> Constitution 尚未配置具體原則（模板狀態），無特定 Gate 需檢查。
> **Status**: PASS（無 Gate 定義）

## Project Structure

### Documentation (this feature)

```text
specs/005-rss-metadata-transcript/
├── plan.md              # This file
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── README.md        # API / 同步觸發說明
└── tasks.md             # Phase 2 output (/speckit.tasks command)
```

### Source Code (repository root)

延續既有結構；本 feature 主要變更：

- **Show / Episode 欄位**：擴充或對應 RSS（見 data-model.md）
- **RSS 解析與同步**：可置於 `src/lib/services/rss/` 或既有 `src/lib/services/` 下
- **前台顯示**：`src/app/(public)/shows/`、`src/app/(public)/episodes/` 及相關 components 使用新欄位
- **後台／API**：可新增「手動觸發 RSS 同步」API 或排程入口（依 tasks 拆解）

```text
src/
├── app/
│   ├── (public)/        # 節目／單集頁使用新欄位
│   └── api/             # 可新增 RSS 同步觸發
├── components/          # 節目／單集區塊顯示 Hosting、Tags、節目說明等
├── lib/
│   └── services/        # rss 解析與同步邏輯（或 rss/ 子目錄）
└── types/
```

**Structure Decision**: 單一 Next.js 專案；RSS 同步為 server-side 服務，前台僅讀取已同步之欄位。

## Complexity Tracking

> 無 Constitution 違規需說明。
