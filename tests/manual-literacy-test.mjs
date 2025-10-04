import { chromium } from 'playwright';

async function testLiteracyFlow() {
  console.log('🚀 Starting Literacy Level 1 Test...\n');

  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext({
    viewport: { width: 1280, height: 720 }
  });
  const page = await context.newPage();

  try {
    // Navigate to the page
    console.log('📍 Navigating to http://localhost:3000/learn/literacy/level1...');
    await page.goto('http://localhost:3000/learn/literacy/level1', {
      timeout: 30000,
      waitUntil: 'networkidle'
    });

    console.log('✅ Page loaded successfully\n');

    // Take initial screenshot
    await page.screenshot({ path: 'tests/screenshots/01-initial.png', fullPage: true });
    console.log('📸 Screenshot saved: 01-initial.png\n');

    // Wait a bit for any dynamic content
    await page.waitForTimeout(2000);

    // Get page content for analysis
    const bodyText = await page.textContent('body');
    console.log('📄 Page Content Preview:');
    console.log(bodyText.substring(0, 500));
    console.log('...\n');

    // Check for chapter structure
    const hasChapterContent = bodyText.includes('enye') ||
                              bodyText.includes('Capítulo') ||
                              bodyText.includes('Chapter');
    console.log(`📚 Has chapter content: ${hasChapterContent}\n`);

    // Look for drag-drop zones
    const dropZones = await page.locator('[data-zone-id], .drop-zone, [class*="dropZone"], [class*="DropZone"]').count();
    console.log(`🎯 Found ${dropZones} drop zones\n`);

    // Look for draggable items
    const draggables = await page.locator('[draggable="true"], .draggable, [class*="draggable"]').count();
    console.log(`✋ Found ${draggables} draggable items\n`);

    // Look for buttons
    const buttons = await page.locator('button').all();
    console.log(`🔘 Found ${buttons.length} buttons:`);
    for (let i = 0; i < Math.min(buttons.length, 10); i++) {
      const text = await buttons[i].textContent();
      console.log(`   - "${text?.trim()}"`);
    }
    console.log('');

    // Take final screenshot
    await page.screenshot({ path: 'tests/screenshots/02-analysis.png', fullPage: true });
    console.log('📸 Screenshot saved: 02-analysis.png\n');

    // Report findings
    console.log('📊 TEST SUMMARY:');
    console.log('================');
    console.log(`✓ Page URL: ${page.url()}`);
    console.log(`✓ Chapter content detected: ${hasChapterContent}`);
    console.log(`✓ Drop zones found: ${dropZones}`);
    console.log(`✓ Draggable items found: ${draggables}`);
    console.log(`✓ Total buttons: ${buttons.length}`);
    console.log('\n✅ Test completed successfully!\n');

    // Keep browser open for manual inspection
    console.log('💡 Browser will stay open for 30 seconds for manual inspection...');
    await page.waitForTimeout(30000);

  } catch (error) {
    console.error('❌ Error during test:', error.message);
    await page.screenshot({ path: 'tests/screenshots/error.png', fullPage: true });
    console.log('📸 Error screenshot saved: error.png');
  } finally {
    await browser.close();
    console.log('\n👋 Browser closed. Test finished.');
  }
}

// Run the test
testLiteracyFlow().catch(console.error);
