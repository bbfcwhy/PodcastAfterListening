# HANDOFF（更新：2026-10-13 00:50）

## 任務

威爾看了呱吉的「新資料庫」（https://sear.newfolderla.com/ ），想參考它讓讀者投稿校正逐字稿、用貢獻排名給榮譽。

## 進度

- ✅ 已完成：研究與現況盤點，存檔在 `docs/research/2026-10-07-讀者投稿校正與貢獻排行.md`（commit `ccf1ddf`，已 push）。
- ⏸ 暫緩：功能本身。2026-10-07 威爾決定「先不做，研究存檔」。
- ⏸ 暫停：修補權限漏洞。2026-10-13 00:41 威爾決定先停，等有空再修。只做完研究，沒改程式碼、沒碰資料庫。細節見下方「權限漏洞修補」一節。

## 等威爾處理的事

1. **恢復 Supabase 專案**（ref `nkgxkahzhqiasisclvzl`）。2026-10-07 與 2026-10-13 兩次查都是 `INACTIVE`，SQL 查詢連線逾時。正式網站可能讀不到資料。要到 Supabase 後台恢復。
2. **有空時重開權限修補任務**（見下方一節）。程式碼與測試可以先在本機做；套用到正式資料庫前要等 Supabase 恢復，而且會先給你看 SQL，要你同意。
3. **決定「發現 5」要不要一起修**（見下方）：要改留言發布流程，會影響讀者發留言。
4. **專案根目錄的 `.playwright-mcp/`**（8 個未追蹤檔，2026-10-07 研究工具自動產生）。要嘛你自己刪，要嘛叫我把它加進 `.gitignore`。

## 決策紀錄

- 2026-10-07：讀者投稿校正功能先不做，研究存檔。之後要做，從研究文件第 5 節的分階段方案開始，第 6 節的前置條件（權限漏洞、Supabase 恢復）要先處理。
- 2026-10-13：權限漏洞修補暫停，等威爾有空再開。

## 下一步

- 等第 1、2 項完成後，威爾決定要不要啟動投稿校正的第 1 階段。啟動時用 `/speckit.specify` 寫規格。
- 全部處理完，提醒威爾可以清掉這份 HANDOFF。

---

## 權限漏洞修補（2026-10-13 暫停，研究結論）

### 目標

讓「誰是管理員」「誰能核准內容」只能由管理員決定。這是投稿校正功能的前置條件：審核靠 `profiles.is_admin`，會員若能自己升管理員或自己核准，就能灌排行榜。

### 原本的 4 個漏洞（2026-10-07 讀 repo 查到，正式資料庫尚未驗證）

1. `supabase/migrations/002_rls_policies_integrated.sql:185-189` 的 `profiles_update_owner_or_admin`：會員能改自己 profile 的任何欄位，包含 `is_admin`。
2. 同檔 `:168-172` 的 `comments_update_owner_or_admin`：留言作者能改自己留言的 `status`，例如把 hidden／spam 改回 approved。
3. `src/app/api/admin/comments/[id]/route.ts` 沒有檢查管理員，只靠 RLS。
4. `src/middleware.ts:47` 只擋 `/admin` 開頭，但後台頁面在 `src/app/(admin)/`，實際網址是 `/dashboard` 等，擋不到；`src/components/navbar/UserMenu.tsx:80` 的 `/admin` 連結指向不存在的頁面。

### 2026-10-13 查證後的新結論

- **漏洞 1 的修法陷阱（已實測）**：只下 `REVOKE UPDATE (is_admin) ON profiles FROM authenticated` 擋不住。Supabase 預設把 public 的表整張授權給 anon／authenticated，欄位層級 REVOKE 拿不掉整張表的權限。用 PGlite 實測：只下欄位 REVOKE，會員仍成功把 `is_admin` 改成 true；拿掉整張表的 UPDATE 才會被擋。
- **漏洞 1 建議修法**：profiles 加 `BEFORE INSERT OR UPDATE` trigger。呼叫者是 anon／authenticated 且不是管理員時，`is_admin` 有變動就丟 42501 錯誤。好處：管理員仍能從 app 指派管理員；service_role 與 Supabase SQL editor 不受影響。trigger 函式用 SECURITY INVOKER，靠 `current_user` 判斷呼叫者角色。
- **RLS 細節（讀 policy 得出）**：UPDATE policy 沒寫 WITH CHECK 時，Postgres 拿 USING 條件當 WITH CHECK。所以會員改不了 `profiles.id` 和 `comments.user_id`。實際可被濫改的是 `is_admin`、`status`、`spam_score`、`episode_id`、`created_at`。
- **漏洞 2 建議修法**：comments 加 `BEFORE UPDATE` trigger，非管理員只准改 `content`。寫法：`to_jsonb(NEW) - 'content' - 'updated_at'` 與 `to_jsonb(OLD) - ...` 比較，不同就擋。app 目前沒有「作者編輯留言」功能（`src/lib/services/comments.ts` 只有 insert），所以這樣改不會壞掉現有功能。
- **漏洞 3 範圍要擴大**：`src/app/api/admin/comments/route.ts`（GET 留言列表）也沒有管理員檢查。RLS 讓非管理員只看得到 approved 和自己的留言，沒有外洩，但寫法不一致，建議一起補。檢查寫法照 `src/app/api/admin/episodes/[id]/route.ts:17-34`（inline，跟其他 admin API 一致）。其他 admin API 都有檢查；`shows/[id]` 的 DELETE 是回 501 的空殼，不用管。
- **漏洞 4 的後台實際網址**（middleware 要逐一擋）：`/dashboard`、`/comments`、`/affiliates` 底下全部、`/episodes`（只有列表本身）、`/episodes/new`、`/episodes/edit/[id]`、`/shows`（只有列表本身）、`/shows/new`、`/shows/[slug]/edit`、`/tags`（只有列表本身）、`/tags/new`、`/tags/[slug]/edit`。前台也有 `/episodes/[showSlug]/[episodeSlug]`、`/shows/[slug]`、`/tags/[slug]`，所以**不能**整個前綴擋。建議比對前先 `decodeURIComponent`，防 `%64ashboard` 這類編碼繞路。
- **防回歸測試建議**：列舉 `src/app/(admin)/**/page.tsx` 轉成網址，斷言 middleware 都會擋；列舉 `(public)` 的頁面，斷言都不擋。以後新增後台頁面忘了登記，測試會紅。
- UserMenu 的 `/admin` 改成 `/dashboard`。
- 後台頁面都沒有用 `createServiceClient`（只有 `src/app/api/auth/callback/route.ts` 用），所以非管理員就算看到後台頁面，也讀不到 RLS 以外的資料。

### 發現 5（不在原 4 項內，要威爾決定）

新增留言時就能直接是 approved。`createComment`（`src/lib/services/comments.ts:27-53`）在 app 端依垃圾分數決定狀態，分數 ≤ 0.3 直接 approved，然後用會員自己的身分寫入。INSERT policy（`002_rls_policies_integrated.sql:164-166`）只檢查 `auth.uid() IS NOT NULL`。所以有人直接打 Supabase API，就能新增一則 approved 的垃圾留言，跳過垃圾檢查，還能把 `user_id` 填成別人。修法要改留言發布流程（改用 service client 寫入，或在資料庫用 trigger 決定狀態），會動到讀者發留言，所以要威爾拍板。另一個相關的洞：留言 approved 後，作者再改內容不會重新審核。

### 測試工具（已決定方向）

- 本機沒有 psql、postgres、supabase CLI；Docker 有裝但沒開。
- 資料庫測試用 **PGlite**（`@electric-sql/pglite`，在 Node 裡跑的 Postgres）。已實測：`SET ROLE authenticated` 加 RLS 會正確擋別人的資料列；`pg_trgm`、`uuid-ossp` 擴充載得起來。做法：先跑一段 shim（建 auth schema、`auth.uid()` 讀 `request.jwt.claims`、anon／authenticated／service_role 角色、Supabase 預設授權），再跑 `001_initial_schema_integrated.sql` → `002_rls_policies_integrated.sql` → 新 migration。⚠️ 待驗證：001／002 能不能在 PGlite 上直接跑過。
- App 端（admin API、middleware）用 **vitest**，用 `vi.mock` 模擬 supabase client。
- 附帶發現：`tests/unit/library-actions.test.ts` 是 Jest 寫法，但專案沒裝 jest，這支測試目前跑不起來。不在本任務範圍。

### 邊界（重開時照舊）

- TDD：每個漏洞先寫會紅的測試，修完轉綠。
- migration 只擴張不收縮，不 DROP、不 UPDATE 既有資料列。新編號從 014 起，開工時再 `ls supabase/migrations/` 確認。
- 套用到正式資料庫前：先備份、先給威爾看 SQL、取得同意。Supabase 恢復後第一步：唯讀查 `pg_policies` 和 `information_schema.column_privileges`，確認正式庫跟 migration 檔一致。存取權杖：`security find-generic-password -s "Supabase CLI" -w`，去掉 `go-keyring-base64:` 前綴後 base64 decode；Management API 是 `https://api.supabase.com/v1/projects/{ref}/database/query`。
- 從 master 開新分支。主目錄有別人留下的未提交檔案（n8n/*.json、.agents/、.cursor/ 等），不要 add。
- 不要 git push，除非威爾明確同意。

### 死路（不要再走）

- 只下欄位層級的 REVOKE 修漏洞 1（上面已實測擋不住）。
- middleware 用整個 `/episodes`、`/shows`、`/tags` 前綴擋（會擋掉前台頁面）。
