# Tasks: 後台輕鬆修改網站內容

**Input**: Design documents from `/specs/003-admin-content-editing/`  
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/

**Scope**: User Story 1–3 實作；User Story 4（預覽／草稿）第一版不實作，無任務。  
**Task count**: 25 (T001–T022 含 T016a, T017a, T020a).

**Organization**: Tasks are grouped by user story to enable independent implementation and testing.

## Format: `[ID] [P?] [Story?] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (US1, US2, US3)
- Include exact file paths in descriptions

## Path Conventions

- Next.js App at repo root: `src/app/`, `src/components/`, `src/lib/`
- Admin UI: `src/app/(admin)/`, API: `src/app/api/admin/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Verify project structure and config for this feature

- [X] T001 Verify .gitignore and project structure per plan.md at repo root; add any missing ignore patterns for Next.js/TypeScript

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Shared conventions and UI that user stories depend on

**Checkpoint**: Foundation ready – user story implementation can begin

- [X] T002 [P] Add admin list pagination constant (e.g. DEFAULT_PAGE_SIZE=20) in src/lib/constants.ts or equivalent
- [X] T003 Verify Pagination component in src/components/ui/Pagination.tsx supports currentPage, totalPages, onPageChange for admin list use; extend if needed

---

## Phase 3: User Story 1 - 快速找到要改的內容 (Priority: P1) — MVP

**Goal**: 站長登入後能透過清楚導覽與搜尋／篩選快速找到要修改的節目、單集、留言或聯盟內容；列表分頁穩定載入。

**Independent Test**: 以站長身份登入後台，在 2 分鐘內從首頁導覽至「編輯某一集節目」或「審核某則留言」的頁面，並完成一筆修改。

### Implementation for User Story 1

- [X] T004 [US1] Add pagination (page, pageSize) to episode list service: extend getAllEpisodes in src/lib/services/admin/episodes.ts to accept page, pageSize and return { items, total }
- [X] T005 [US1] Add pagination (page, pageSize) to comment list: extend getCommentsByStatus in src/lib/services/admin/comments.ts to return { items, total }
- [X] T006 [US1] Add pagination to affiliates list: extend API or service for src/app/api/admin/affiliates/route.ts (GET) with page, pageSize and total in response
- [X] T007 [US1] Update episode list page to use paginated data and Pagination UI in src/app/(admin)/episodes/page.tsx
- [X] T008 [US1] Update comment list page to use paginated data and Pagination UI in src/app/(admin)/comments/page.tsx
- [X] T009 [US1] Update affiliate list page to use pagination and Pagination UI in src/app/(admin)/affiliates/page.tsx
- [X] T010 [US1] Add search or filter (e.g. by title, is_published) to episode list in src/app/(admin)/episodes/page.tsx or src/components/admin/EpisodeTable.tsx
- [X] T011 [US1] Ensure admin nav labels match content: if "節目管理" links to episodes, either rename to "單集管理" or add tooltip/clarification that it manages episodes (單集) in src/app/(admin)/layout.tsx

**Checkpoint**: User Story 1 is testable – from admin home, find and open edit in ≤2 min with pagination working

---

## Phase 4: User Story 2 - 編輯過程簡單、有回饋 (Priority: P1)

**Goal**: 表單必填／選填標示、儲存成功／失敗明確回饋、驗證錯誤指向欄位、離開前未儲存提示、遠端更新衝突時提示並提供選項。

**Independent Test**: 在後台編輯一筆單集（如標題或 AI 大綱），提交後 1 分鐘內確認儲存結果並在前台看到更新；離開未儲存時有提示；若有更新版本則顯示選項（重新載入／覆蓋／放棄）。

### Implementation for User Story 2

- [X] T012 [US2] Ensure EpisodeForm and AffiliateForm show required/optional labels and per-field validation errors in src/components/admin/EpisodeForm.tsx and src/components/admin/AffiliateForm.tsx
- [X] T013 [US2] Ensure save success shows explicit message (e.g. toast) and option to return to list or continue editing in src/components/admin/EpisodeForm.tsx and AffiliateForm
- [X] T014 [US2] Add unsaved-change prompt: beforeunload and in-app navigation (e.g. Link/router) when form is dirty in src/components/admin/EpisodeForm.tsx and AffiliateForm.tsx
- [X] T015 [US2] Add conflict detection: PATCH sends updated_at; API returns 409 when DB updated_at is newer in src/app/api/admin/episodes/[id]/route.ts (and optionally affiliates); handle 409 in EpisodeForm
- [X] T016 [US2] In EpisodeForm (and AffiliateForm if applicable), on 409 show "此筆內容已有更新版本" and options: 重新載入、覆蓋、放棄
- [X] T016a [US2] Add conflict detection for affiliate edit: PATCH sends updated_at; API returns 409 when DB updated_at is newer in src/app/api/admin/affiliates/[id]/route.ts; handle 409 in src/components/admin/AffiliateForm.tsx
- [X] T017 [US2] Long text fields: add max length or display limit for ai_summary, host_notes in src/components/admin/EpisodeForm.tsx per data-model.md
- [X] T017a [US2] Handle deleted show edge case: in EpisodeForm, check if show_id references existing show; if not, display "所屬節目已刪除" and guide admin to select another show in src/components/admin/EpisodeForm.tsx

**Checkpoint**: User Story 2 is testable – edit, save, see feedback; leave with unsaved changes and see prompt; conflict flow when updated_at newer

---

## Phase 5: User Story 3 - 留言審核與內容狀態一目了然 (Priority: P2)

**Goal**: 留言依狀態篩選與單筆審核；單集列表顯示上架狀態並一鍵切換；前台反映變更。

**Independent Test**: 在後台篩選「待審留言」，對一則執行通過或隱藏並確認列表更新；在單集列表將一筆改為上架或下架，重新整理前台後確認顯示與否。

### Implementation for User Story 3

- [X] T018 [US3] Ensure comment list filter by status (pending/approved/hidden/spam) and single-row actions (通過、隱藏、標記垃圾) in src/app/(admin)/comments/page.tsx and src/components/admin/CommentModerationTable.tsx
- [X] T019 [US3] Show is_published in episode list and add one-click toggle in src/components/admin/EpisodeTable.tsx
- [X] T020 [US3] Ensure episode is_published toggle calls PATCH and list/UI updates; verify front-end reflects after refresh in src/components/admin/EpisodeTable.tsx and API
- [X] T020a [US3] Verify FR-007: after toggling episode is_published, confirm public front-end reflects visibility correctly (episode visible/hidden per is_published) in manual test or E2E

**Checkpoint**: User Story 3 is testable – filter comments, approve/hide; toggle episode published and confirm on front-end

---

## Phase 6: Polish & Cross-Cutting Concerns

**Purpose**: Validation and cleanup

- [X] T021 [P] Run quickstart.md validation and update docs if needed in specs/003-admin-content-editing/quickstart.md
- [X] T022 Fix TypeScript/lint errors in admin area (e.g. parameter type in src/app/(admin)/affiliates/page.tsx if reported)

---

## Dependencies & Execution Order

### Phase Dependencies

- **Phase 1 (Setup)**: No dependencies – start immediately
- **Phase 2 (Foundational)**: Depends on Phase 1 – BLOCKS user stories
- **Phase 3 (US1)**: Depends on Phase 2 – MVP
- **Phase 4 (US2)**: Depends on Phase 2; can overlap with US1 (different files)
- **Phase 5 (US3)**: Depends on Phase 2; can follow US1/US2
- **Phase 6 (Polish)**: After desired user stories are done

### User Story Dependencies

- **US1 (P1)**: After Phase 2 – no dependency on US2/US3
- **US2 (P1)**: After Phase 2 – no dependency on US1/US3
- **US3 (P2)**: After Phase 2 – builds on existing comment/episode UI

### Within Each User Story

- T004→T007 (episodes pagination); T005→T008 (comments); T006→T009 (affiliates) – implement service/API then page
- T015→T016 (episodes conflict: API then form); T016a (affiliates conflict: API then AffiliateForm)

### Parallel Opportunities

- T002, T003 can run in parallel (Phase 2)
- T004, T005, T006 can run in parallel (different services/API)
- T012, T013 can run in parallel; T014, T015, T016, T016a, T017, T017a can be ordered within US2
- T018, T019, T020, T020a can be partially parallel (different components)
- T021, T022 can run in parallel (Phase 6)

---

## Implementation Strategy

### MVP First (User Story 1)

1. Complete Phase 1 + Phase 2
2. Complete Phase 3 (US1): pagination + search/filter + nav
3. Validate: 2 min from admin home to edit one episode or moderate one comment
4. Deploy/demo if ready

### Incremental Delivery

1. Phase 1 + 2 → foundation
2. Add US1 → test independently (MVP)
3. Add US2 → test edit feedback, unsaved prompt, conflict
4. Add US3 → test comment filter and episode published toggle
5. Phase 6 → quickstart validation and lint fix

### Notes

- [P] = different files, no dependencies
- [USn] maps task to user story for traceability
- User Story 4 (預覽/草稿) not in scope for first release
- Commit after each task or logical group; stop at checkpoints to validate story independently
