# HANDOFF（更新：2026-10-22 22:40）

## 任務

威爾看了呱吉的「新資料庫」（https://sear.newfolderla.com/ ），想參考它讓讀者投稿校正逐字稿、用貢獻排名給榮譽。

## 進度

- ✅ 已完成：研究與現況盤點，存檔在 `docs/research/2026-10-07-讀者投稿校正與貢獻排行.md`（commit `ccf1ddf`，已 push）。
- ⏸ 暫緩：功能本身。2026-10-07 威爾決定「先不做，研究存檔」。
- ✅ 已修並上線：權限漏洞 1 到 4。資料庫（migration 014、015）2026-10-22 套用；程式碼 PR #2、#3、#4 合併，2026-10-22 22:09 部署成功並實測。細節見下方「權限漏洞修補」一節。
- ⏸ 網站暫時下線（2026-10-22 22:35）：威爾決定等平台與套件的資安問題修好、更新版本後再重新上線。workers.dev 網址與版本預覽網址已關閉（實測回 404、Cloudflare 錯誤碼 1042），GitHub 自動部署已停用。Worker 本身、密鑰、Supabase 資料都保留。

## 等威爾處理的事

1. ~~恢復 Supabase 專案~~：2026-10-22 查到已恢復（`ACTIVE_HEALTHY`）。
2. **決定要不要連 Supabase 一起暫停**：網站關了，但資料庫仍可用公開金鑰從網路存取（靠 RLS 與 014、015 的 trigger 保護）。要暫停就到 Supabase 後台操作（之前 INACTIVE 就是暫停狀態）。
3. **決定「發現 5」要不要修**（見下方）：要改留言發布流程，會影響讀者發留言。
4. **migration 013 沒有登記在正式庫**：`supabase_migrations.schema_migrations` 只記到 012，然後是這次的 014、015。013 是把節目分類匯入成標籤的資料搬移，要確認當初有沒有手動跑過；別用 `supabase db push` 直接推，它會補跑 013。
5. **專案根目錄的 `.playwright-mcp/`**（8 個未追蹤檔，2026-10-07 研究工具自動產生）。要嘛你自己刪，要嘛叫我把它加進 `.gitignore`。
6. **主目錄更新一次**：主目錄的 master 還停在舊版本。跑 `git pull --ff-only` 後再跑 `npm install`（這次新增了 vitest、PGlite、esbuild、vite 等開發依賴），主目錄才能跑 `npm test`。
7. **重新上線時**（照順序）：
   1. 更新套件到修好資安問題的版本（next、@opennextjs/cloudflare、wrangler、@supabase/*），注意下方「部署的坑」。
   2. 跑 `npm test`、`npm run lint`，再用 `git archive` 匯出到 repo 外的乾淨資料夾跑 `npm ci` 和 `npx @opennextjs/cloudflare build`。
   3. `wrangler.toml` 的 `workers_dev`、`preview_urls` 改回 true，跑 `npx wrangler triggers deploy`。
   4. 重新啟用自動部署：`gh workflow enable "Deploy to Cloudflare Workers"`，或到 GitHub 的 Actions 頁面啟用。
   5. 用管理員身分登入，從右上角選單點「Admin Dashboard」，審核或隱藏一則留言。下線前只驗過未登入的情況，管理員流程只在測試裡驗過。

## 決策紀錄

- 2026-10-07：讀者投稿校正功能先不做，研究存檔。之後要做，從研究文件第 5 節的分階段方案開始，第 6 節的前置條件（權限漏洞、Supabase 恢復）要先處理。
- 2026-10-13：權限漏洞修補暫停，等威爾有空再開。
- 2026-10-22 22:35：威爾決定網站暫時下線（「最近資安問題爆太多了」），選擇「關掉網址＋停用自動部署」。重新上線步驟見「等威爾處理的事」第 7 項。
- 2026-10-22：威爾要求合併 PR #2、#3；合併後部署失敗（找不到 esbuild），威爾同意修正並直接合併 PR #4，部署恢復。
- 2026-10-22：威爾同意把 014、015 套用到正式庫，採用針對性備份（profiles、comments 全部資料＋規則），備份在主目錄 `tmp/db-backup-20261022-before-014-015/`，同資料夾有 `rollback-014-015.sql`。

## 下一步

- 網站暫時下線中。重新上線前，威爾決定「發現 5」要不要修、要不要啟動投稿校正的第 1 階段。啟動時用 `/speckit.specify` 寫規格。
- 全部處理完，提醒威爾可以清掉這份 HANDOFF。

---

## 權限漏洞修補（2026-10-22 完成並上線）

### 完成狀態

| 漏洞 | 修法 | 測試 | 狀態 |
|---|---|---|---|
| 1 會員能改自己的 is_admin | migration 014 trigger | `tests/db/profiles-is-admin.test.ts` | ✅ 正式庫已套用 |
| 2 作者能改自己留言的 status | migration 015 trigger（只准改 content） | `tests/db/comments-moderation.test.ts` | ✅ 正式庫已套用 |
| 3 admin 留言 API 沒檢查管理員 | 兩支 route 補 401／403 | `tests/unit/admin-comments-api.test.ts` | ✅ 已部署 |
| 4 middleware 擋不到後台 | `src/lib/auth/admin-paths.ts`＋UserMenu 連結 | `tests/unit/admin-route-guard.test.ts` | ✅ 已部署 |

- 每個漏洞都先紅後綠，並做 3 到 7 輪突變測試，全部轉紅。`npm test` 共 46 條全過；`next build` 與 OpenNext 建置都成功。
- 正式庫驗證（唯讀）：兩個 trigger 已啟用、函式本體與 migration 檔逐字相同、資料筆數不變。
- 測試指令：`npm test`（vitest，資料庫測試用 PGlite，不連正式庫）。
- 正式網站實測（2026-10-22 部署後，未登入）：8 個後台網址都 307 導回首頁；兩支 admin 留言 API 都回 401；前台首頁、搜尋、最新都是 200。

### 部署的坑（升級 vitest 或 vite 前必讀）

- `@opennextjs/cloudflare` 會 import `esbuild` 卻沒宣告依賴，靠最上層的 esbuild 0.25.4（`@opennextjs/aws` 指定的版本）。所以 package.json 明確寫了 `esbuild: 0.25.4` 和 `vite: ^6.4.5`。vite 8 要求 esbuild 0.27 以上，會把 0.25.4 擠出最上層，部署就會失敗（PR #4）。
- 在 worktree 裡驗證建置會失真：worktree 放在主目錄的 `.claude/worktrees/` 底下，Node 找不到套件時會往上找到主目錄的 `node_modules`。要驗部署，就用 `git archive HEAD | tar -x -C <repo 外的資料夾>`，在那裡跑 `npm ci` 和 `npx @opennextjs/cloudflare build`。

### 以下是 2026-10-13 的研究結論（保留參考）

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
- 資料庫測試用 **PGlite**（`@electric-sql/pglite`，在 Node 裡跑的 Postgres）。已實測：`SET ROLE authenticated` 加 RLS 會正確擋別人的資料列；`pg_trgm`、`uuid-ossp` 擴充載得起來。做法：先跑一段 shim（建 auth schema、`auth.uid()` 讀 `request.jwt.claims`、anon／authenticated／service_role 角色、Supabase 預設授權），再跑 `001_initial_schema_integrated.sql` → `002_rls_policies_integrated.sql` → 新 migration。2026-10-22 已驗證：001／002 可以直接跑過，shim 只需補 `auth.role()`。
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
