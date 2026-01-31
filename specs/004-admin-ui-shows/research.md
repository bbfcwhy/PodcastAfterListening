# Research: 後台 UI 風格統一與節目管理

**Feature**: 004-admin-ui-shows
**Date**: 2026-01-30

## 研究任務

本 feature 技術上延續既有架構，無需外部研究。以下整理既有模式與決策。

---

## 1. 後台 UI 設計 tokens 對應

### Decision
使用 `002-ui-reference-style` 已定義的設計 tokens，將後台樣式從 shadcn 預設色（如 `bg-muted/40`）改為專案設計 tokens（如 `bg-surface`）。

### Rationale
- 前台已完成設計 tokens 整合（globals.css），後台應保持一致
- shadcn 元件已透過 CSS 變數映射到設計 tokens，大部分元件無需修改
- 主要需調整的是後台 layout 與表格的自訂樣式

### 對應表

| 既有用法 | 改為設計 token |
|---------|---------------|
| `bg-muted/40` | `bg-surface` |
| `border-r` | `border-r border-border-subtle` |
| `text-lg font-bold` | `text-lg font-bold text-text-primary` |
| `hover:bg-*` (ghost button) | 已由 shadcn 處理，無需改 |
| 表格 hover | `hover:bg-hover` |
| 表格分隔線 | `border-border-subtle` |

---

## 2. 節目管理功能模式

### Decision
完全複製既有 episodes/affiliates 的 CRUD 模式：
- 服務層：`lib/services/admin/shows.ts`
- API 層：`app/api/admin/shows/route.ts` + `[id]/route.ts`
- 頁面層：`app/(admin)/shows/page.tsx` + `new/page.tsx` + `[id]/edit/page.tsx`
- 元件層：`components/admin/ShowTable.tsx` + `ShowForm.tsx`

### Rationale
- 維持程式碼一致性，降低學習成本
- 衝突偵測（updated_at）、未儲存提示、分頁等機制可直接複製
- 表單驗證模式與錯誤處理已在 EpisodeForm/AffiliateForm 驗證可行

### Alternatives Considered
- 使用 Server Actions 取代 API Routes：放棄，因既有模式使用 API Routes
- 使用 React Hook Form：放棄，因既有表單使用原生 useState

---

## 3. 節目表欄位對應

### Decision
直接使用既有 `shows` 表，無需 schema 變更。

### 欄位對應

| 資料庫欄位 | 表單欄位 | 類型 | 必填 |
|-----------|---------|------|------|
| name | 節目名稱 | text | 是 |
| slug | URL Slug | text | 是 |
| description | 描述 | textarea | 否 |
| cover_image_url | 封面圖片 URL | url | 否 |
| original_url | 原始連結 | url | 否 |

### Validation
- name: 必填，最大長度 255
- slug: 必填，唯一，僅允許小寫英數字與連字號
- description: 選填，最大長度 2000
- cover_image_url: 選填，須為有效 URL
- original_url: 選填，須為有效 URL

---

## 4. 側邊欄連結位置

### Decision
將「節目管理」放在「儀表板」之後、「單集管理」之前。

### Rationale
- 節目是單集的父層級，邏輯上應在單集之前
- 使用 `Radio` 或 `Podcast` icon（來自 lucide-react）

---

## 結論

無 NEEDS CLARIFICATION 項目。技術決策均基於既有模式，可直接進入 Phase 1 設計。
