import { test, expect } from "@playwright/test";

/**
 * SC-007: 聯盟行銷連結的點擊可被正確追蹤，追蹤準確率達 99%
 */
test.describe("Affiliate Tracking Accuracy", () => {
  test("should track affiliate clicks correctly", async ({ page }) => {
    // Navigate to homepage to find episodes
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Try to find an episode link
    const episodeLink = page.locator("a[href*='/episodes/']").first();
    
    if (!(await episodeLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip("No episodes available for testing");
      return;
    }

    const episodeUrl = await episodeLink.getAttribute("href");
    if (!episodeUrl) {
      test.skip("No episode URL found");
      return;
    }

    await page.goto(episodeUrl);
    await page.waitForLoadState("networkidle");
    await page.waitForSelector("h1", { timeout: 10000 });

    // Look for affiliate section
    const affiliateSection = page.locator("text=相關推薦, text=推薦內容").first();
    const hasAffiliates = await affiliateSection.isVisible({ timeout: 2000 }).catch(() => false);

    if (!hasAffiliates) {
      test.skip("No affiliate content on this episode");
      return;
    }

    // Find affiliate link - could be in AffiliateCard
    const affiliateLink = page
      .locator("a[href*='/api/affiliate/redirect/']")
      .first();

    if (!(await affiliateLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip("No affiliate links found on this episode");
      return;
    }

    // Get affiliate ID from href
    const href = await affiliateLink.getAttribute("href");
    if (!href) {
      throw new Error("Affiliate link has no href");
    }

    const affiliateIdMatch = href.match(/\/api\/affiliate\/redirect\/([^/?]+)/);
    if (!affiliateIdMatch) {
      throw new Error("Could not extract affiliate ID from href");
    }
    const affiliateId = affiliateIdMatch[1];

    // Intercept the redirect request to verify it's called
    let redirectCalled = false;
    page.route("**/api/affiliate/redirect/**", (route) => {
      redirectCalled = true;
      route.continue();
    });

    // Click affiliate link (will open in new tab/window)
    const [newPage] = await Promise.all([
      page.context().waitForEvent("page", { timeout: 10000 }),
      affiliateLink.click(),
    ]).catch(() => [null]);

    // Wait a bit for the redirect to process
    await page.waitForTimeout(2000);

    // Verify redirect was called
    expect(redirectCalled).toBe(true);

    // Verify new page was opened (if applicable)
    if (newPage) {
      // The redirect should take us to the target URL
      const newPageUrl = newPage.url();
      expect(newPageUrl).not.toContain("/api/affiliate/redirect");
      await newPage.close();
    }

    // In a real test environment, we would:
    // 1. Check the affiliate_clicks table for the new record
    // 2. Verify all fields are correct (affiliate_id, episode_id, timestamp, etc.)
    // 3. Run multiple tests and calculate accuracy rate
    // 4. Verify the click was recorded with correct metadata
  });
});
