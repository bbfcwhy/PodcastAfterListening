# Data Model: 002 UI 風格設計

本 feature 不新增或修改資料庫、API 資料結構；僅定義「設計 token」作為介面樣式的語意實體，供實作與驗證對照。

## 設計 Token（語意實體）

設計 token 為名稱與使用規則的對應，來源為 `ui_reference/DESIGN_TOKENS.md`，在本專案中以 CSS 變數 / Tailwind 主題形式實作。Tailwind 以 `--color-*` 產生 utility class，例如 `--color-text-primary` → `text-text-primary`、`--color-canvas` → `bg-canvas`。

| Token 名稱 | Tailwind class 範例 | 用途 | 參考色值 / 規則 |
|------------|---------------------|------|------------------|
| canvas | bg-canvas | 全站底色 | #E4CBAC |
| surface | bg-surface | 卡片、輸入框、對話框底 | #FFFFFF |
| surface-muted | bg-surface-muted | 提示區塊底 | rgba(228,203,172,0.35) |
| text-primary | text-text-primary | 主文字 | #664129 |
| text-secondary | text-text-secondary | 次要文字 | #B0967B |
| text-muted | text-text-muted | 弱化輔助字 | rgba(102,65,41,0.55) |
| border-subtle | border-border-subtle | 低存在感分隔 | rgba(138,158,158,0.35) |
| border-strong | border-border-strong | 較明顯分隔 | rgba(102,65,41,0.25) |
| cta | bg-cta, text-cta, border-cta | 主 CTA 按鈕、重點強調 | #DAA551 |
| info | bg-info, text-info | 資訊提示、標籤、篩選 | #8A9E9E |
| warn | bg-warn, text-warn | 警示、錯誤、到期 | #E6863A |
| hover | bg-hover | 滑過背景 | rgba(138,158,158,0.12) |
| selected | bg-selected | 選中背景 | rgba(218,165,81,0.18) |

## 使用規則（來自 DESIGN_TOKENS）

- 背景層級：全站 `canvas`，容器 `surface`，僅提示區塊 `surface-muted`。
- 文字：以 `text-primary`、`text-secondary` 為主；必要時 `text-muted`。
- 互動：主按鈕 `bg-cta`，次要按鈕 `border-cta`；標籤/篩選用 `info`，不用作主按鈕；警示/錯誤小面積使用 `warn`。
- 邊框與陰影：預設 `border-subtle`，陰影僅 `shadow-sm`。
- 禁止：硬編色碼（如 #xxx）、純黑 #000、高飽和亮藍亮紅（除非狀態色系）。

## 與既有專案的對應

- 本專案既有功能與資料模型依 001（節目、單集、留言、聯盟行銷等）不變。
- 本文件僅描述「介面呈現」所依賴的 token 實體，不涉及持久化資料。
