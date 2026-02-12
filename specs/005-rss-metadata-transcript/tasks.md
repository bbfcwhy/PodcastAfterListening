# Tasks: 節目／單集 RSS 欄位與逐字稿來源

**Input**: Design documents from `/specs/005-rss-metadata-transcript/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Scope**: User Story 1–3 實作；User Story 4（逐字稿來源）已記錄於 research.md，本 feature 不實作逐字稿下載。  
**Task count**: 14 (T001–T012 含 Phase 1–6).

**Organization**: Tasks are grouped by phase; US1/US2 為前台顯示，US3 為 RSS 同步。

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story (US1, US2, US3)
- Include exact file paths where applicable

## Path Conventions

- Next.js App at repo root: `src/app/`, `src/components/`, `src/lib/`
- Public pages: `src/app/(public)/shows/`, `src/app/(public)/episodes/`
- API: `src/app/api/admin/` (RSS sync)

---

## Phase 1: Setup

**Purpose**: Verify project structure and config for this feature

- [X] T001 Verify .gitignore and project structure per plan.md at repo root; add any missing ignore patterns for Next.js/TypeScript

---

## Phase 2: Schema & Types

**Purpose**: DB 擴充與型別，供 RSS 同步與前台讀取

**Checkpoint**: Migration 與型別就緒後，RSS 同步與前台可依此讀寫

- [X] T002 Add migration for `shows` table: add columns `rss_feed_url` (TEXT), `hosting_provided_by` (TEXT), `show_categories` (TEXT[] or JSONB) per data-model.md; place under `supabase/migrations/`
- [X] T003 Update TypeScript types for Show (e.g. `src/types/database.ts` or equivalent): include `rss_feed_url`, `hosting_provided_by`, `show_categories`; ensure Episode type exposes `description` (單集說明), `duration_seconds` for front-end

---

## Phase 3: User Story 3 - RSS 同步 (Priority: P2)

**Goal**: 系統能從節目 RSS Feed 下載並更新節目級與單集級欄位；可為後台手動觸發或排程。

**Independent Test**: 提供測試用 RSS URL，執行同步後檢查 DB 與 API 是否寫入對應欄位。

- [X] T004 [US3] Add RSS parser: create `src/lib/services/rss/` (or under `src/lib/services/`) to fetch XML and parse RSS 2.0 + iTunes namespace (channel: title, description, itunes:image, itunes:author, itunes:category; item: title, description, pubDate, itunes:duration, guid); output structured data; handle missing fields without throwing
- [X] T005 [US3] Add sync service: given `show_id` or `rss_feed_url`, fetch feed via parser, update `shows` (name, description, cover_image_url, hosting_provided_by, show_categories, host/show_hosts per itunes:author), upsert `podcast_episodes` by guid/slug (description, duration_seconds, published_at, title, etc.); log errors, allow partial success per contracts/README.md
- [X] T006 [US3] Add POST `/api/admin/shows/[id]/sync-rss`: require admin auth, read show's `rss_feed_url`, call sync service, return `{ ok, show_updated, episodes_updated, errors? }`; 4xx/5xx with clear message on failure per contracts/README.md

**Checkpoint**: User Story 3 testable – trigger sync for a show with RSS URL, verify DB and optional UI feedback

---

## Phase 4: User Story 1 - 前台節目級欄位 (Priority: P1)

**Goal**: 節目詳情頁與單集頁的節目區塊顯示節目圖片、名稱、主持人、關於、Hosting provided by、Tags；欄位為空時不報錯。

**Independent Test**: 節目／單集頁載入後，確認節目區塊顯示上述欄位；比對 RSS 同步後之資料。

- [X] T007 [US1] Ensure show detail page displays 節目級欄位: in `src/app/(public)/shows/[slug]/page.tsx` (or equivalent), show 節目圖片、節目名稱、主持人、關於、Hosting provided by（若有）、Tags（show_categories）；若欄位為空則不顯示該區塊或顯示佔位
- [X] T008 [US1] Ensure episode detail page 節目區塊 displays same 節目級欄位: in `src/app/(public)/episodes/` (e.g. episode page or layout), 節目區塊顯示 節目圖片、名稱、主持人、關於、Hosting、Tags（from show）；若為空則不顯示或佔位

**Checkpoint**: User Story 1 testable – open show page and episode page, confirm 節目級欄位 visible when data present

---

## Phase 5: User Story 2 - 單集說明 (Priority: P1)

**Goal**: 單集詳情頁顯示「單集說明」區塊（即 RSS item description），與 AI 大綱、站長心得分開；內容須安全處理。

**Independent Test**: 單集頁有「單集說明」區塊，內容來自 `podcast_episodes.description`；無則不顯示或「本集無單集說明」。

- [X] T009 [US2] Add 單集說明 block on episode detail page: read `description` from episode data, render as 「單集說明」區塊; separate from ai_summary and host_notes; if empty, hide block or show 「本集無單集說明」 per spec
- [X] T010 [US2] NFR-002: Sanitize or escape 單集說明 and 關於 (show description) for XSS in display components (e.g. allow limited HTML or plain text only); ensure no raw user HTML without sanitization in `src/components/` or page components that render description/about

**Checkpoint**: User Story 2 testable – episode page shows 單集說明; XSS-safe rendering

---

## Phase 6: Polish

**Purpose**: Validation and docs

- [X] T011 [P] Update quickstart.md if needed: ensure steps and acceptance scenarios match implemented behavior in `specs/005-rss-metadata-transcript/quickstart.md`
- [X] T012 Fix TypeScript/lint errors in touched files (RSS service, API route, show/episode pages, types)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies – start first
- **Phase 2 (Schema & Types)**: Depends on Phase 1 – BLOCKS RSS sync and front-end display
- **Phase 3 (US3)**: Depends on Phase 2 – RSS sync needs new columns and types
- **Phase 4 (US1)**: Depends on Phase 2 (read new fields); can overlap with Phase 3 if data already exists or is mocked
- **Phase 5 (US2)**: Depends on Phase 2; can run with Phase 4 (same episode page)
- **Phase 6 (Polish)**: After Phase 3–5

### Suggested Order

1. T001 → T002 → T003  
2. T004 → T005 → T006 (RSS sync)  
3. T007, T008 (US1 節目級欄位)  
4. T009, T010 (US2 單集說明 + 安全)  
5. T011, T012 (Polish)

---

## Out of Scope (No Tasks)

- **User Story 4 (逐字稿)**: research.md 已記錄 Spotify 逐字稿不可程式下載及替代方案；本 feature 不實作逐字稿下載或顯示流程。
- **排程 RSS 同步**: 契約允許「排程或手動」；若需 cron/scheduled job，可另開 task 或專案設定。
- **後台節目管理 (004)**: 若 004 實作節目 CRUD，可於該 feature 新增 `rss_feed_url`、`hosting_provided_by`、`show_categories` 的表單欄位；本 tasks 不重複列出。
