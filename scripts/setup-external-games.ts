#!/usr/bin/env tsx

/**
 * Setup script for external games integration
 * This script helps configure the new external games packages and their dependencies
 */

import { execSync } from 'child_process';
import { writeFileSync, readFileSync, existsSync } from 'fs';
import { join } from 'path';

const PROJECT_ROOT = process.cwd();
const TURBO_CONFIG = join(PROJECT_ROOT, 'turbo.json');

function log(message: string) {
  console.log(`🚀 ${message}`);
}

function error(message: string) {
  console.error(`❌ ${message}`);
}

function success(message: string) {
  console.log(`✅ ${message}`);
}

async function main() {
  log('Setting up external games integration...');

  // Step 1: Install dependencies for all new packages
  log('Installing dependencies for new packages...');

  const packages = [
    'packages/external-games',
    'packages/simulation-engine',
    'packages/creative-tools',
    'packages/vr-ar-adapter',
  ];

  for (const pkg of packages) {
    try {
      log(`Installing dependencies for ${pkg}...`);
      execSync('npm install', {
        cwd: join(PROJECT_ROOT, pkg),
        stdio: 'inherit'
      });
      success(`Dependencies installed for ${pkg}`);
    } catch (err) {
      error(`Failed to install dependencies for ${pkg}: ${err}`);
    }
  }

  // Step 2: Update turbo.json to include new packages
  log('Updating turbo.json configuration...');

  try {
    if (existsSync(TURBO_CONFIG)) {
      const turboConfig = JSON.parse(readFileSync(TURBO_CONFIG, 'utf-8'));

      // Add external games packages to pipeline
      if (!turboConfig.pipeline['@fuzzy/external-games#build']) {
        turboConfig.pipeline['@fuzzy/external-games#build'] = {
          "dependsOn": ["^build"],
          "outputs": ["dist/**"]
        };
      }

      if (!turboConfig.pipeline['@fuzzy/simulation-engine#build']) {
        turboConfig.pipeline['@fuzzy/simulation-engine#build'] = {
          "dependsOn": ["@fuzzy/external-games#build"],
          "outputs": ["dist/**"]
        };
      }

      if (!turboConfig.pipeline['@fuzzy/creative-tools#build']) {
        turboConfig.pipeline['@fuzzy/creative-tools#build'] = {
          "dependsOn": ["@fuzzy/external-games#build"],
          "outputs": ["dist/**"]
        };
      }

      if (!turboConfig.pipeline['@fuzzy/vr-ar-adapter#build']) {
        turboConfig.pipeline['@fuzzy/vr-ar-adapter#build'] = {
          "dependsOn": ["@fuzzy/external-games#build"],
          "outputs": ["dist/**"]
        };
      }

      writeFileSync(TURBO_CONFIG, JSON.stringify(turboConfig, null, 2));
      success('Updated turbo.json configuration');
    }
  } catch (err) {
    error(`Failed to update turbo.json: ${err}`);
  }

  // Step 3: Build all packages
  log('Building all external games packages...');

  try {
    execSync('npm run build', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit'
    });
    success('All packages built successfully');
  } catch (err) {
    error(`Build failed: ${err}`);
  }

  // Step 4: Run Supabase migrations
  log('Running database migrations for external games...');

  try {
    execSync('npx supabase migration up', {
      cwd: join(PROJECT_ROOT, 'apps/web'),
      stdio: 'inherit'
    });
    success('Database migrations completed');
  } catch (err) {
    error(`Migration failed: ${err}. You may need to run this manually.`);
  }

  // Step 5: Generate TypeScript types
  log('Generating TypeScript types...');

  try {
    execSync('npm run typecheck', {
      cwd: PROJECT_ROOT,
      stdio: 'inherit'
    });
    success('TypeScript types generated successfully');
  } catch (err) {
    error(`Type generation failed: ${err}`);
  }

  // Step 6: Create example environment variables
  log('Creating example environment variables...');

  const exampleEnv = `
# External Games Integration
NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED=true
NEXT_PUBLIC_PHET_ENABLED=true
NEXT_PUBLIC_BLOCKLY_ENABLED=true
NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED=true
NEXT_PUBLIC_AR_ENABLED=true

# AR.js Configuration (optional)
NEXT_PUBLIC_AR_MARKER_BASE_URL=/ar-markers
NEXT_PUBLIC_AR_MODELS_BASE_URL=/models

# PhET Configuration (optional)
NEXT_PUBLIC_PHET_BASE_URL=https://phet.colorado.edu
NEXT_PUBLIC_PHET_LANGUAGE=es

# Blockly Configuration (optional)
NEXT_PUBLIC_BLOCKLY_BASE_URL=https://blockly.games
NEXT_PUBLIC_BLOCKLY_LANGUAGE=es

# Music Blocks Configuration (optional)
NEXT_PUBLIC_MUSIC_BLOCKS_URL=https://musicblocks.sugarlabs.org
`;

  const envExamplePath = join(PROJECT_ROOT, 'apps/web/.env.example.external-games');

  try {
    writeFileSync(envExamplePath, exampleEnv.trim());
    success('Created .env.example.external-games file');
  } catch (err) {
    error(`Failed to create example env file: ${err}`);
  }

  // Step 7: Display setup summary
  console.log('\n🎉 External Games Integration Setup Complete!\n');

  console.log('📚 What was installed:');
  console.log('  • @fuzzy/external-games - Base wrapper and tracking system');
  console.log('  • @fuzzy/simulation-engine - PhET simulations integration');
  console.log('  • @fuzzy/creative-tools - Blockly and Music Blocks');
  console.log('  • @fuzzy/vr-ar-adapter - AR.js Colonial Zone experience');

  console.log('\n🔧 Next Steps:');
  console.log('  1. Copy environment variables from .env.example.external-games to .env.local');
  console.log('  2. Visit /games/external to test the integration');
  console.log('  3. Configure Supabase database if not done already');
  console.log('  4. Add AR markers and 3D models to your public directory');

  console.log('\n📖 Resources Added:');
  console.log('  • PhET Simulations: Physics, Chemistry, Math simulations');
  console.log('  • Blockly Games: Visual programming challenges');
  console.log('  • Music Blocks: Creative music and math programming');
  console.log('  • AR Colonial Zone: Dominican Republic historical sites');
  console.log('  • 100+ ready-to-use educational activities');

  console.log('\n🚀 Start Development:');
  console.log('  npm run dev');

  success('Setup completed successfully! Happy coding! 🎉');
}

// Error handling
process.on('uncaughtException', (err) => {
  error(`Uncaught exception: ${err.message}`);
  process.exit(1);
});

process.on('unhandledRejection', (reason) => {
  error(`Unhandled rejection: ${reason}`);
  process.exit(1);
});

// Run the setup
main().catch((err) => {
  error(`Setup failed: ${err.message}`);
  process.exit(1);
});