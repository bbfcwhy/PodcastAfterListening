/**
 * Test helper utilities for E2E tests
 */

export async function waitForPageLoad(page: any) {
  await page.waitForLoadState("networkidle");
  await page.waitForLoadState("domcontentloaded");
}

export async function findEpisodeLink(page: any) {
  const episodeLink = page.locator("a[href*='/episodes/']").first();
  const isVisible = await episodeLink.isVisible({ timeout: 5000 }).catch(() => false);
  
  if (!isVisible) {
    return null;
  }
  
  return await episodeLink.getAttribute("href");
}

export async function checkAuthentication(page: any) {
  const loginPrompt = page.locator("text=請先登入, text=登入");
  return await loginPrompt.isVisible({ timeout: 2000 }).catch(() => false);
}

export function generateTestId(prefix: string = "test") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).substring(7)}`;
}
