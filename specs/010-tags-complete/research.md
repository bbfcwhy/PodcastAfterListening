# 研究筆記：Tags 功能完善

**Feature**: 010-tags-complete
**Date**: 2026-02-25

## 決策 1：標籤管理 CRUD 模式

**Decision**: 採用 API Route + Server Action 混合模式，與現有 Shows/Episodes 管理一致
**Rationale**: 專案已建立清楚的 admin CRUD 模式：API Routes 處理驗證與寫入（POST/PATCH/DELETE），Server Actions 處理讀取與快取失效。標籤管理應延續此模式。
**Alternatives considered**:
- 純 Server Actions：已有 API Route 模式，統一比較好維護
- 純 API Routes：讀取操作用 Server Actions 搭配 revalidatePath 更方便

## 決策 2：標籤選擇器 UI 元件

**Decision**: 使用 Combobox（搜尋式下拉 + chips 顯示已選標籤）
**Rationale**: 現有 EpisodeForm 的 show selector 使用 shadcn/ui Select，但標籤需要多選+搜尋+已選清單顯示，Combobox + Badge chips 更適合。專案已有 shadcn/ui，可用 Command（cmdk）元件實作。
**Alternatives considered**:
- 簡單多選 checkbox list：標籤量大時不好搜尋
- 自由輸入 + 自動完成：spec 明確指出不允許在此處建立新標籤

## 決策 3：show_tags 關聯表與遷移策略

**Decision**: 建立 show_tags 關聯表，撰寫一次性遷移 SQL 將 shows.tags[] 資料轉入正規化結構
**Rationale**: Clarification 確認要將 shows.tags[] 遷移至正規化 tags 表。遷移需：(1) 從 shows.tags[] 擷取所有唯一標籤名稱 (2) INSERT INTO tags（若不存在）(3) INSERT INTO show_tags (4) 驗證後移除 shows.tags[] 欄位。
**Alternatives considered**:
- 保留 shows.tags[] 不動：已被 clarification 排除
- 軟遷移（保留舊欄位但不再寫入）：增加維護負擔，不如一次到位

## 決策 4：標籤頁面路由

**Decision**: 使用 `/tags/[slug]` 路由顯示該標籤下的所有單集
**Rationale**: 與現有路由風格一致（`/episodes/[showSlug]/[episodeSlug]`），slug 為 URL-safe，SEO 友好。
**Alternatives considered**:
- `/search?tags=slug`：不夠直覺，使用者無法直接分享標籤頁面
- `/tags/[id]`：UUID 不利 SEO 和可讀性

## 決策 5：Slug 自動產生

**Decision**: 標籤建立時自動從名稱產生 slug（中文用 encodeURIComponent 或 pinyin），管理員可手動覆寫
**Rationale**: 現有 Shows 的 slug 是完全手動輸入（`[a-z0-9-]+` 格式），但標籤名稱多為中文（如「科技」「訪談」），手動轉換不方便。建議自動產生但允許覆寫。中文 slug 直接使用 URL-encoded 中文字元（Next.js App Router 原生支援）。
**Alternatives considered**:
- 強制手動輸入：對大量中文標籤不友好
- 使用 pinyin 轉換：增加依賴，且可能產生不預期的 slug

## 決策 6：搜尋頁面標籤篩選 UI

**Decision**: 在現有 SearchFilters 元件中新增標籤多選區塊，使用 checkbox list + badge chips
**Rationale**: SearchFilters 已接收 `tags` prop 但未使用（`_tags`）。只需在現有篩選欄中新增標籤區塊，保持一致風格。後端 `search_episodes()` RPC 已支援 `filter_tags UUID[]` 參數，只需前端串接。
**Alternatives considered**:
- 獨立的標籤篩選元件：破壞現有篩選 UI 的統一性
- Tag cloud 風格：較花俏但不符合現有設計語言

## 現有基礎設施盤點

| 項目 | 狀態 | 位置 |
|------|------|------|
| tags 表 | ✅ 已存在 | migrations/001 |
| episode_tags 表 | ✅ 已存在 | migrations/001 |
| RLS policies | ✅ 已存在 | migrations/002 |
| search_episodes RPC（含 filter_tags） | ✅ 已存在 | migrations/003 |
| 單集頁標籤顯示 | ✅ 已存在（需改為可點擊） | episodes/[slug]/page.tsx |
| SearchFilters tags prop | ✅ 已存在（未使用） | SearchFilters.tsx |
| Admin Sidebar | ✅ 需新增入口 | AdminSidebar.tsx |
| show_tags 表 | ❌ 需新建 | 新 migration |
| 標籤管理頁面 | ❌ 需新建 | /admin/tags |
| 標籤 API Routes | ❌ 需新建 | /api/admin/tags |
| 標籤選擇器元件 | ❌ 需新建 | TagPicker.tsx |
| 標籤瀏覽頁面 | ❌ 需新建 | /tags/[slug] |
