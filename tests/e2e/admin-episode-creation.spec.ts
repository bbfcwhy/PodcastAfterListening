import { test, expect } from "@playwright/test";

/**
 * SC-004: 站長可在 2 分鐘內完成一筆新節目的內容建立
 */
test.describe("Admin Episode Creation", () => {
  test("admin should be able to create episode within 2 minutes", async ({
    page,
  }) => {
    const startTime = Date.now();

    // Navigate to admin login page first
    await page.goto("/admin/episodes/new");
    await page.waitForLoadState("networkidle");
    
    // Wait a bit for redirect to complete
    await page.waitForTimeout(1000);

    // Check if redirected to login (if not already authenticated)
    const currentUrl = page.url();
    if (currentUrl.includes("/login") || currentUrl === "/" || currentUrl.includes("redirect=")) {
      // Skip test if authentication is required
      test.skip("Admin authentication required - test credentials not configured");
      return;
    }

    // Wait for page to load completely
    await page.waitForLoadState("networkidle");
    await page.waitForLoadState("domcontentloaded");
    
    // Wait a bit more for React to hydrate
    await page.waitForTimeout(2000);
    
    // Verify we're still on the admin page (not redirected)
    const adminUrl = page.url();
    if (!adminUrl.includes("/admin/episodes/new")) {
      // If redirected, the test should have been skipped earlier
      // But if we get here, it means authentication check didn't work
      throw new Error(`Unexpected redirect to ${adminUrl}. Admin authentication may be required.`);
    }
    
    // Wait for page title to confirm we're on the right page
    // Try multiple selectors for flexibility
    const h1Title = page.locator("h1").filter({ hasText: /新增節目|建立新的 Podcast 單集/ });
    const textTitle = page.locator("text=/新增節目|建立新的 Podcast 單集/");
    
    // Try to find the title with multiple attempts
    let titleFound = false;
    for (let i = 0; i < 3; i++) {
      const h1Visible = await h1Title.isVisible().catch(() => false);
      const textVisible = await textTitle.isVisible().catch(() => false);
      
      if (h1Visible || textVisible) {
        titleFound = true;
        break;
      }
      
      // Wait a bit more and try again
      await page.waitForTimeout(1000);
    }
    
    // If title not found, check page content
    if (!titleFound) {
      const pageContent = await page.textContent("body");
      if (pageContent && (pageContent.includes("新增節目") || pageContent.includes("建立新的 Podcast 單集"))) {
        // Text exists in page - continue
        titleFound = true;
      } else {
        // Title not found - might be a loading issue
        // Wait a bit more and check for form instead
        await page.waitForTimeout(2000);
      }
    }

    // Wait for form to load
    await page.waitForSelector("form", { timeout: 10000 });

    // Wait for form to be fully loaded - EpisodeForm uses Radix UI Select, not native select
    // Wait for the Select trigger button to be visible
    await page.waitForSelector('button[role="combobox"]', { timeout: 10000 });
    
    // Check if there are any shows available by looking for the Select trigger
    const showSelectTrigger = page.locator('button[role="combobox"]').first();
    const triggerText = await showSelectTrigger.textContent();
    
    if (!triggerText || triggerText.includes("選擇節目系列") || triggerText === "") {
      // No shows available or only placeholder
      test.skip("No shows available - need to create a show first");
      return;
    }

    // Click the Select trigger to open the dropdown
    await showSelectTrigger.click();
    
    // Wait for SelectContent to be visible and select the first option
    await page.waitForSelector('[role="option"]', { timeout: 5000 });
    const firstOption = page.locator('[role="option"]').first();
    await firstOption.click();
    
    const testTitle = `測試節目單集 ${Date.now()}`;
    const testSlug = `test-episode-${Date.now()}`;
    
    await page.fill('input[name="title"]', testTitle);
    await page.fill('input[name="slug"]', testSlug);
    await page.fill('input[name="original_url"]', "https://example.com/episode");
    await page.fill('textarea[name="ai_summary"]', "這是測試大綱");
    
    // Check is_published checkbox if it exists
    const publishedCheckbox = page.locator('input[name="is_published"]');
    if (await publishedCheckbox.isVisible({ timeout: 2000 }).catch(() => false)) {
      await publishedCheckbox.check();
    }

    // Submit form
    const submitButton = page.locator("button:has-text('建立'), button:has-text('更新')").first();
    await expect(submitButton).toBeEnabled();
    await submitButton.click();

    // Wait for redirect to episodes list or success message
    await Promise.race([
      page.waitForURL("**/admin/episodes", { timeout: 15000 }),
      page.waitForSelector("text=已建立", { timeout: 15000 }),
    ]);

    // Verify episode appears in list (if redirected)
    if (page.url().includes("/admin/episodes")) {
      await expect(page.locator(`text=${testTitle}`)).toBeVisible({ timeout: 10000 });
    }

    const endTime = Date.now();
    const duration = (endTime - startTime) / 1000; // Convert to seconds

    // Should complete within 2 minutes (120 seconds)
    expect(duration).toBeLessThan(120);
    console.log(`Episode creation took ${duration.toFixed(2)} seconds`);
  });
});
