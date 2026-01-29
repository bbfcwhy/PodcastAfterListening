# Tasks: Podcast 聽後回顧網站

**Input**: Design documents from `/specs/001-podcast-review-site/`
**Prerequisites**: plan.md, spec.md, research.md, data-model.md, contracts/api.yaml

**Tests**: Not explicitly requested in specification - test tasks are omitted.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3, US4, US5)
- Include exact file paths in descriptions

## Path Conventions

Based on plan.md, using Next.js App Router structure:
- Source: `src/app/`, `src/components/`, `src/lib/`, `src/types/`
- Tests: `tests/e2e/`, `tests/integration/`, `tests/unit/`

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Project initialization and basic structure

- [x] T001 Initialize Next.js 14+ project with TypeScript, Tailwind CSS, and App Router in project root
- [x] T002 Install core dependencies: @supabase/supabase-js, @supabase/ssr per quickstart.md
- [x] T003 [P] Initialize shadcn/ui and install base components (button, card, input, textarea, dialog, avatar, badge, skeleton, toast)
- [x] T004 [P] Configure ESLint and Prettier for TypeScript/React
- [x] T005 [P] Create environment variables template in .env.example for Supabase credentials
- [x] T006 Create directory structure per plan.md: src/app/, src/components/, src/lib/, src/types/, tests/

---

## Phase 2: Foundational (Blocking Prerequisites)

**Purpose**: Core infrastructure that MUST be complete before ANY user story can be implemented

**⚠️ CRITICAL**: No user story work can begin until this phase is complete

- [x] T007 Create Supabase client utilities in src/lib/supabase/client.ts (browser client) and src/lib/supabase/server.ts (server client)
- [x] T008 Create database migration SQL for all tables per data-model.md (shows, hosts, show_hosts, episodes, tags, episode_tags, comments, profiles, affiliate_contents, episode_affiliates, affiliate_clicks)
- [x] T009 [P] Create TypeScript types for all entities in src/types/database.ts based on data-model.md
- [x] T010 [P] Create base layout component in src/components/layout/MainLayout.tsx with header, footer, and AI disclaimer banner
- [x] T011 [P] Create common UI components: src/components/ui/Pagination.tsx, src/components/ui/EmptyState.tsx, src/components/ui/LoadingSpinner.tsx
- [x] T012 Configure Supabase Row Level Security (RLS) policies per data-model.md for all tables
- [x] T013 Create database seed data script in scripts/seed.sql with sample shows, hosts, and episodes for development
- [x] T014 [P] Create error boundary component in src/components/layout/ErrorBoundary.tsx for graceful error handling
- [x] T015 [P] Create AI disclaimer component in src/components/ui/AIDisclaimer.tsx with warning text from FR-008

**Checkpoint**: Foundation ready - user story implementation can now begin

---

## Phase 3: User Story 1 - 瀏覽 Podcast 內容 (Priority: P1) 🎯 MVP

**Goal**: 訪客可以在首頁看到最新單集列表和節目分類入口，並能導航至詳情頁

**Independent Test**: 訪問首頁確認最新單集列表和節目分類入口正確顯示，點擊可導航

### Implementation for User Story 1

- [x] T016 [P] [US1] Create Show service in src/lib/services/shows.ts with getShows(), getShowBySlug() functions using Supabase client
- [x] T017 [P] [US1] Create Episode service in src/lib/services/episodes.ts with getLatestEpisodes(), getEpisodesByShow() functions
- [x] T018 [US1] Create ShowCard component in src/components/shows/ShowCard.tsx displaying show cover, name, and episode count
- [x] T019 [US1] Create EpisodeCard component in src/components/episodes/EpisodeCard.tsx displaying episode title, show info, and published date
- [x] T020 [US1] Create ShowGrid component in src/components/shows/ShowGrid.tsx for displaying show categories section
- [x] T021 [US1] Create EpisodeList component in src/components/episodes/EpisodeList.tsx for displaying latest episodes with pagination
- [x] T022 [US1] Implement homepage in src/app/(public)/page.tsx with ISR (revalidate=3600), fetching latest episodes and show categories
- [x] T023 [US1] Implement show detail page in src/app/(public)/shows/[slug]/page.tsx listing all episodes for that show
- [x] T024 [US1] Add empty state handling in homepage and show pages per Edge Cases
- [x] T025 [US1] Add metadata (title, description, og:image) to homepage and show pages for SEO

**Checkpoint**: User Story 1 complete - visitors can browse shows and episodes on homepage

---

## Phase 4: User Story 2 - 查看單集節目詳情 (Priority: P1)

**Goal**: 訪客可以查看單集完整資訊，包含原始連結、主持人簡介、AI 大綱、業配內容、站長心得

**Independent Test**: 直接訪問單集頁面確認所有區塊正確顯示，原始連結可開啟新分頁

### Implementation for User Story 2

- [x] T026 [P] [US2] Extend Episode service in src/lib/services/episodes.ts with getEpisodeDetail() fetching full episode with show, hosts, and tags
- [x] T027 [P] [US2] Create Host service in src/lib/services/hosts.ts with getHostsByShow() function
- [x] T028 [US2] Create HostCard component in src/components/hosts/HostCard.tsx displaying host avatar, name, and bio
- [x] T029 [US2] Create EpisodeSummary component in src/components/episodes/EpisodeSummary.tsx for AI-generated summary section with AIDisclaimer
- [x] T030 [US2] Create SponsorshipSection component in src/components/episodes/SponsorshipSection.tsx for displaying sponsorship content with AIDisclaimer
- [x] T031 [US2] Create OwnerNotes component in src/components/episodes/OwnerNotes.tsx for displaying 站長心得 section
- [x] T032 [US2] Create OriginalLinkButton component in src/components/episodes/OriginalLinkButton.tsx opening link in new tab
- [x] T033 [US2] Implement episode detail page in src/app/(public)/episodes/[showSlug]/[episodeSlug]/page.tsx with ISR
- [x] T034 [US2] Add handling for empty AI content (顯示「內容準備中」) per Edge Cases
- [x] T035 [US2] Add structured metadata (JSON-LD, og:tags) to episode pages for SEO

**Checkpoint**: User Stories 1 & 2 complete - core content viewing functionality ready

---

## Phase 5: User Story 3 - 網友留言討論 (Priority: P2)

**Goal**: 訪客可以透過 OAuth 登入後在節目下方留言討論，留言經自動過濾後顯示

**Independent Test**: 登入後發表留言確認即時顯示，未登入時提示需要驗證

### Implementation for User Story 3

- [x] T036 [P] [US3] Configure Supabase Auth providers (Google, Facebook, GitHub) in Supabase Dashboard per research.md
- [x] T037 [P] [US3] Create auth utilities in src/lib/auth/index.ts with signIn(), signOut(), getCurrentUser() functions
- [x] T038 [US3] Create AuthProvider context in src/components/auth/AuthProvider.tsx wrapping app with session state
- [x] T039 [US3] Create LoginButton component in src/components/auth/LoginButton.tsx with OAuth provider selection
- [x] T040 [US3] Create UserAvatar component in src/components/auth/UserAvatar.tsx displaying logged-in user info
- [x] T041 [US3] Implement OAuth callback handler in src/app/api/auth/callback/route.ts
- [x] T042 [US3] Create Comment service in src/lib/services/comments.ts with getCommentsByEpisode(), createComment() functions
- [x] T043 [US3] Create spam filter utility in src/lib/spam-filter/index.ts implementing rule-based filtering per research.md
- [x] T044 [US3] Create CommentItem component in src/components/comments/CommentItem.tsx displaying single comment with user info
- [x] T045 [US3] Create CommentList component in src/components/comments/CommentList.tsx with pagination and loading states
- [x] T046 [US3] Create CommentForm component in src/components/comments/CommentForm.tsx with login prompt for unauthenticated users
- [x] T047 [US3] Create CommentSection component in src/components/comments/CommentSection.tsx combining list and form
- [x] T048 [US3] Integrate CommentSection into episode detail page src/app/(public)/episodes/[showSlug]/[episodeSlug]/page.tsx
- [x] T049 [US3] Implement POST /api/comments/[episodeId]/route.ts for creating comments with spam check and rate limiting
- [x] T050 [US3] Add rate limiting (3 comments/minute per user) in comment creation API

**Checkpoint**: User Stories 1, 2 & 3 complete - full public-facing experience ready

---

## Phase 6: User Story 5 - 站長後台內容管理 (Priority: P2)

**Goal**: 站長可以透過後台管理節目內容和審核留言

**Independent Test**: 以站長身份登入後台，新增節目並確認前台顯示，審核留言確認狀態更新

### Implementation for User Story 5

- [x] T051 [P] [US5] Create admin auth middleware in src/middleware.ts checking is_admin flag for /admin routes
- [x] T052 [P] [US5] Create admin layout in src/app/(admin)/layout.tsx with sidebar navigation
- [x] T053 [US5] Create admin dashboard page in src/app/(admin)/dashboard/page.tsx with stats overview (episode count, comment count)
- [x] T054 [US5] Create admin Episode service in src/lib/services/admin/episodes.ts with CRUD operations including unpublished episodes
- [x] T055 [US5] Create EpisodeTable component in src/components/admin/EpisodeTable.tsx with edit/delete actions
- [x] T056 [US5] Create EpisodeForm component in src/components/admin/EpisodeForm.tsx for create/edit with all fields
- [x] T057 [US5] Implement admin episodes list page in src/app/(admin)/episodes/page.tsx
- [x] T058 [US5] Implement admin episode create page in src/app/(admin)/episodes/new/page.tsx
- [x] T059 [US5] Implement admin episode edit page in src/app/(admin)/episodes/[id]/edit/page.tsx
- [x] T060 [US5] Implement DELETE /api/admin/episodes/[id]/route.ts for episode deletion
- [x] T061 [US5] Create admin Comment service in src/lib/services/admin/comments.ts for fetching pending comments
- [x] T062 [US5] Create CommentModerationTable component in src/components/admin/CommentModerationTable.tsx with approve/hide/spam actions
- [x] T063 [US5] Implement admin comments page in src/app/(admin)/comments/page.tsx with status filter tabs
- [x] T064 [US5] Implement PATCH /api/admin/comments/[id]/route.ts for updating comment status

**Checkpoint**: User Stories 1, 2, 3 & 5 complete - full content management ready

---

## Phase 7: User Story 4 - 聯盟行銷內容展示 (Priority: P3)

**Goal**: 在節目詳情頁展示聯盟行銷內容，追蹤點擊並重導向

**Independent Test**: 確認聯盟行銷區塊顯示「推廣」標籤，點擊後正確追蹤並重導向

### Implementation for User Story 4

- [x] T065 [P] [US4] Create Affiliate service in src/lib/services/affiliates.ts with getAffiliatesByEpisode(), recordClick() functions
- [x] T066 [US4] Create AffiliateCard component in src/components/affiliates/AffiliateCard.tsx with 「推廣」badge and tracking link
- [x] T067 [US4] Create AffiliateSection component in src/components/affiliates/AffiliateSection.tsx for displaying related affiliates
- [x] T068 [US4] Integrate AffiliateSection into episode detail page src/app/(public)/episodes/[showSlug]/[episodeSlug]/page.tsx
- [x] T069 [US4] Implement GET /api/affiliate/redirect/[affiliateId]/route.ts recording click and returning redirect
- [x] T070 [US4] Add affiliate management UI in admin (src/app/(admin)/affiliates/) - basic CRUD for affiliate content (list, create, edit, delete)

**Checkpoint**: All user stories complete

---

## Phase 8: User Story 6 - 搜尋節目內容 (Priority: P2)

**Goal**: 實作進階搜尋功能，提升內容發現性

**Independent Test**: 使用關鍵字搜尋並套用篩選條件，確認結果正確

### Implementation for User Story 6

- [x] T071 [P] [US6] Create Search service in src/lib/services/search.ts with searchEpisodes() using PostgreSQL FTS
- [x] T072 [P] [US6] Create database function search_episodes() in Supabase per data-model.md
- [x] T073 [US6] Create SearchBar component in src/components/search/SearchBar.tsx with input and submit
- [x] T074 [US6] Create SearchFilters component in src/components/search/SearchFilters.tsx with show, date range, tag filters
- [x] T075 [US6] Create SearchResults component in src/components/search/SearchResults.tsx displaying episode cards
- [x] T076 [US6] Implement search page in src/app/(public)/search/page.tsx with query params handling
- [x] T077 [US6] Implement GET /api/search/route.ts with full-text search and filter support
- [x] T078 [US6] Add SearchBar to header in MainLayout.tsx for global access

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final improvements affecting multiple user stories

- [x] T079 [P] Implement ISR caching strategy per research.md - configure revalidate times for all public pages
- [x] T080 [P] Implement SWR client-side caching for comments and search results
- [x] T081 [P] Add graceful degradation when Supabase unavailable per Edge Cases - show cached content with warning banner
- [x] T082 [P] Implement infinite scroll or pagination for episode lists per Edge Cases
- [x] T083 Add mobile responsive styles to all components
- [x] T084 [P] Configure Vercel deployment settings and environment variables
- [x] T085 [P] Add analytics tracking (page views, basic events) for future optimization
- [x] T086 Run full manual test per quickstart.md validation steps
- [x] T087 Performance audit: verify homepage loads < 3 seconds, episode page < 2 seconds per SC-001, SC-002
- [x] T088 [P] Success Criteria validation - SC-003: Create E2E test in tests/e2e/comment-success-rate.spec.ts verifying 90% first-attempt comment success rate
- [x] T089 [P] Success Criteria validation - SC-004: Create E2E test in tests/e2e/admin-episode-creation.spec.ts verifying admin can create episode within 2 minutes
- [x] T090 [P] Success Criteria validation - SC-005: Create load test script in tests/load/concurrent-users.ts simulating 500 concurrent users and verify no performance degradation
- [x] T091 [P] Success Criteria validation - SC-006: Create E2E test in tests/e2e/ai-disclaimer-visibility.spec.ts verifying AI disclaimer visible on 100% of episode pages
- [x] T092 [P] Success Criteria validation - SC-007: Create integration test in tests/integration/affiliate-tracking.spec.ts verifying 99% click tracking accuracy

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies - can start immediately
- **Foundational (Phase 2)**: Depends on Setup completion - BLOCKS all user stories
- **User Stories (Phase 3+)**: All depend on Foundational phase completion
  - US1 (P1): No dependencies on other stories
  - US2 (P1): No dependencies on other stories (can parallel with US1)
  - US3 (P2): No dependencies on US1/US2 for core functionality
  - US5 (P2): No dependencies on US1/US2/US3
  - US4 (P3): No dependencies on other stories
- **Search (Phase 8)**: Depends on US1 (needs episode/show data)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

| Story | Priority | Can Start After | Integrates With |
|-------|----------|-----------------|-----------------|
| US1 - 瀏覽內容 | P1 | Phase 2 | None |
| US2 - 單集詳情 | P1 | Phase 2 | US1 (navigation) |
| US3 - 留言討論 | P2 | Phase 2 | US2 (episode page) |
| US5 - 後台管理 | P2 | Phase 2 | None |
| US4 - 聯盟行銷 | P3 | Phase 2 | US2 (episode page) |

### Within Each User Story

- Models/Services before Components
- Components before Pages
- Pages before API Routes (if applicable)
- Core implementation before integration

### Parallel Opportunities

- T003, T004, T005 in Setup phase
- T009, T010, T011, T014, T015 in Foundational phase
- T016, T017 (services) in US1
- T026, T027 (services) in US2
- T036, T037 (auth setup) in US3
- T051, T052 (admin foundation) in US5
- T071, T072 (search foundation) in Search phase
- T079-T085, T088-T092 in Polish phase

---

## Parallel Example: User Story 1

```bash
# Launch services in parallel:
Task: "Create Show service in src/lib/services/shows.ts"
Task: "Create Episode service in src/lib/services/episodes.ts"

# Then launch components (depends on services):
Task: "Create ShowCard component"
Task: "Create EpisodeCard component"
```

---

## Implementation Strategy

### MVP First (User Stories 1 + 2 Only)

1. Complete Phase 1: Setup
2. Complete Phase 2: Foundational (CRITICAL - blocks all stories)
3. Complete Phase 3: User Story 1 (瀏覽內容)
4. Complete Phase 4: User Story 2 (單集詳情)
5. **STOP and VALIDATE**: Test US1 + US2 independently
6. Deploy to Vercel as MVP - visitors can browse and view content

### Incremental Delivery

1. Setup + Foundational → Foundation ready
2. Add US1 + US2 → Core content viewing (MVP!)
3. Add US3 → Community engagement via comments
4. Add US5 → Admin content management
5. Add US4 → Monetization via affiliates
6. Add Search → Enhanced discoverability
7. Polish → Performance and UX refinements

### Solo Developer Strategy

Since this is a single-person project:
1. Work through stories sequentially (P1 → P2 → P3)
2. Leverage [P] tasks within each story when possible
3. Commit frequently, deploy after each story completion
4. Use AI tools to accelerate development per project constraints

---

## Summary

| Phase | Story | Task Count | Parallel Tasks |
|-------|-------|------------|----------------|
| Phase 1 | Setup | 6 | 3 |
| Phase 2 | Foundational | 9 | 5 |
| Phase 3 | US1 (P1) | 10 | 2 |
| Phase 4 | US2 (P1) | 10 | 2 |
| Phase 5 | US3 (P2) | 15 | 2 |
| Phase 6 | US5 (P2) | 14 | 2 |
| Phase 7 | US4 (P3) | 6 | 1 |
| Phase 8 | Search | 8 | 2 |
| Phase 9 | Polish | 14 | 10 |
| **Total** | - | **92** | **29** |

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- MVP = Phase 1 + 2 + 3 + 4 (Setup + Foundation + US1 + US2)
