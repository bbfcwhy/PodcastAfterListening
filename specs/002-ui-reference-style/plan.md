# Implementation Plan: 參考 ui_reference 之 UI 風格設計

**Branch**: `002-ui-reference-style` | **Date**: 2026-01-29 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/002-ui-reference-style/spec.md`

## Summary

將現有 Podcast 聽後回顧網站（001 功能不變）的視覺與版面對齊專案內 `ui_reference` 的設計：採用 DESIGN_TOKENS.md 的語意化配色（canvas、surface、cta、text-primary 等）、版面結構與元件樣式（導覽、圓角、卡片、hover/selected/warn 狀態），全站透過設計 token 或主題變數引用、不寫硬編色碼，既有 API 與資料流不改動。

## Technical Context

**Language/Version**: TypeScript 5.x（與 001 一致）
**Primary Dependencies**: Next.js 14+ (App Router), Tailwind CSS 4.x, shadcn/ui（既有）, ui_reference 為風格參考來源
**Storage**: N/A（本 feature 不涉及資料庫變更）
**Testing**: 既有 Vitest + Playwright；視覺驗證以手動比對與 E2E 不迴歸為主
**Target Platform**: Web（與 001 一致）
**Project Type**: Web 應用程式（全端 Next.js，沿用既有結構）
**Performance Goals**: 與 001 一致；樣式與主題變數不增加明顯載入開銷
**Constraints**: 功能不變、僅視覺與版面；以 ui_reference/DESIGN_TOKENS.md 為單一權威參考
**Scale/Scope**: 全站頁面與元件套用同一套 token；後台與公開頁一致風格

> 技術決策與對應方式見 [research.md](./research.md)

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

> Constitution 尚未配置具體原則（模板狀態），無特定 Gate 需檢查。

**Status**: PASS（無 Gate 定義）

## Project Structure

### Documentation (this feature)

```text
specs/002-ui-reference-style/
├── plan.md              # 本檔
├── research.md          # Phase 0 產出
├── data-model.md       # Phase 1 產出（設計 token 對照）
├── quickstart.md       # Phase 1 產出（在地驗證步驟）
├── contracts/           # Phase 1 產出（無新增 API 之說明）
└── tasks.md            # Phase 2 產出（/speckit.tasks，非本指令建立）
```

### Source Code (repository root)

沿用 001 既有結構；本 feature 僅修改樣式與版面相關檔案，不新增頂層目錄。

```text
src/
├── app/
│   ├── (public)/        # 公開頁：套用 reference 風格
│   ├── (admin)/         # 後台：同一套 token
│   ├── api/             # 不變
│   ├── globals.css      # 主題變數：加入 reference tokens
│   └── layout.tsx       # 根版面：背景/字型等
├── components/          # 各區塊元件：改用 token class（如 bg-canvas, text-text-primary）
│   ├── ui/              # 基礎元件：按鈕、卡片、輸入等對齊 reference
│   ├── layout/          # MainLayout、導覽等版面
│   └── [episodes|shows|comments|...]  # 業務元件：僅 class 與結構微調
├── lib/
└── types/

ui_reference/            # 參考用，不搬移；DESIGN_TOKENS.md 為權威
├── DESIGN_TOKENS.md
├── src/index.css        # Tailwind @theme 範例
└── components/          # 版面與元件範例
```

**Structure Decision**: 維持既有 Next.js App Router 與 `src/` 結構；風格變更透過 `globals.css` 主題變數與元件 class 替換完成，參考來源保留於 `ui_reference/` 不納入建置。

## Complexity Tracking

> 無 Constitution 違規需說明。

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| N/A       | -          | -                                   |
