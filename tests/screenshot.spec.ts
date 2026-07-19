import { test, expect } from '@playwright/test';
import * as fs from 'fs';
import * as path from 'path';

test('Capture application screenshots', async ({ page }, testInfo) => {
  const isDesktop = testInfo.project.name === 'chromium-desktop';
  const suffix = isDesktop ? '-desktop' : '-mobile';

  // Ensure the screenshots directory exists
  const screenshotsDir = path.join(process.cwd(), 'public/screenshots');
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir, { recursive: true });
  }

  // 1. Load the application
  await page.goto('/');
  await page.waitForLoadState('networkidle');

  // 2. Navigate to settings and seed demo data
  const settingsTab = page.locator('button:has-text("Settings")');
  await settingsTab.click();
  await page.waitForTimeout(500); // Wait for transition

  const seedButton = page.locator('button:has-text("Seed Demo Data")');
  await expect(seedButton).toBeVisible();
  await seedButton.click();

  // Wait for the seed operation and UI updates
  await page.waitForTimeout(1000);

  // Scroll the scroll container back to top before capturing the screenshot
  await page.locator('.overflow-y-auto').evaluate(el => el.scrollTop = 0);
  await page.waitForTimeout(500); // Wait for scroll stabilization

  // 3. Take screenshot of the Settings page
  await page.screenshot({ path: path.join(screenshotsDir, `settings${suffix}.png`), fullPage: false });
  console.log(`Saved settings${suffix}.png`);

  // 4. Navigate to Calendar and capture
  const calendarTab = page.locator('button:has-text("Calendar")');
  await calendarTab.click();
  await page.waitForTimeout(1000); // Wait for transitions and page rendering
  await page.screenshot({ path: path.join(screenshotsDir, `calendar${suffix}.png`), fullPage: false });
  console.log(`Saved calendar${suffix}.png`);

  // 5. Navigate to Insights and capture
  const insightsTab = page.locator('button:has-text("Insights")');
  await insightsTab.click();
  await page.waitForTimeout(2000); // Allow charts/recharts animations to complete
  await page.screenshot({ path: path.join(screenshotsDir, `insights${suffix}.png`), fullPage: false });
  console.log(`Saved insights${suffix}.png`);
});
