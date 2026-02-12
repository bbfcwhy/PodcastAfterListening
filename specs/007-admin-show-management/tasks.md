# Tasks: Admin Show Management

**Spec**: `specs/007-admin-show-management/spec.md`
**Plan**: `specs/007-admin-show-management/plan.md`

## Phase 1: 資料庫與型別 (Database & Types)

- [x] **DB Migration**: Create `supabase/migrations/007_add_show_position.sql` (or append to `policies.sql` for manual run) adding `position` column and initializing it based on `created_at`. <!-- id: 1 -->
- [x] **Type Definition**: Update `src/types/database.ts` to include `position` in `Show` table definition. <!-- id: 2 -->

## Phase 2: Server Actions (Backend Logic)

- [x] **Fetch Logic**: Modify/Create `src/lib/shows/actions.ts` - `getAdminShows` to support `page`, `perPage`, `sort` (custom/date/name), and `filter` (query/category). <!-- id: 3 -->
- [x] **Update Logic**: Add `updateShowOrder` action in `src/lib/shows/actions.ts` to batch update show positions. Ensure Admin check. <!-- id: 4 -->

## Phase 3: 前端介面 (UI Components)

- [x] **Toolbar**: Create `src/components/admin/shows/AdminShowToolbar.tsx` with Search input, Category select, Sort select, and PerPage select. <!-- id: 5 -->
- [x] **Sortable Row**: Create `src/components/admin/shows/SortableShowRow.tsx` wrapping the show row with `@dnd-kit` sortable logic. <!-- id: 6 -->
- [x] **Drag & Drop List**: Update `src/components/admin/shows/ShowList.tsx` (or equivalent) to use `DndContext` and `SortableContext`. Implement `onDragEnd` to call `updateShowOrder`. <!-- id: 7 -->
- [x] **Integration**: Integrate `AdminShowToolbar` and updated `ShowList` into the Admin Shows page (`src/app/admin/shows/page.tsx` or similar). <!-- id: 8 -->

## Phase 4: 公開介面與驗證 (Public & Verification)

- [x] **Sidebar**: Update `src/components/layout/Sidebar.tsx` (actually `src/lib/services/shows.ts`) to fetch shows ordered by `position`. <!-- id: 9 -->
- [x] **Manual Verification**: Verify Search, Filter, Pagination, Sorting, and Drag-and-Drop (including restriction logic). <!-- id: 10 -->
- [x] **Documentation**: Update `specs/007-admin-show-management/walkthrough.md` with results. <!-- id: 11 -->
