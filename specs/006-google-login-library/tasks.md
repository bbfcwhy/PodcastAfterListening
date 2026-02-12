# Tasks: Google Login & Library

**Spec**: `specs/006-google-login-library/spec.md`
**Plan**: `specs/006-google-login-library/plan.md`

## Phase 1: 資料庫與型別定義 (Database & Types)

- [x] **DB Schema**: Update `src/types/database.ts` adding `display_name`, `avatar_url` to `profiles` and defining `library_items` table via migration (or SQL/Supabase Dashboard simulation). <!-- id: 1 -->
- [x] **RLS Policies**: Document RLS policies for `profiles` and `library_items` in a new file `supabase/policies.sql` (for reference/execution). <!-- id: 2 -->
- [x] **Type Update**: Ensure `src/types/database.ts` reflects the new schema structure. <!-- id: 3 -->

## Phase 2: 認證流程優化 (Auth & User Sync)

- [x] **Auth Callback**: Modify `src/app/auth/callback/route.ts` to sync Google `full_name` and `avatar_url` to `profiles` on login. <!-- id: 4 -->
- [x] **Admin Check**: Implement `isAdmin` server-side utility in `src/lib/auth/admin.ts` using `process.env.ADMIN_EMAILS`. <!-- id: 5 -->
- [x] **Context Provider**: Update `UserMenu.tsx` to display the user's avatar and name from the DB/Session. <!-- id: 6 -->

## Phase 3: Library 功能實作 (Library Feature)

- [x] **Server Actions**: Create `src/lib/library/actions.ts` with `addToLibrary`, `removeFromLibrary`, `updateLibraryOrder`. <!-- id: 7 -->
- [x] **Action Tests**: Create unit/integration tests for actions in `tests/unit/library-actions.test.ts`. <!-- id: 8 -->
- [x] **UI Component**: Create `AddToLibraryButton.tsx` in `src/components/library/`. <!-- id: 9 -->
- [x] **UI Component**: Create `LibraryList.tsx` in `src/components/library/` with sorting support. <!-- id: 10 -->
- [x] **Page**: Create protected page `src/app/library/page.tsx` listing user's items. <!-- id: 11 -->

## Phase 4: 驗證與收尾 (Verification)

- [x] **Manual Verification**: Run through the Login -> Admin Check -> Library Add/Remove flows. <!-- id: 12 -->
- [x] **Documentation**: Update `specs/006-google-login-library/walkthrough.md` with screenshots and verification results. <!-- id: 13 -->
- [x] **Merge**: Create Pull Request for `006-google-login-library`. <!-- id: 14 -->
