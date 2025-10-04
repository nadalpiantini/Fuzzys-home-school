# Quick Start: Testing Literacy Level 1

## Current Status: ⚠️ Server Issues Blocking Tests

**The test infrastructure is complete and ready to use, but server startup issues prevent execution.**

## What's Ready

### ✅ Complete Test Suite
- **Full automated test**: `tests/e2e/literacy-level1.spec.ts`
- **Basic navigation test**: `tests/e2e/literacy-simple.spec.ts`
- **Manual inspection script**: `tests/manual-literacy-test.mjs`
- **Test configuration**: `playwright.test.config.ts`

### ✅ Test Coverage
The test validates:
1. ✅ Chapter 1 navigation and activity completion
2. ✅ DragDrop activity with 6 zones and syllables
3. ✅ "Verificar Respuestas" button functionality
4. ✅ Success message verification
5. ✅ Chapter progress tracking (100%/completado)
6. ✅ Chapter 2 unlocking logic
7. ✅ Screenshots at all key points

## What's Blocking

### ❌ Webpack Build Error
```
Error: Cannot find module './1869.js'
Location: /apps/web/.next/server/webpack-runtime.js
Impact: Page returns HTTP 500
```

### ❌ Next.js Config Error
```
ReferenceError: module is not defined in ES module scope
Location: /apps/web/next.config.js:165
Impact: Dev server startup fails
```

## How to Fix and Run

### Step 1: Fix the Build (Required)
```bash
# Clean Next.js cache
cd apps/web
rm -rf .next

# Try starting dev server
npm run dev
```

**If it fails**, check:
1. `/apps/web/src/app/learn/literacy/level1/page.tsx` for import errors
2. Missing dependencies or build issues

### Step 2: Run Tests

#### Option A: Full Test Suite
```bash
# Terminal 1: Start dev server (if not running)
cd apps/web && npm run dev

# Terminal 2: Run Playwright tests
npx playwright test tests/e2e/literacy-level1.spec.ts --config=playwright.test.config.ts --headed
```

#### Option B: Manual Inspection
```bash
# Ensure server is running on port 3000
node tests/manual-literacy-test.mjs
```

#### Option C: Basic Check
```bash
npx playwright test tests/e2e/literacy-simple.spec.ts --config=playwright.test.config.ts
```

## Expected Output

### When Working Correctly:
```
✓ Navigate to /learn/literacy/level1
✓ Complete Activity 1
✓ Complete Activity 2
✓ Complete DragDrop Activity (6/6 zones)
✓ Verify success message: "¡Perfecto! Has colocado todas las sílabas correctamente"
✓ Chapter 1 shows: "100%" or "completado"
✓ Chapter 2 unlocks (no "bloqueado")
✓ All 6 screenshots saved
```

### Screenshots Generated:
- `tests/screenshots/literacy-initial.png`
- `tests/screenshots/literacy-activity1-complete.png`
- `tests/screenshots/literacy-activity2-complete.png`
- `tests/screenshots/dragdrop-before-verify.png`
- `tests/screenshots/dragdrop-after-verify.png`
- `tests/screenshots/literacy-final-state.png`

## Debugging Tips

### Check Server Health
```bash
# Is server running?
lsof -i:3000

# Test page directly
curl -I http://localhost:3000/learn/literacy/level1
# Should return: HTTP 200 (not 500)
```

### View Logs
```bash
# Dev server output
# Look for webpack errors or missing modules

# Test output
npx playwright test --reporter=list
```

### Manual Browser Test
1. Open http://localhost:3000/learn/literacy/level1
2. Verify page loads (no 500 error)
3. Try completing DragDrop activity manually
4. Check if chapter 2 unlocks

## Need Help?

See full details in: `tests/LITERACY_TEST_REPORT.md`

## Quick Commands

```bash
# Fix build
cd apps/web && rm -rf .next && npm run dev

# Run full test
npx playwright test tests/e2e/literacy-level1.spec.ts --config=playwright.test.config.ts --headed

# Manual inspection
node tests/manual-literacy-test.mjs

# Check what's running
lsof -i:3000 -i:3001
```
