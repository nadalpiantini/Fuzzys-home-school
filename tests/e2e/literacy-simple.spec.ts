import { test, expect } from '@playwright/test';

test.describe('Literacy Level 1 - Basic Navigation', () => {
  test('navigate to literacy level 1 and check page loads', async ({ page }) => {
    console.log('Navigating to literacy level 1...');

    // Navigate to literacy level 1 page
    await page.goto('http://localhost:3001/learn/literacy/level1', { timeout: 30000 });

    console.log('Page loaded, taking screenshot...');

    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/literacy-loaded.png', fullPage: true });

    console.log('Checking URL...');

    // Verify we're on the right page
    await expect(page).toHaveURL(/.*literacy\/level1.*/, { timeout: 10000 });

    console.log('✓ Page URL verified');

    // Check for chapter elements
    const pageContent = await page.textContent('body');
    console.log('Page content preview:', pageContent?.substring(0, 500));

    // Look for chapter indicators
    const hasChapterContent = pageContent?.includes('enye') ||
                              pageContent?.includes('Capítulo') ||
                              pageContent?.includes('Chapter');

    console.log('Has chapter content?', hasChapterContent);

    // Take final screenshot
    await page.screenshot({ path: 'tests/screenshots/literacy-page-content.png', fullPage: true });

    console.log('Test complete!');
  });

  test('check for DragDrop zones', async ({ page }) => {
    console.log('Checking for DragDrop activity...');

    await page.goto('http://localhost:3001/learn/literacy/level1', { timeout: 30000 });

    // Wait a bit for content to load
    await page.waitForTimeout(3000);

    // Look for drop zones
    const zones = page.locator('[data-zone-id], .drop-zone, [class*="dropZone"], [class*="DropZone"]');
    const zonesCount = await zones.count();

    console.log(`Found ${zonesCount} drop zones`);

    // Look for draggable items
    const draggables = page.locator('[draggable="true"], .draggable, [class*="draggable"]');
    const draggablesCount = await draggables.count();

    console.log(`Found ${draggablesCount} draggable items`);

    // Take screenshot
    await page.screenshot({ path: 'tests/screenshots/dragdrop-check.png', fullPage: true });

    console.log('DragDrop check complete!');
  });
});
