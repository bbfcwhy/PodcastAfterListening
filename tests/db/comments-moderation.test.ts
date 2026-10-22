import type { PGlite } from "@electric-sql/pglite";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { ADMIN_ID, MEMBER_COMMENT_ID, MEMBER_ID, createTestDb, readAsOwner, runAs } from "./helpers";

// 種子資料：MEMBER_ID 的留言，status = 'hidden'、spam_score = 0.5
describe("留言的審核欄位只能由管理員變更", () => {
  let db: PGlite;

  beforeEach(async () => {
    db = await createTestDb();
  });

  afterEach(async () => {
    await db.close();
  });

  async function memberComment() {
    const [row] = await readAsOwner<{ content: string; status: string; spam_score: number }>(
      db,
      "SELECT content, status, spam_score FROM comments WHERE id = $1",
      [MEMBER_COMMENT_ID]
    );
    return row;
  }

  it("作者把自己被隱藏的留言改成 approved 會被拒絕", async () => {
    await expect(
      runAs(db, "authenticated", MEMBER_ID, "UPDATE comments SET status = 'approved' WHERE id = $1", [
        MEMBER_COMMENT_ID,
      ])
    ).rejects.toMatchObject({ code: "42501" });

    expect((await memberComment()).status).toBe("hidden");
  });

  it("作者不能改自己留言的垃圾分數", async () => {
    await expect(
      runAs(db, "authenticated", MEMBER_ID, "UPDATE comments SET spam_score = 0 WHERE id = $1", [
        MEMBER_COMMENT_ID,
      ])
    ).rejects.toMatchObject({ code: "42501" });

    expect((await memberComment()).spam_score).toBe(0.5);
  });

  it("作者仍可以修改自己留言的內容（一併送 updated_at 也可以）", async () => {
    await runAs(
      db,
      "authenticated",
      MEMBER_ID,
      "UPDATE comments SET content = '改過的留言', updated_at = now() WHERE id = $1",
      [MEMBER_COMMENT_ID]
    );

    expect(await memberComment()).toEqual({ content: "改過的留言", status: "hidden", spam_score: 0.5 });
  });

  it("管理員可以變更留言狀態", async () => {
    await runAs(db, "authenticated", ADMIN_ID, "UPDATE comments SET status = 'approved' WHERE id = $1", [
      MEMBER_COMMENT_ID,
    ]);

    expect((await memberComment()).status).toBe("approved");
  });

  it("service_role（後端維護用）可以變更留言狀態", async () => {
    await runAs(db, "service_role", null, "UPDATE comments SET status = 'spam' WHERE id = $1", [
      MEMBER_COMMENT_ID,
    ]);

    expect((await memberComment()).status).toBe("spam");
  });
});
