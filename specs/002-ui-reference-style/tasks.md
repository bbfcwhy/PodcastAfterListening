# Tasks: 參考 ui_reference 之 UI 風格設計

**Input**: Design documents from `/specs/002-ui-reference-style/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/, quickstart.md

**Tests**: Spec 未要求新增測試；以既有 E2E 不迴歸與 quickstart 手動檢查清單驗證。

**Organization**: Tasks grouped by user story (US1 視覺風格 → US2 版面呈現 → US3 互動狀態)；Foundational 完成後各 story 可依序或部分並行實作。

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: US1 / US2 / US3
- Include exact file paths in descriptions

## Path Conventions

- Repository root: `src/app/`, `src/components/` (Next.js App Router, existing 001 structure)
- Reference only: `ui_reference/`, `ui_reference/DESIGN_TOKENS.md`, `ui_reference/src/index.css`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Confirm reference and docs; no new dependencies.

- [X] T001 Verify ui_reference/DESIGN_TOKENS.md and specs/002-ui-reference-style/data-model.md exist; confirm no new npm dependencies required for this feature.

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Theme tokens and base styles MUST be in place before any user story styling.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [X] T002 Add reference design tokens (canvas, surface, surface-muted, text-primary, text-secondary, text-muted, border-subtle, border-strong, cta, info, warn, hover, selected) to src/app/globals.css per ui_reference/src/index.css and data-model.md (use @theme or :root so Tailwind exposes e.g. bg-canvas, text-text-primary).
- [X] T003 Apply base body styles (bg-canvas, text-text-primary, font Noto Sans TC if desired) in src/app/globals.css; ensure root layout in src/app/layout.tsx uses token-based background; add optional utility classes (e.g. glass-header, rounded-card) per research.md.

**Checkpoint**: Theme tokens available; base layout uses canvas and text-primary. US1 can start.

---

## Phase 3: User Story 1 - 一致的視覺風格 (Priority: P1) 🎯 MVP

**Goal**: 全站配色與參考一致：暖色背景、主/次文字層級、CTA 按鈕與描邊、淡色邊框與 shadow-sm。

**Independent Test**: 並排比對現站與參考設計；首頁與任一內頁背景、文字、按鈕、邊框符合 DESIGN_TOKENS。

### Implementation for User Story 1

- [X] T004 [P] [US1] Replace page and container backgrounds with bg-canvas, bg-surface, bg-surface-muted in src/app and src/components per FR-001 (e.g. layout, main wrappers, cards, inputs).
- [X] T005 [P] [US1] Replace text colors with text-text-primary, text-text-secondary, text-text-muted across src/components and src/app per FR-002.
- [X] T006 [US1] Replace border and shadow usage with border-border-subtle, border-border-strong, shadow-sm only in src/components per FR-003.
- [X] T007 [US1] Style primary and secondary buttons with bg-cta and border-cta; apply info to tags and filters in src/components/ui/button.tsx, src/components/ui/badge.tsx, src/components/search/SearchFilters.tsx, src/components/ui/tabs.tsx (and Badge 使用處：src/components/affiliates/AffiliateCard.tsx, src/components/admin/EpisodeTable.tsx, src/components/admin/CommentModerationTable.tsx) per FR-004.

**Checkpoint**: User Story 1 independently verifiable (visual comparison and token usage).

---

## Phase 4: User Story 2 - 介面呈現方式對齊參考 (Priority: P2)

**Goal**: 導覽結構、區塊圓角與留白、區塊標題樣式、卡片排版與參考一致。

**Independent Test**: 檢查首頁、節目列表、單集詳情等頁面導覽、區塊標題、卡片圓角與陰影符合參考。

### Implementation for User Story 2

- [X] T008 [US2] Align MainLayout and navigation with reference (sidebar or top nav, spacing, rounded corners, nav link styles) in src/components/layout/MainLayout.tsx.
- [X] T009 [P] [US2] Apply reference section title style (icon + label, rounded blocks) to content sections in: src/components/episodes/EpisodeSummary.tsx, src/components/episodes/OwnerNotes.tsx, src/components/episodes/SponsorshipSection.tsx; src/components/affiliates/AffiliateSection.tsx; src/components/comments/CommentSection.tsx; src/components/ui/AIDisclaimer.tsx; admin 區塊標題若有則套用於 src/components/admin/EpisodeForm.tsx, src/components/admin/AffiliateForm.tsx 等表頭/區塊標題處。
- [X] T010 [P] [US2] Apply reference card style (e.g. rounded-[2.5rem], shadow-sm, border-border-subtle, hover) to ShowCard, EpisodeCard, AffiliateCard in src/components/shows/ShowCard.tsx, src/components/episodes/EpisodeCard.tsx, src/components/affiliates/AffiliateCard.tsx and list containers.

**Checkpoint**: User Stories 1 and 2 both verifiable; layout and cards match reference.

---

## Phase 5: User Story 3 - 互動與狀態樣式一致 (Priority: P3)

**Goal**: Hover/selected 使用 reference 色；警示/錯誤使用 warn 且小面積。

**Independent Test**: 滑過按鈕與導覽、選中態、觸發警告/錯誤時顏色與參考一致。

### Implementation for User Story 3

- [X] T011 [US3] Apply hover and selected token classes (bg-hover, bg-selected) to nav links and interactive elements in src/components/layout and relevant src/components per FR-006.
- [X] T012 [US3] Apply warn token to alert, error, and destructive UI in src/components/ui/alert.tsx and related components per FR-005; keep usage small-area only.

**Checkpoint**: All three user stories complete; interaction and state styles aligned.

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: No hardcoded colors; E2E and quickstart validation.

- [X] T013 [P] Scan src/ for hardcoded color values (#xxx); remove or replace with token/theme references per SC-002.
- [X] T014 Run E2E (npm run test:e2e) and complete quickstart.md visual checklist to confirm SC-003, SC-004, and FR-008（功能不迴歸）.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies.
- **Phase 2 (Foundational)**: Depends on Phase 1; BLOCKS all user stories.
- **Phase 3 (US1)**: Depends on Phase 2.
- **Phase 4 (US2)**: Depends on Phase 2; can overlap with US1 (same files in layout/cards may suggest doing US1 first then US2).
- **Phase 5 (US3)**: Depends on Phase 2; can follow US1/US2 (hover/selected/warn touch many components).
- **Phase 6 (Polish)**: Depends on Phases 3–5.

### User Story Dependencies

- **US1 (P1)**: No dependency on US2/US3; implement first for MVP.
- **US2 (P2)**: Layout (T008) benefits from token usage from US1; card/style tasks (T009, T010) can use tokens from T002–T007.
- **US3 (P3)**: Hover/selected/warn apply on top of US1/US2 styling; can start after or in parallel once tokens exist.

### Parallel Opportunities

- T004 and T005 can run in parallel (different class renames across files).
- T009 and T010 can run in parallel (different component files).
- T013 (scan) can run anytime after implementation; T014 after all story tasks.

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1 and Phase 2.
2. Complete Phase 3 (T004–T007).
3. Validate with visual comparison and quickstart checklist.
4. Optionally deploy/demo before US2/US3.

### Incremental Delivery

1. Phase 1 + 2 → tokens and base layout ready.
2. Phase 3 → full visual style (MVP).
3. Phase 4 → layout and cards aligned.
4. Phase 5 → interaction and state styles.
5. Phase 6 → hardcode scan and E2E.

### Suggested MVP Scope

- Phases 1–3 (T001–T007): Theme tokens + consistent visual style (backgrounds, text, borders, buttons). Independent test: side-by-side comparison and token-only colors on key pages.

---

## Notes

- [P] tasks use different files or independent changes.
- [USn] maps task to spec user story for traceability.
- No new API or data model; only CSS/class and layout changes.
- Commit after each task or logical group; run E2E after Phase 6.
