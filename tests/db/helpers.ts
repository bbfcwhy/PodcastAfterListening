import { readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { PGlite } from "@electric-sql/pglite";
import { pg_trgm } from "@electric-sql/pglite/contrib/pg_trgm";
import { uuid_ossp } from "@electric-sql/pglite/contrib/uuid_ossp";

const ROOT = fileURLToPath(new URL("../..", import.meta.url));

// profiles、comments 的表結構與 RLS 規則來自這幾支 migration。
// 2026-10-22 已對過正式庫的 pg_policies 與欄位，001、002 的內容一致。
const MIGRATIONS = [
  "001_initial_schema_integrated.sql",
  "002_rls_policies_integrated.sql",
  "014_guard_profiles_is_admin.sql",
];

export const MEMBER_ID = "00000000-0000-0000-0000-00000000000a";
export const OTHER_MEMBER_ID = "00000000-0000-0000-0000-00000000000b";
export const ADMIN_ID = "00000000-0000-0000-0000-0000000000ad";
export const EPISODE_ID = "00000000-0000-0000-0000-0000000000e1";
export const MEMBER_COMMENT_ID = "00000000-0000-0000-0000-0000000000c1";

export type ApiRole = "anon" | "authenticated" | "service_role";

export async function createTestDb(): Promise<PGlite> {
  const db = new PGlite({ extensions: { pg_trgm, uuid_ossp } });
  await db.exec(readFileSync(path.join(ROOT, "tests/db/supabase-shim.sql"), "utf8"));
  for (const file of MIGRATIONS) {
    await db.exec(readFileSync(path.join(ROOT, "supabase/migrations", file), "utf8"));
  }
  await seed(db);
  return db;
}

async function seed(db: PGlite) {
  await db.exec(`
    INSERT INTO auth.users (id, email) VALUES
      ('${MEMBER_ID}', 'member@example.test'),
      ('${OTHER_MEMBER_ID}', 'other@example.test'),
      ('${ADMIN_ID}', 'admin@example.test');

    INSERT INTO profiles (id, display_name, is_admin) VALUES
      ('${MEMBER_ID}', '會員', false),
      ('${OTHER_MEMBER_ID}', '另一位會員', false),
      ('${ADMIN_ID}', '管理員', true);

    INSERT INTO podcast_episodes (id, episode_id, title)
      VALUES ('${EPISODE_ID}', 'ep-1', '測試單集');

    INSERT INTO comments (id, episode_id, user_id, content, status, spam_score)
      VALUES ('${MEMBER_COMMENT_ID}', '${EPISODE_ID}', '${MEMBER_ID}', '原本的留言', 'hidden', 0.5);
  `);
}

// 模擬一次 Supabase API 請求：PostgREST 會在交易裡切換到 API 角色，並帶入 JWT 內容。
export async function runAs<T = Record<string, unknown>>(
  db: PGlite,
  role: ApiRole,
  userId: string | null,
  sql: string,
  params: unknown[] = []
) {
  return db.transaction(async (tx) => {
    await tx.query(`SELECT set_config('request.jwt.claims', $1, true)`, [
      JSON.stringify({ sub: userId ?? "", role }),
    ]);
    await tx.exec(`SET LOCAL ROLE ${role}`);
    return tx.query<T>(sql, params);
  });
}

// 用最高權限讀回資料，確認 API 請求之後資料庫裡實際的值。
export async function readAsOwner<T = Record<string, unknown>>(
  db: PGlite,
  sql: string,
  params: unknown[] = []
) {
  const result = await db.query<T>(sql, params);
  return result.rows;
}
