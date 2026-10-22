import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { createClient } from "@/lib/supabase/server";
import { GET } from "@/app/api/admin/comments/route";
import { PATCH } from "@/app/api/admin/comments/[id]/route";

// Supabase 是系統邊界，這裡用假的 client 取代；其餘程式碼照常執行。
vi.mock("@/lib/supabase/server", () => ({ createClient: vi.fn() }));

type Caller = { kind: "guest" } | { kind: "member" } | { kind: "admin" };

const commentWrites: unknown[] = [];

function fakeSupabase(caller: Caller) {
  const user = caller.kind === "guest" ? null : { id: `${caller.kind}-id` };

  function builder(result: () => { data: unknown; error: null; count?: number }) {
    const b: Record<string, unknown> = {};
    for (const method of ["select", "eq", "order", "range"]) b[method] = () => b;
    b.update = (values: unknown) => {
      commentWrites.push(values);
      return b;
    };
    b.single = async () => result();
    b.then = (resolve: (v: unknown) => unknown, reject: (e: unknown) => unknown) =>
      Promise.resolve(result()).then(resolve, reject);
    return b;
  }

  return {
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    from: (table: string) =>
      table === "profiles"
        ? builder(() => ({ data: { is_admin: caller.kind === "admin" }, error: null }))
        : builder(() => ({ data: [{ id: "c1", status: "approved" }], error: null, count: 1 })),
  };
}

function signInAs(caller: Caller) {
  vi.mocked(createClient).mockResolvedValue(
    fakeSupabase(caller) as unknown as Awaited<ReturnType<typeof createClient>>
  );
}

function patchStatus(status: string) {
  return PATCH(
    new NextRequest("http://localhost/api/admin/comments/c1", {
      method: "PATCH",
      body: JSON.stringify({ status }),
    }),
    { params: Promise.resolve({ id: "c1" }) }
  );
}

function listComments() {
  return GET(new NextRequest("http://localhost/api/admin/comments?status=pending"));
}

beforeEach(() => {
  commentWrites.length = 0;
  vi.mocked(createClient).mockReset();
});

describe("PATCH /api/admin/comments/[id]（變更留言狀態）", () => {
  it("未登入回 401，而且不寫入資料庫", async () => {
    signInAs({ kind: "guest" });
    const res = await patchStatus("approved");
    expect(res.status).toBe(401);
    expect(commentWrites).toEqual([]);
  });

  it("登入但不是管理員回 403，而且不寫入資料庫", async () => {
    signInAs({ kind: "member" });
    const res = await patchStatus("approved");
    expect(res.status).toBe(403);
    expect(commentWrites).toEqual([]);
  });

  it("管理員可以變更留言狀態", async () => {
    signInAs({ kind: "admin" });
    const res = await patchStatus("approved");
    expect(res.status).toBe(200);
    expect(commentWrites).toEqual([{ status: "approved" }]);
  });
});

describe("GET /api/admin/comments（留言列表）", () => {
  it("未登入回 401", async () => {
    signInAs({ kind: "guest" });
    expect((await listComments()).status).toBe(401);
  });

  it("登入但不是管理員回 403", async () => {
    signInAs({ kind: "member" });
    expect((await listComments()).status).toBe(403);
  });

  it("管理員可以讀取留言列表", async () => {
    signInAs({ kind: "admin" });
    const res = await listComments();
    expect(res.status).toBe(200);
    expect(await res.json()).toEqual({ comments: [{ id: "c1", status: "approved" }] });
  });
});
