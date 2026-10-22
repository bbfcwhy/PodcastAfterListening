import type { PGlite } from "@electric-sql/pglite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import {
  ADMIN_ID,
  MEMBER_ID,
  OTHER_MEMBER_ID,
  createTestDb,
  readAsOwner,
  runAs,
} from "./helpers";

describe("profiles.is_admin 只能由管理員變更", () => {
  let db: PGlite;

  beforeEach(async () => {
    db = await createTestDb();
  });

  afterEach(async () => {
    await db.close();
  });

  async function profileOf(id: string) {
    const [row] = await readAsOwner<{ is_admin: boolean; display_name: string }>(
      db,
      "SELECT is_admin, display_name FROM profiles WHERE id = $1",
      [id]
    );
    return row;
  }

  it("一般會員把自己升成管理員會被拒絕", async () => {
    await expect(
      runAs(db, "authenticated", MEMBER_ID, "UPDATE profiles SET is_admin = true WHERE id = $1", [
        MEMBER_ID,
      ])
    ).rejects.toMatchObject({ code: "42501" });

    expect((await profileOf(MEMBER_ID)).is_admin).toBe(false);
  });

  it("一般會員仍可以改自己的顯示名稱", async () => {
    await runAs(
      db,
      "authenticated",
      MEMBER_ID,
      "UPDATE profiles SET display_name = '新名字' WHERE id = $1",
      [MEMBER_ID]
    );

    expect((await profileOf(MEMBER_ID)).display_name).toBe("新名字");
  });

  it("一般會員更新資料時帶上原本的 is_admin 值，不算變更、照常成功", async () => {
    await runAs(
      db,
      "authenticated",
      MEMBER_ID,
      "UPDATE profiles SET display_name = '新名字', is_admin = false WHERE id = $1",
      [MEMBER_ID]
    );

    expect(await profileOf(MEMBER_ID)).toEqual({ is_admin: false, display_name: "新名字" });
  });

  it("管理員可以把別的會員設成管理員", async () => {
    await runAs(db, "authenticated", ADMIN_ID, "UPDATE profiles SET is_admin = true WHERE id = $1", [
      OTHER_MEMBER_ID,
    ]);

    expect((await profileOf(OTHER_MEMBER_ID)).is_admin).toBe(true);
  });

  it("service_role（後端維護用）可以變更 is_admin", async () => {
    await runAs(db, "service_role", null, "UPDATE profiles SET is_admin = true WHERE id = $1", [
      MEMBER_ID,
    ]);

    expect((await profileOf(MEMBER_ID)).is_admin).toBe(true);
  });
});
