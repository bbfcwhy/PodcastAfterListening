import { readdirSync, readFileSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { createServerClient } from "@supabase/ssr";
import { NextRequest } from "next/server";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { middleware } from "@/middleware";

// Supabase 是系統邊界，這裡用假的 client 取代；middleware 本身照常執行。
vi.mock("@supabase/ssr", () => ({ createServerClient: vi.fn() }));

const SRC = fileURLToPath(new URL("../../src", import.meta.url));
const APP_DIR = path.join(SRC, "app");

type Caller = "guest" | "member" | "admin";

function signInAs(caller: Caller) {
  const user = caller === "guest" ? null : { id: `${caller}-id` };
  const profiles = {
    select: () => profiles,
    eq: () => profiles,
    single: async () => ({ data: { is_admin: caller === "admin" }, error: null }),
  };
  vi.mocked(createServerClient).mockReturnValue({
    auth: { getUser: async () => ({ data: { user }, error: null }) },
    from: () => profiles,
  } as unknown as ReturnType<typeof createServerClient>);
}

async function open(url: string) {
  const res = await middleware(new NextRequest(`http://localhost${url}`));
  const location = res.headers.get("location");
  return { status: res.status, redirectedTo: location ? new URL(location).pathname : null };
}

// 把 src/app 底下每個 page.tsx 換成實際網址：路由群組 (xxx) 不出現在網址裡，[param] 填入範例值。
function pageRoutes() {
  return (readdirSync(APP_DIR, { recursive: true }) as string[])
    .filter((file) => path.basename(file) === "page.tsx")
    .map((file) => {
      const segments = path.dirname(file).split(path.sep).filter((s) => s !== ".");
      return {
        file,
        isAdmin: segments[0] === "(admin)",
        segments: segments.filter((s) => !/^\(.+\)$/.test(s)),
      };
    });
}

function sampleUrl(segments: string[]) {
  return "/" + segments.map((s) => (s.startsWith("[") ? "sample-1" : s)).join("/");
}

const adminUrls = pageRoutes().filter((r) => r.isAdmin).map((r) => sampleUrl(r.segments));
const publicUrls = pageRoutes().filter((r) => !r.isAdmin).map((r) => sampleUrl(r.segments));

beforeEach(() => {
  vi.mocked(createServerClient).mockReset();
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_URL", "https://example.supabase.co");
  vi.stubEnv("NEXT_PUBLIC_SUPABASE_ANON_KEY", "test-anon-key");
});

describe("後台頁面只有管理員打得開", () => {
  it("有列舉到後台頁面（防止列舉壞掉時測試空轉）", () => {
    expect(adminUrls).toContain("/dashboard");
    expect(adminUrls.length).toBeGreaterThanOrEqual(14);
  });

  it.each(adminUrls)("未登入打開 %s 會被導回首頁", async (url) => {
    signInAs("guest");
    expect(await open(url)).toMatchObject({ redirectedTo: "/" });
  });

  it.each(["/dashboard", "/comments", "/episodes/edit/123"])(
    "一般會員打開 %s 會被導回首頁",
    async (url) => {
      signInAs("member");
      expect(await open(url)).toMatchObject({ redirectedTo: "/" });
    }
  );

  it.each(["/dashboard", "/comments", "/episodes/edit/123"])("管理員打開 %s 照常進入", async (url) => {
    signInAs("admin");
    expect(await open(url)).toEqual({ status: 200, redirectedTo: null });
  });

  it("用網址編碼繞路（/%64ashboard）也會被擋", async () => {
    signInAs("guest");
    expect(await open("/%64ashboard")).toMatchObject({ redirectedTo: "/" });
  });

  it.each(publicUrls)("未登入打開前台頁面 %s 不會被導走", async (url) => {
    signInAs("guest");
    expect(await open(url)).toEqual({ status: 200, redirectedTo: null });
  });
});

describe("使用者選單的連結", () => {
  it("站內連結都對應到存在的頁面", () => {
    const routePatterns = pageRoutes().map(
      (r) => new RegExp("^/" + r.segments.map((s) => (s.startsWith("[") ? "[^/]+" : s)).join("/") + "$")
    );
    const source = readFileSync(path.join(SRC, "components/navbar/UserMenu.tsx"), "utf8");
    const hrefs = [...source.matchAll(/href="(\/[^"]*)"/g)].map((m) => m[1]);

    expect(hrefs.length).toBeGreaterThan(0);
    expect(hrefs.filter((href) => !routePatterns.some((p) => p.test(href)))).toEqual([]);
  });
});
