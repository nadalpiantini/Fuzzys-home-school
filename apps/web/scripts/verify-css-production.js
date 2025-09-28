#!/usr/bin/env node

/**
 * 🎨 CSS Production Verification Script
 *
 * Verifica que los estilos CSS se generen correctamente en producción
 * y que no se pierdan las clases personalizadas.
 */

import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const CSS_DIR = path.join(__dirname, '../.next/static/css');
const EXPECTED_VARIABLES = [
  '--earth-50',
  '--earth-100',
  '--earth-200',
  '--earth-300',
  '--earth-400',
  '--earth-500',
  '--earth-600',
  '--earth-700',
  '--earth-800',
  '--earth-900',
];
const EXPECTED_CLASSES = ['.btn-earth', '.card-minimal', '.glass'];
const MIN_CSS_SIZE = 40000; // 40KB mínimo

function findCSSFiles() {
  if (!fs.existsSync(CSS_DIR)) {
    console.error('❌ CSS directory not found:', CSS_DIR);
    process.exit(1);
  }

  const files = fs
    .readdirSync(CSS_DIR)
    .filter((file) => file.endsWith('.css'))
    .map((file) => path.join(CSS_DIR, file));

  return files;
}

function verifyCSSFile(filePath) {
  const content = fs.readFileSync(filePath, 'utf8');
  const stats = fs.statSync(filePath);
  const sizeKB = Math.round(stats.size / 1024);

  console.log(`📄 Verifying: ${path.basename(filePath)} (${sizeKB}KB)`);

  // Verificar tamaño mínimo
  if (stats.size < MIN_CSS_SIZE) {
    console.warn(
      `⚠️  CSS file is smaller than expected (${sizeKB}KB < ${Math.round(MIN_CSS_SIZE / 1024)}KB)`,
    );
  }

  // Verificar variables CSS
  const missingVariables = EXPECTED_VARIABLES.filter(
    (variable) => !content.includes(variable),
  );

  if (missingVariables.length > 0) {
    console.error(`❌ Missing CSS variables: ${missingVariables.join(', ')}`);
    return false;
  }

  // Verificar clases personalizadas
  const missingClasses = EXPECTED_CLASSES.filter(
    (className) => !content.includes(className),
  );

  if (missingClasses.length > 0) {
    console.error(`❌ Missing CSS classes: ${missingClasses.join(', ')}`);
    return false;
  }

  // Verificar que incluye Tailwind base
  if (
    !content.includes('@tailwind base') &&
    !content.includes('box-sizing:border-box')
  ) {
    console.warn('⚠️  Tailwind base styles may be missing');
  }

  // Verificar que incluye utilidades
  if (!content.includes('display:flex') && !content.includes('display:grid')) {
    console.warn('⚠️  Tailwind utilities may be missing');
  }

  console.log('✅ CSS file verification passed');
  return true;
}

function main() {
  console.log('🎨 CSS Production Verification');
  console.log('==============================');

  const cssFiles = findCSSFiles();

  if (cssFiles.length === 0) {
    console.error('❌ No CSS files found in production build');
    process.exit(1);
  }

  console.log(`📁 Found ${cssFiles.length} CSS file(s)`);

  let allPassed = true;

  for (const file of cssFiles) {
    if (!verifyCSSFile(file)) {
      allPassed = false;
    }
    console.log(''); // Empty line for readability
  }

  if (allPassed) {
    console.log('🎉 All CSS files passed verification!');
    console.log('✅ Production styles are correctly generated');
  } else {
    console.error('❌ CSS verification failed!');
    console.error('🔧 Check Tailwind configuration and rebuild');
    process.exit(1);
  }
}

// Run if this is the main module
if (import.meta.url === `file://${process.argv[1]}`) {
  main();
}

export { verifyCSSFile, findCSSFiles };
