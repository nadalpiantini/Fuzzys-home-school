import { test, expect } from '@playwright/test';

test.describe('DragDrop and Chapter Unlocking', () => {
  test('should validate DragDrop correctly and unlock next chapter', async ({ page }) => {
    // Navigate to literacy level 1
    await page.goto('http://localhost:3001/learn/literacy/level1');

    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/01-initial.png', fullPage: true });

    console.log('✅ Page loaded');

    // Check if we're on chapter 1 (enye-01)
    const chapterTitle = await page.locator('h3, h2').filter({ hasText: /ñ/ }).first().textContent();
    console.log('📖 Current chapter:', chapterTitle);

    // Activity 1: TrueFalse - Click some answers
    console.log('🎯 Activity 1: TrueFalse...');
    const trueFalseButtons = page.locator('button').filter({ hasText: /Verdadero|Falso/ });
    if (await trueFalseButtons.first().isVisible()) {
      // Click 5 times (one for each question)
      for (let i = 0; i < 5; i++) {
        await trueFalseButtons.first().click();
        await page.waitForTimeout(500);
      }
      console.log('✅ TrueFalse completed');
      await page.screenshot({ path: 'tests/screenshots/02-activity1-done.png', fullPage: true });
    }

    // Wait for auto-advance to Activity 2
    await page.waitForTimeout(2000);

    // Activity 2: DragDrop
    console.log('🎯 Activity 2: DragDrop...');

    // Wait for DragDrop to load
    await page.waitForSelector('text=Banco de Sílabas', { timeout: 10000 });

    // Check that we have 6 zones
    const zones = page.locator('[data-zone-id]');
    const zoneCount = await zones.count();
    console.log(`📊 Found ${zoneCount} drop zones`);
    expect(zoneCount).toBe(6);

    // Check syllables in bank
    const syllables = page.locator('[data-syllable]');
    const syllableCount = await syllables.count();
    console.log(`📝 Found ${syllableCount} syllables in bank`);

    // Take screenshot before dragging
    await page.screenshot({ path: 'tests/screenshots/03-dragdrop-before.png', fullPage: true });

    // Drag syllables to correct zones
    const dragOperations = [
      { syllable: 'ña', zone: 'piñata' },
      { syllable: 'ñe', zone: 'teñir' },
      { syllable: 'ñi', zone: 'niña' },
      { syllable: 'ño', zone: 'año' },
      { syllable: 'ñu', zone: 'ñu' },
      { syllable: 'ñe', zone: 'señor' },
    ];

    for (const op of dragOperations) {
      console.log(`   Dragging "${op.syllable}" to "${op.zone}"...`);

      // Find syllable in bank
      const syllableElement = page.locator(`[data-syllable="${op.syllable}"]`).first();

      // Find target zone
      const targetZone = page.locator('[data-zone-id]').filter({ hasText: op.zone }).first();

      // Perform drag and drop
      await syllableElement.dragTo(targetZone);
      await page.waitForTimeout(500);
    }

    console.log('✅ All syllables dragged');
    await page.screenshot({ path: 'tests/screenshots/04-dragdrop-filled.png', fullPage: true });

    // Click "Verificar Respuestas" button
    const verifyButton = page.locator('button').filter({ hasText: /Verificar/ });
    await verifyButton.click();
    console.log('✅ Clicked Verificar button');

    await page.waitForTimeout(1000);
    await page.screenshot({ path: 'tests/screenshots/05-dragdrop-verified.png', fullPage: true });

    // Check for success message
    const feedbackText = await page.locator('text=/correctamente|Perfecto/i').first().textContent();
    console.log('📢 Feedback:', feedbackText);

    // Check if it says 6/6 or "Perfecto"
    const isPerfect = feedbackText?.includes('Perfecto') || feedbackText?.includes('6');
    console.log(`✅ DragDrop result: ${isPerfect ? 'PASSED (6/6)' : 'FAILED'}`);

    // Wait for auto-advance to Activity 3
    await page.waitForTimeout(2000);

    // Activity 3: QuizGenerator - Just complete it
    console.log('🎯 Activity 3: QuizGenerator...');
    const quizButtons = page.locator('button').filter({ hasText: /^[A-D]\./ });
    if (await quizButtons.first().isVisible({ timeout: 5000 })) {
      const quizCount = await quizButtons.count();
      // Click first option for each question
      for (let i = 0; i < Math.min(5, quizCount); i++) {
        await quizButtons.first().click();
        await page.waitForTimeout(1000);
      }
      console.log('✅ Quiz completed');
    }

    // Wait for chapter completion
    await page.waitForTimeout(3000);
    await page.screenshot({ path: 'tests/screenshots/06-chapter1-done.png', fullPage: true });

    // Check if chapter 2 is unlocked
    console.log('🔓 Checking if chapter 2 is unlocked...');

    // Look for chapter 2 text
    const chapter2Text = await page.textContent('body');
    const isChapter2Blocked = chapter2Text?.includes('Capítulo bloqueado') || chapter2Text?.includes('bloqueado');

    console.log(`📊 Chapter 2 status: ${isChapter2Blocked ? 'STILL BLOCKED ❌' : 'UNLOCKED ✅'}`);

    // Check chapter progress
    const progressText = await page.locator('text=/Progreso|Progress/i').first().textContent();
    console.log('📈 Progress:', progressText);

    await page.screenshot({ path: 'tests/screenshots/07-final-state.png', fullPage: true });

    // Final assertions
    expect(isPerfect).toBeTruthy(); // DragDrop should be 6/6
    expect(isChapter2Blocked).toBeFalsy(); // Chapter 2 should be unlocked
  });
});
