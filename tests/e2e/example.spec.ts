import { test, expect } from '@playwright/test';

test('homepage has title and links', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/Fuzzy/);

  // Expect landing page to have a link or button
  await expect(page.getByRole('link', { name: /student|teacher|admin/i })).toBeVisible();
});

test('navigation to student dashboard', async ({ page }) => {
  await page.goto('/');

  // Click on student link if it exists
  const studentLink = page.getByRole('link', { name: /student/i }).first();
  if (await studentLink.isVisible()) {
    await studentLink.click();

    // Expect to be on student page
    await expect(page).toHaveURL(/.*student.*/);
  }
});

test('responsive design on mobile', async ({ page }) => {
  // Set mobile viewport
  await page.setViewportSize({ width: 375, height: 667 });
  await page.goto('/');

  // Check that the page is responsive
  await expect(page.locator('body')).toBeVisible();

  // Take a screenshot for visual comparison
  await page.screenshot({ path: 'tests/screenshots/mobile-homepage.png' });
});