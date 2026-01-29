import { test, expect } from "@playwright/test";

/**
 * SC-003: 90% 的訪客能在第一次嘗試時成功完成留言發布
 */
test.describe("Comment Success Rate", () => {
  test("should allow users to successfully post comment on first attempt", async ({
    page,
  }) => {
    // Navigate to homepage first to check if there are any episodes
    await page.goto("/");
    await page.waitForLoadState("networkidle");

    // Try to find an episode link
    const episodeLink = page.locator("a[href*='/episodes/']").first();
    
    if (!(await episodeLink.isVisible({ timeout: 5000 }).catch(() => false))) {
      test.skip("No episodes available for testing");
      return;
    }

    // Navigate to episode page
    const episodeUrl = await episodeLink.getAttribute("href");
    if (!episodeUrl) {
      test.skip("No episode URL found");
      return;
    }

    await page.goto(episodeUrl, { waitUntil: "networkidle" });
    await page.waitForLoadState("domcontentloaded");
    await page.waitForTimeout(3000); // Wait for React hydration

    // Wait for page to load - check for h1 or any content
    const h1 = page.locator("h1").first();
    const pageHasContent = await Promise.race([
      h1.isVisible({ timeout: 15000 }).then(() => true),
      page.locator("body").textContent().then((text) => text && text.length > 100).catch(() => false),
    ]);

    if (!pageHasContent) {
      // Page might have failed to load
      const errorText = await page.locator("text=/404|錯誤|error|not found/i").isVisible().catch(() => false);
      if (errorText) {
        throw new Error(`Episode page failed to load: ${episodeUrl}`);
      }
      // If no error but no content, might be a loading issue - wait more
      await page.waitForTimeout(5000);
    }

    // Verify we're on the episode page (not 404)
    const is404 = await page.locator("text=/404|找不到您要的頁面/i").isVisible().catch(() => false);
    if (is404) {
      throw new Error(`Episode page returned 404: ${episodeUrl}. The episode may not exist or may not be published.`);
    }

    // Wait for comment section to appear - it's a client component that may take time to hydrate
    // CommentSection shows "討論區 ({count})" as the title
    const commentSection = page.locator("text=/討論區/");
    const commentSectionVisible = await commentSection.isVisible({ timeout: 15000 }).catch(() => false);

    if (!commentSectionVisible) {
      // Check if login is required (CommentForm shows "請先登入以發表留言" when not authenticated)
      const loginPrompt = page.locator("text=/請先登入/");
      const isLoginRequired = await loginPrompt.isVisible({ timeout: 2000 }).catch(() => false);

      if (isLoginRequired) {
        // Skip test if login is required and we don't have test credentials
        test.skip("Login required - test credentials not configured");
        return;
      }

      // If comment section still not found, check if the page has any comment-related content
      const pageText = await page.textContent("body").catch(() => "");
      if (pageText && pageText.includes("討論區")) {
        // Text exists but selector not working - wait a bit more and try again
        await page.waitForTimeout(2000);
        await expect(commentSection).toBeVisible({ timeout: 10000 });
      } else {
        // Comment section truly not found - this might be a page structure issue
        throw new Error(`Comment section not found on episode page: ${episodeUrl}. Page may not have loaded correctly.`);
      }
    }

    // Check if login is required (after confirming comment section exists)
    const loginPrompt = page.locator("text=/請先登入/");
    const isLoginRequired = await loginPrompt.isVisible({ timeout: 5000 }).catch(() => false);

    if (isLoginRequired) {
      // Skip test if login is required and we don't have test credentials
      test.skip("Login required - test credentials not configured");
      return;
    }

    // Find comment form textarea - wait for it to be visible
    // The textarea placeholder is "分享你的想法..."
    const textarea = page.locator("textarea[placeholder*='分享你的想法']");
    await expect(textarea).toBeVisible({ timeout: 10000 });

    // Fill in comment
    const testComment = `測試留言 ${Date.now()}`;
    await textarea.fill(testComment);

    // Submit comment
    const submitButton = page.locator("button:has-text('發布留言')");
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Wait for success toast message
    await expect(
      page.locator("text=留言已發布")
    ).toBeVisible({ timeout: 10000 });

    // Verify comment appears in list (may need to wait for refresh)
    await page.waitForTimeout(2000);
    const commentText = page.locator(`text=${testComment}`);
    await expect(commentText).toBeVisible({ timeout: 5000 });
  });
});
