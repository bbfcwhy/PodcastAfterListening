# Research: 002 UI 風格對齊 ui_reference

## 目標

在既有 Next.js + Tailwind v4 + shadcn 專案中，採用 `ui_reference` 的設計 token（DESIGN_TOKENS.md）與版面風格，且不改變既有功能與 API。

## 1. 主題與 Token 導入方式

**Decision**: 在 `src/app/globals.css` 中新增 ui_reference 的語意化顏色與邊框 token（canvas、surface、surface-muted、text-primary、text-secondary、text-muted、border-subtle、border-strong、cta、info、warn、hover、selected），並以 Tailwind v4 的 `@theme` 或 `:root` 變數暴露，供全站使用；既有 shadcn 變數（--background、--foreground 等）可保留並對應至 reference 色值，或與 reference token 並存、元件逐步改用 reference 類名。

**Rationale**: 專案已使用 Tailwind v4（`tailwindcss: ^4.1.18`）與 `@theme inline`；ui_reference 的 `src/index.css` 亦使用 `@theme { --color-canvas: ... }` 寫法，可直接移植色值與命名。單一 CSS 入口（globals.css）便於維護，且符合 SC-002（無硬編色碼、皆透過 token/主題引用）。

**Alternatives considered**:
- 僅覆寫 shadcn 的 `:root` 變數為 reference 色值：可達成「全站變色」，但語意名稱與 DESIGN_TOKENS 不一致（例如 primary 對應 CTA），後續對照文件與參考碼較易混淆；若需嚴格對齊文件，以新增 token 名稱較佳。
- 另建 design-tokens 套件或 JSON：本 feature 範圍為單一專案、單一參考來源，無需額外套件；DESIGN_TOKENS.md 已為單一真相來源。

## 2. 與 shadcn/ui 的關係

**Decision**: 保留既有 shadcn 元件結構與 Radix 行為，僅調整其樣式：透過覆寫或擴充 `globals.css` 中的 CSS 變數（例如 `--primary` → CTA 色、`--background` → canvas、`--card` → surface），或於元件層改用 reference 的 class（如 `bg-canvas`、`bg-cta`）。若 shadcn 元件使用 `bg-primary` 等，則將 `--primary` 設為 reference 的 CTA 色即可同時滿足「主按鈕用 CTA」與既有元件不重寫。

**Rationale**: 功能不變（FR-008）；shadcn 負責可及性與互動，僅視覺對齊 reference。雙軌並存（reference token 名 + shadcn 變數對應）可漸進遷移。

**Alternatives considered**:
- 全面替換 shadcn 為自製元件：超出本 feature 範圍，且會影響可及性與維護成本。
- 僅新增 token、不碰 shadcn 變數：可行，但需在每個元件改 class 名；若先對應 shadcn 變數可減少改動量。

## 3. 版面與導覽結構

**Decision**: 參考 ui_reference 的 App.tsx：固定側邊欄（lg 以上）+ 頂部 sticky header（含搜尋與次要操作）、圓角卡片（如 rounded-[2.5rem]）、區塊標題搭配圖示或標籤。在維持既有路由與功能前提下，將 MainLayout 與導覽結構對齊參考（例如側欄連結樣式、選中態用 selected、hover 用 hover 色），卡片與區塊使用 reference 的圓角與陰影（如 rounded-card、shadow-sm、border-border-subtle）。

**Rationale**: FR-007 要求版面與元件呈現與參考對齊；參考使用 Tailwind utility，與本專案一致，可直接沿用 class 命名與數值。

**Alternatives considered**:
- 完全複製參考的 Sidebar/DiscoveryView 結構：參考部分路由（如 AI 實驗室）本專案不存在，僅擷取共用模式（側欄、header、卡片圓角）套用於既有頁面。

## 4. 字型與圖示

**Decision**: 字型與 spec Assumptions 一致：可與 reference 對齊為 Noto Sans TC，若專案已有設定且不影響可讀性則可保留或對齊。圖示沿用既有 Lucide（與 reference 相同），無需更換。

**Rationale**: spec 明示字型/圖示以不增加授權成本、視覺相容為原則；Lucide 已在使用，reference 亦用 Lucide。

## 5. 響應式與斷點

**Decision**: 響應式斷點可依本專案需求微調（如既有 breakpoint 與 001 一致），但同一斷點下的配色、圓角、字級層級須與 reference 一致；參考使用 `lg:` 顯示側欄，本專案可沿用相同斷點或既有設定。

**Rationale**: spec Edge Cases 允許響應式微調，僅要求視覺一致。

## 6. 驗證與不迴歸

**Decision**: 視覺驗證以手動比對與既有 E2E 不迴歸為主；可列出一份「token 對照表」與「關鍵頁面檢查清單」（首頁、節目列表、單集詳情、後台一頁）供實作後勾選。不需新增自動化視覺回歸測試，除非 001 已有約定。

**Rationale**: 本 feature 為樣式遷移，功能不變；E2E 通過即代表行為不迴歸；SC-001～SC-004 可透過手動檢查與 token 掃描（無硬編色碼）驗證。
