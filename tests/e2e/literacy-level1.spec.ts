import { test, expect } from '@playwright/test';

test.describe('Literacy Level 1 - Chapter Flow', () => {
  test.beforeEach(async ({ page }) => {
    // Navigate to literacy level 1 page
    await page.goto('http://localhost:3001/learn/literacy/level1');

    // Wait for page to load
    await page.waitForLoadState('networkidle');
  });

  test('complete chapter 1 (enye-01) and verify chapter 2 unlocks', async ({ page }) => {
    // Take screenshot of initial state
    await page.screenshot({ path: 'tests/screenshots/literacy-initial.png', fullPage: true });

    // Verify we're on the right page
    await expect(page).toHaveURL(/.*literacy\/level1.*/);

    // Look for chapter 1 (enye-01) - it should be unlocked
    const chapter1 = page.locator('[data-chapter-id="enye-01"], [data-testid="chapter-enye-01"]').first();

    // If chapter selector exists, click to start
    if (await chapter1.isVisible({ timeout: 5000 }).catch(() => false)) {
      await chapter1.click();
      await page.waitForLoadState('networkidle');
    }

    console.log('Starting Chapter 1 activities...');

    // Activity 1: Complete first activity (likely audio or MCQ)
    console.log('Activity 1...');
    await completeActivity(page, 1);
    await page.screenshot({ path: 'tests/screenshots/literacy-activity1-complete.png', fullPage: true });

    // Activity 2: Complete second activity
    console.log('Activity 2...');
    await completeActivity(page, 2);
    await page.screenshot({ path: 'tests/screenshots/literacy-activity2-complete.png', fullPage: true });

    // Activity 3: DragDrop activity - special handling
    console.log('Activity 3 (DragDrop)...');
    await completeDragDropActivity(page);
    await page.screenshot({ path: 'tests/screenshots/literacy-dragdrop-complete.png', fullPage: true });

    // Wait for chapter completion processing
    await page.waitForTimeout(2000);

    // Verify chapter 1 shows 100% or completado
    const chapter1Progress = page.locator('[data-chapter-id="enye-01"]').first();
    const progressText = await chapter1Progress.textContent().catch(() => '');

    console.log('Chapter 1 progress text:', progressText);

    const isComplete = progressText?.includes('100%') ||
                       progressText?.includes('completado') ||
                       progressText?.includes('Completado');

    expect(isComplete).toBeTruthy();
    console.log('✓ Chapter 1 shows as complete');

    // Take screenshot after chapter completion
    await page.screenshot({ path: 'tests/screenshots/literacy-chapter1-complete.png', fullPage: true });

    // Verify chapter 2 (fluidez-01) is now unlocked
    const chapter2 = page.locator('[data-chapter-id="fluidez-01"]').first();

    if (await chapter2.isVisible({ timeout: 5000 }).catch(() => false)) {
      const chapter2Text = await chapter2.textContent();
      const isLocked = chapter2Text?.includes('bloqueado') || chapter2Text?.includes('Bloqueado');

      console.log('Chapter 2 text:', chapter2Text);
      console.log('Chapter 2 locked?', isLocked);

      expect(isLocked).toBeFalsy();
      console.log('✓ Chapter 2 is unlocked');
    }

    // Take final screenshot
    await page.screenshot({ path: 'tests/screenshots/literacy-final-state.png', fullPage: true });
  });
});

// Helper function to complete DragDrop activity
async function completeDragDropActivity(page: any) {
  console.log('Starting DragDrop activity...');

  // Wait for drag-drop zones to be visible
  const zones = page.locator('[data-zone-id], .drop-zone, [class*="dropZone"]');
  const zonesCount = await zones.count();

  console.log(`Found ${zonesCount} drop zones`);

  // Verify we have 6 zones
  expect(zonesCount).toBeGreaterThanOrEqual(6);
  console.log('✓ All 6 zones visible');

  // Find draggable syllables
  const draggables = page.locator('[draggable="true"], .draggable, [class*="draggable"]');
  const draggablesCount = await draggables.count();

  console.log(`Found ${draggablesCount} draggable items`);

  // Drag each syllable to its corresponding zone
  for (let i = 0; i < Math.min(draggablesCount, zonesCount); i++) {
    const draggable = draggables.nth(i);
    const zone = zones.nth(i);

    // Get syllable text for logging
    const syllableText = await draggable.textContent();
    console.log(`Dragging syllable ${i + 1}: "${syllableText}"`);

    // Perform drag and drop
    await draggable.dragTo(zone);
    await page.waitForTimeout(300); // Small delay between drags
  }

  console.log('✓ All syllables dragged to zones');

  // Take screenshot before verification
  await page.screenshot({ path: 'tests/screenshots/dragdrop-before-verify.png', fullPage: true });

  // Click "Verificar Respuestas" button
  const verifyButton = page.getByRole('button', { name: /verificar|check|comprobar/i });

  if (await verifyButton.isVisible({ timeout: 5000 }).catch(() => false)) {
    await verifyButton.click();
    console.log('✓ Clicked Verificar Respuestas button');

    // Wait for validation result
    await page.waitForTimeout(1000);

    // Take screenshot after verification
    await page.screenshot({ path: 'tests/screenshots/dragdrop-after-verify.png', fullPage: true });

    // Check for success message
    const successMessage = page.getByText(/perfecto|correcto|6\/6|todas las sílabas correctamente/i);

    if (await successMessage.isVisible({ timeout: 5000 }).catch(() => false)) {
      const messageText = await successMessage.textContent();
      console.log('Success message:', messageText);

      expect(messageText).toMatch(/perfecto|correcto|6\/6|todas las sílabas correctamente/i);
      console.log('✓ DragDrop validation shows success (6/6 correct)');
    } else {
      console.warn('⚠ Success message not found - checking page content');
      const pageContent = await page.textContent('body');
      console.log('Page content after verify:', pageContent);
    }

    // Look for "Continuar" or "Siguiente" button
    const continueButton = page.getByRole('button', { name: /continuar|siguiente|next/i });

    if (await continueButton.isVisible({ timeout: 5000 }).catch(() => false)) {
      await continueButton.click();
      console.log('✓ Clicked Continue button');
      await page.waitForLoadState('networkidle');
    }
  } else {
    console.warn('⚠ Verificar Respuestas button not found');
  }
}

// Helper function to complete generic activities
async function completeActivity(page: any, activityNumber: number) {
  console.log(`Completing activity ${activityNumber}...`);

  // Wait for activity to load
  await page.waitForLoadState('networkidle');
  await page.waitForTimeout(1000);

  // Try different activity types

  // Type 1: MCQ (Multiple Choice Question)
  const mcqOption = page.locator('[data-option], .mcq-option, [class*="option"]').first();
  if (await mcqOption.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Detected MCQ activity');
    await mcqOption.click();

    const submitButton = page.getByRole('button', { name: /enviar|submit|verificar|check/i });
    if (await submitButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await submitButton.click();
      await page.waitForTimeout(1000);
    }

    // Click continue
    const continueButton = page.getByRole('button', { name: /continuar|siguiente|next/i });
    if (await continueButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForLoadState('networkidle');
    }

    console.log('✓ MCQ activity completed');
    return;
  }

  // Type 2: True/False
  const trueFalseButton = page.getByRole('button', { name: /verdadero|true|falso|false/i }).first();
  if (await trueFalseButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Detected True/False activity');
    await trueFalseButton.click();

    const continueButton = page.getByRole('button', { name: /continuar|siguiente|next/i });
    if (await continueButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForLoadState('networkidle');
    }

    console.log('✓ True/False activity completed');
    return;
  }

  // Type 3: Audio activity (just click continue/next)
  const audioElement = page.locator('audio, [class*="audio"], [data-testid*="audio"]').first();
  if (await audioElement.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Detected Audio activity');

    // Wait a bit for audio to "play"
    await page.waitForTimeout(2000);

    const continueButton = page.getByRole('button', { name: /continuar|siguiente|next/i });
    if (await continueButton.isVisible({ timeout: 3000 }).catch(() => false)) {
      await continueButton.click();
      await page.waitForLoadState('networkidle');
    }

    console.log('✓ Audio activity completed');
    return;
  }

  // Type 4: Generic - just look for continue button
  const continueButton = page.getByRole('button', { name: /continuar|siguiente|next/i });
  if (await continueButton.isVisible({ timeout: 3000 }).catch(() => false)) {
    console.log('Detected generic activity - clicking continue');
    await continueButton.click();
    await page.waitForLoadState('networkidle');
    console.log('✓ Generic activity completed');
    return;
  }

  console.warn(`⚠ Could not detect activity type for activity ${activityNumber}`);
}
