# Quickstart: 002 UI 風格對齊驗證

**Branch**: `002-ui-reference-style`
**Date**: 2026-01-29

本 feature 不新增環境或服務依賴；沿用 001 的 Supabase、OAuth 與本地開發流程。以下為在地驗證「風格對齊」的建議步驟；完成下方視覺檢查清單即視為達成規格 SC-004（全站視覺風格統一）。

## Prerequisites

- 已完成 001 的環境設定（Node.js、Supabase、`.env.local` 等）
- 專案根目錄可存取 `ui_reference/` 與 `ui_reference/DESIGN_TOKENS.md`

## 1. 啟動開發伺服器

```bash
cd /path/to/PodcastAfterListening
npm run dev
```

在瀏覽器開啟 `http://localhost:3000`（或終端顯示的埠號）。

## 2. 視覺驗證檢查清單

對照 `ui_reference/DESIGN_TOKENS.md` 與參考畫面（若有），確認：

**全站與背景**
- [ ] 全站底色為 reference 的 canvas（暖色 #E4CBAC）
- [ ] 卡片、輸入框、對話框為 surface（白底）
- [ ] 僅提示區塊使用 surface-muted

**文字**
- [ ] 主文字為 text-primary、次要為 text-secondary；必要處使用 text-muted
- [ ] 無硬編色碼（如 `#xxx`）在元件上

**按鈕與互動**
- [ ] 主按鈕為 CTA 色（#DAA551）、次要為 CTA 描邊
- [ ] 標籤/篩選使用 info 色，不用作主按鈕
- [ ] Hover/selected 使用 reference 的 hover/selected 色

**邊框與狀態**
- [ ] 邊框以 border-subtle 為主，陰影僅 shadow-sm
- [ ] 警示/錯誤使用 warn 色且小面積

**版面**
- [ ] 導覽結構與參考一致或合理對應（如側欄 + 頂部 header）
- [ ] 區塊圓角、標題樣式、卡片排版與參考一致

## 3. 關鍵頁面快速檢查

- **首頁**：背景、卡片、按鈕、導覽
- **節目列表 / 單集詳情**：節目卡、單集卡、業配區、留言區
- **後台任一頁**：同一套 token、無「畫風斷裂」

## 4. 功能不迴歸

```bash
npm run test:e2e
```

E2E 通過即表示既有功能（001）行為不變；若有視覺相關 E2E，可一併確認。

## 5. Token 掃描（可選）

搜尋程式碼中是否殘留硬編色碼（如 `#E4CBAC`、`#664129`），應僅出現在 `globals.css` 或主題定義處，元件內皆透過 token/變數引用。
