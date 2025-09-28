#!/usr/bin/env node

/**
 * Environment Variables Security Audit Script
 *
 * This script re-evaluates environment variable security,
 * detects leaks, missing variables, and hardcoded secrets.
 *
 * Usage:
 *   node scripts/sanity/env-audit.mjs
 *   npm run env:audit
 */

import { readFile, readdir } from 'fs/promises';
import { join, dirname } from 'path';
import { fileURLToPath } from 'url';
import { glob } from 'glob';

const __dirname = dirname(fileURLToPath(import.meta.url));
const PROJECT_ROOT = join(__dirname, '../..');

// Security patterns to detect
const SECURITY_PATTERNS = {
  hardcodedSecrets: [
    /https:\/\/[a-z0-9]+\.supabase\.co/g,
    /eyJ[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*\.[A-Za-z0-9_-]*/g,
    /sk-[a-zA-Z0-9]{32,}/g,
    /xoxb-[0-9]{11,}-[0-9]{11,}-[a-zA-Z0-9]{24}/g
  ],
  envUsage: /process\.env\.([A-Z_][A-Z0-9_]*)/g,
  clientDirective: /"use client"/g,
  serviceRoleUsage: /SUPABASE_SERVICE_ROLE_KEY|SUPABASE_JWT_SECRET/g
};

// Required environment variables
const REQUIRED_VARS = {
  public: [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY',
    'NEXT_PUBLIC_APP_URL'
  ],
  private: [
    'SUPABASE_SERVICE_ROLE_KEY',
    'DEEPSEEK_API_KEY'
  ],
  optional: [
    'NEXT_PUBLIC_WEBSOCKET_URL',
    'NEXT_PUBLIC_VERCEL_ANALYTICS_ID',
    'DATABASE_URL',
    'SUPABASE_JWT_SECRET'
  ]
};

class EnvAuditor {
  constructor() {
    this.issues = {
      hardcodedSecrets: [],
      clientLeaks: [],
      missingVars: [],
      namingInconsistencies: [],
      exposureRisks: []
    };
    this.stats = {
      filesScanned: 0,
      envFilesFound: 0,
      variablesDetected: new Set(),
      criticalIssues: 0
    };
  }

  async audit() {
    console.log('🔍 Starting Environment Variables Security Audit...\n');

    try {
      await this.scanEnvFiles();
      await this.scanSourceCode();
      await this.validateVariables();
      await this.checkNamingConsistency();

      this.generateReport();

    } catch (error) {
      console.error('❌ Audit failed:', error.message);
      process.exit(1);
    }
  }

  async scanEnvFiles() {
    console.log('📁 Scanning environment files...');

    const envFiles = await glob('.env*', {
      cwd: PROJECT_ROOT,
      ignore: ['node_modules/**', '.git/**']
    });

    this.stats.envFilesFound = envFiles.length;
    console.log(`   Found ${envFiles.length} env files`);

    for (const file of envFiles) {
      await this.checkEnvFile(join(PROJECT_ROOT, file));
    }
  }

  async checkEnvFile(filePath) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const lines = content.split('\n');

      lines.forEach((line, index) => {
        if (line.includes('=') && !line.startsWith('#')) {
          const [key] = line.split('=');
          if (key) this.stats.variablesDetected.add(key.trim());
        }
      });
    } catch (error) {
      // Ignore unreadable files
    }
  }

  async scanSourceCode() {
    console.log('🔍 Scanning source code...');

    const sourceFiles = await glob('**/*.{js,ts,jsx,tsx}', {
      cwd: PROJECT_ROOT,
      ignore: [
        'node_modules/**',
        '.next/**',
        'dist/**',
        'build/**',
        '.git/**',
        'reports/**'
      ]
    });

    this.stats.filesScanned = sourceFiles.length;
    console.log(`   Scanning ${sourceFiles.length} source files`);

    for (const file of sourceFiles) {
      await this.scanFile(join(PROJECT_ROOT, file));
    }
  }

  async scanFile(filePath) {
    try {
      const content = await readFile(filePath, 'utf-8');
      const relativePath = filePath.replace(PROJECT_ROOT + '/', '');

      // Check for hardcoded secrets
      this.checkHardcodedSecrets(content, relativePath);

      // Check for client-side environment usage
      this.checkClientSideUsage(content, relativePath);

      // Check for service role usage in client context
      this.checkServiceRoleLeaks(content, relativePath);

    } catch (error) {
      // Ignore unreadable files
    }
  }

  checkHardcodedSecrets(content, filePath) {
    SECURITY_PATTERNS.hardcodedSecrets.forEach(pattern => {
      const matches = content.match(pattern);
      if (matches) {
        matches.forEach(match => {
          this.issues.hardcodedSecrets.push({
            file: filePath,
            value: this.maskSecret(match),
            type: this.getSecretType(match),
            severity: 'critical'
          });
          this.stats.criticalIssues++;
        });
      }
    });
  }

  checkClientSideUsage(content, filePath) {
    const hasClientDirective = SECURITY_PATTERNS.clientDirective.test(content);
    const envMatches = [...content.matchAll(SECURITY_PATTERNS.envUsage)];

    if (hasClientDirective && envMatches.length > 0) {
      envMatches.forEach(match => {
        const varName = match[1];
        if (!varName.startsWith('NEXT_PUBLIC_')) {
          this.issues.clientLeaks.push({
            file: filePath,
            variable: varName,
            context: 'client-component',
            severity: 'high'
          });
          this.stats.criticalIssues++;
        }
      });
    }
  }

  checkServiceRoleLeaks(content, filePath) {
    const serviceRoleMatches = [...content.matchAll(SECURITY_PATTERNS.serviceRoleUsage)];
    const hasClientDirective = SECURITY_PATTERNS.clientDirective.test(content);

    if (serviceRoleMatches.length > 0) {
      const isServerContext = filePath.includes('/api/') ||
                             filePath.includes('/server') ||
                             filePath.includes('/scripts/');

      if (!isServerContext || hasClientDirective) {
        this.issues.exposureRisks.push({
          file: filePath,
          issue: 'service-role-in-client-context',
          severity: hasClientDirective ? 'critical' : 'medium'
        });

        if (hasClientDirective) {
          this.stats.criticalIssues++;
        }
      }
    }
  }

  async validateVariables() {
    console.log('✅ Validating required variables...');

    // Check missing required variables
    const definedVars = Array.from(this.stats.variablesDetected);

    [...REQUIRED_VARS.public, ...REQUIRED_VARS.private].forEach(requiredVar => {
      if (!definedVars.includes(requiredVar)) {
        this.issues.missingVars.push({
          variable: requiredVar,
          type: REQUIRED_VARS.public.includes(requiredVar) ? 'public' : 'private',
          severity: 'medium'
        });
      }
    });
  }

  async checkNamingConsistency() {
    console.log('🔤 Checking naming consistency...');

    // Check for SUPABASE_SERVICE_KEY vs SUPABASE_SERVICE_ROLE_KEY
    const definedVars = Array.from(this.stats.variablesDetected);

    if (definedVars.includes('SUPABASE_SERVICE_KEY') &&
        definedVars.includes('SUPABASE_SERVICE_ROLE_KEY')) {
      this.issues.namingInconsistencies.push({
        issue: 'Multiple variations of SUPABASE service key',
        variables: ['SUPABASE_SERVICE_KEY', 'SUPABASE_SERVICE_ROLE_KEY'],
        recommendation: 'Use SUPABASE_SERVICE_ROLE_KEY consistently'
      });
    }
  }

  maskSecret(value) {
    if (value.length <= 8) return '****';
    return value.substring(0, 4) + '****' + value.substring(value.length - 4);
  }

  getSecretType(value) {
    if (value.includes('supabase.co')) return 'supabase_url';
    if (value.startsWith('eyJ')) return 'jwt_token';
    if (value.startsWith('sk-')) return 'openai_key';
    if (value.startsWith('xoxb-')) return 'slack_token';
    return 'unknown_secret';
  }

  generateReport() {
    console.log('\n' + '='.repeat(60));
    console.log('🔐 ENVIRONMENT VARIABLES SECURITY AUDIT REPORT');
    console.log('='.repeat(60));

    console.log(`\n📊 SCAN SUMMARY:`);
    console.log(`   Files scanned: ${this.stats.filesScanned}`);
    console.log(`   Env files found: ${this.stats.envFilesFound}`);
    console.log(`   Variables detected: ${this.stats.variablesDetected.size}`);
    console.log(`   Critical issues: ${this.stats.criticalIssues}`);

    // Critical Issues
    if (this.stats.criticalIssues > 0) {
      console.log(`\n🚨 CRITICAL ISSUES (${this.stats.criticalIssues}):`);
    }

    if (this.issues.hardcodedSecrets.length > 0) {
      console.log(`\n💀 HARDCODED SECRETS (${this.issues.hardcodedSecrets.length}):`);
      this.issues.hardcodedSecrets.forEach(issue => {
        console.log(`   ❌ ${issue.file}: ${issue.type} = ${issue.value}`);
      });
    }

    if (this.issues.clientLeaks.length > 0) {
      console.log(`\n🔓 CLIENT-SIDE LEAKS (${this.issues.clientLeaks.length}):`);
      this.issues.clientLeaks.forEach(issue => {
        console.log(`   ❌ ${issue.file}: ${issue.variable} (${issue.context})`);
      });
    }

    if (this.issues.exposureRisks.length > 0) {
      console.log(`\n⚠️  EXPOSURE RISKS (${this.issues.exposureRisks.length}):`);
      this.issues.exposureRisks.forEach(issue => {
        console.log(`   ⚠️  ${issue.file}: ${issue.issue}`);
      });
    }

    if (this.issues.missingVars.length > 0) {
      console.log(`\n❓ MISSING VARIABLES (${this.issues.missingVars.length}):`);
      this.issues.missingVars.forEach(issue => {
        console.log(`   ❓ ${issue.variable} (${issue.type})`);
      });
    }

    if (this.issues.namingInconsistencies.length > 0) {
      console.log(`\n🔤 NAMING ISSUES (${this.issues.namingInconsistencies.length}):`);
      this.issues.namingInconsistencies.forEach(issue => {
        console.log(`   🔤 ${issue.issue}: ${issue.variables.join(', ')}`);
        console.log(`      → ${issue.recommendation}`);
      });
    }

    // Overall Status
    console.log('\n' + '='.repeat(60));
    if (this.stats.criticalIssues === 0) {
      console.log('✅ SECURITY STATUS: PASSED');
      console.log('   No critical security issues detected.');
    } else {
      console.log('🚨 SECURITY STATUS: FAILED');
      console.log(`   ${this.stats.criticalIssues} critical issues require immediate attention.`);
    }

    console.log('\n📋 NEXT STEPS:');
    if (this.issues.hardcodedSecrets.length > 0) {
      console.log('   1. Remove all hardcoded secrets immediately');
    }
    if (this.issues.clientLeaks.length > 0) {
      console.log('   2. Move private variables to server-side context');
    }
    if (this.issues.missingVars.length > 0) {
      console.log('   3. Configure missing environment variables');
    }
    if (this.issues.namingInconsistencies.length > 0) {
      console.log('   4. Standardize variable naming conventions');
    }

    console.log('\n   For detailed fix instructions, see: reports/patch_plan.md');
    console.log('='.repeat(60));

    // Exit with error code if critical issues found
    if (this.stats.criticalIssues > 0) {
      process.exit(1);
    }
  }
}

// Run the audit
const auditor = new EnvAuditor();
auditor.audit().catch(error => {
  console.error('💥 Audit script failed:', error);
  process.exit(1);
});