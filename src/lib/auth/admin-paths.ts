// 後台頁面放在路由群組 src/app/(admin)/，網址沒有 /admin 前綴，所以逐一列出。
// 新增後台頁面時要加在這裡；tests/unit/admin-route-guard.test.ts 會列舉 (admin) 底下的頁面檢查有沒有漏。
// 前台也有 /episodes/[showSlug]/[episodeSlug]、/shows/[slug]、/tags/[slug]，這三組不能整個前綴擋。
const ADMIN_PATH_PATTERNS = [
  /^\/admin(\/|$)/,
  /^\/dashboard(\/|$)/,
  /^\/comments(\/|$)/,
  /^\/affiliates(\/|$)/,
  /^\/episodes\/?$/,
  /^\/episodes\/new\/?$/,
  /^\/episodes\/edit\/[^/]+\/?$/,
  /^\/shows\/?$/,
  /^\/shows\/new\/?$/,
  /^\/shows\/[^/]+\/edit\/?$/,
  /^\/tags\/?$/,
  /^\/tags\/new\/?$/,
  /^\/tags\/[^/]+\/edit\/?$/,
];

export function isAdminPath(pathname: string): boolean {
  let decoded = pathname;
  try {
    // 防止用網址編碼繞過比對，例如 /%64ashboard
    decoded = decodeURIComponent(pathname);
  } catch {
    // 編碼格式錯誤時用原字串比對
  }
  return ADMIN_PATH_PATTERNS.some((pattern) => pattern.test(decoded));
}
