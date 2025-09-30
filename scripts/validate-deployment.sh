#!/bin/bash

# =====================================================
# 🔒 DEPLOYMENT VALIDATION SCRIPT v2.0
# =====================================================
# Este script valida TODAS las condiciones necesarias
# para un deployment exitoso
# =====================================================

set -e  # Exit on any error

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo "🔒 =========================================="
echo "🔒 FUZZY'S HOME SCHOOL - DEPLOYMENT VALIDATOR"
echo "🔒 =========================================="
echo ""

# Track validation status
VALIDATION_PASSED=true
ERRORS=()
WARNINGS=()

# =====================================================
# 1. CHECK ENVIRONMENT VARIABLES
# =====================================================
echo "📋 Checking Environment Variables..."

REQUIRED_VARS=(
    "NEXT_PUBLIC_SUPABASE_URL"
    "NEXT_PUBLIC_SUPABASE_ANON_KEY"
    "SUPABASE_SERVICE_ROLE_KEY"
    "SUPABASE_JWT_SECRET"
    "DEEPSEEK_API_KEY"
    "DEEPSEEK_BASE_URL"
    "DEEPSEEK_MODEL"
    "OPENAI_API_KEY"
    "OPENAI_BASE_URL"
    "NEXT_PUBLIC_APP_URL"
    "NEXT_PUBLIC_POOL_MIN_READY"
    "POOL_TARGET_LIBRARY"
    "POOL_BACKGROUND_BATCH"
    "NEXT_PUBLIC_AR_ENABLED"
    "NEXT_PUBLIC_BLOCKLY_ENABLED"
    "NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED"
    "NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED"
    "NEXT_PUBLIC_PHET_ENABLED"
)

# Load .env.local if exists
if [ -f .env.local ]; then
    export $(cat .env.local | grep -v '^#' | xargs)
else
    echo -e "${RED}❌ .env.local not found!${NC}"
    VALIDATION_PASSED=false
    ERRORS+=(".env.local file is missing")
fi

# Check each required variable
for VAR in "${REQUIRED_VARS[@]}"; do
    if [ -z "${!VAR}" ]; then
        echo -e "${RED}  ❌ Missing: $VAR${NC}"
        VALIDATION_PASSED=false
        ERRORS+=("Environment variable $VAR is not set")
    else
        echo -e "${GREEN}  ✅ Found: $VAR${NC}"
    fi
done

# =====================================================
# 2. CHECK VERCEL CONFIGURATION
# =====================================================
echo ""
echo "📋 Checking Vercel Configuration..."

if command -v vercel &> /dev/null; then
    echo -e "${GREEN}  ✅ Vercel CLI installed${NC}"

    # Check if linked to project
    if vercel env ls production &> /dev/null; then
        echo -e "${GREEN}  ✅ Vercel project linked${NC}"

        # Count env vars in Vercel
        ENV_COUNT=$(vercel env ls production | grep -c "Production" || true)
        if [ "$ENV_COUNT" -lt "${#REQUIRED_VARS[@]}" ]; then
            echo -e "${YELLOW}  ⚠️  Only $ENV_COUNT env vars in Vercel (expected ${#REQUIRED_VARS[@]})${NC}"
            WARNINGS+=("Vercel has fewer env vars than expected")
        else
            echo -e "${GREEN}  ✅ All env vars configured in Vercel${NC}"
        fi
    else
        echo -e "${RED}  ❌ Not linked to Vercel project${NC}"
        ERRORS+=("Run: vercel link")
    fi
else
    echo -e "${RED}  ❌ Vercel CLI not installed${NC}"
    ERRORS+=("Run: npm install -g vercel")
fi

# =====================================================
# 3. CHECK GIT STATUS
# =====================================================
echo ""
echo "📋 Checking Git Status..."

# Check for uncommitted changes
if [ -n "$(git status --porcelain)" ]; then
    echo -e "${YELLOW}  ⚠️  Uncommitted changes detected${NC}"
    WARNINGS+=("You have uncommitted changes")
    git status --short
else
    echo -e "${GREEN}  ✅ Working directory clean${NC}"
fi

# Check current branch
CURRENT_BRANCH=$(git branch --show-current)
if [ "$CURRENT_BRANCH" != "main" ]; then
    echo -e "${YELLOW}  ⚠️  Not on main branch (current: $CURRENT_BRANCH)${NC}"
    WARNINGS+=("Deploying from branch: $CURRENT_BRANCH")
else
    echo -e "${GREEN}  ✅ On main branch${NC}"
fi

# Check if up to date with remote
git fetch origin main &> /dev/null
LOCAL=$(git rev-parse HEAD)
REMOTE=$(git rev-parse origin/main)
if [ "$LOCAL" != "$REMOTE" ]; then
    echo -e "${YELLOW}  ⚠️  Local branch not in sync with remote${NC}"
    WARNINGS+=("Pull or push changes before deploying")
else
    echo -e "${GREEN}  ✅ In sync with remote${NC}"
fi

# =====================================================
# 4. CHECK BUILD
# =====================================================
echo ""
echo "📋 Testing Build..."

# Run type check
echo "  Running type check..."
if npm run typecheck &> /dev/null; then
    echo -e "${GREEN}  ✅ TypeScript check passed${NC}"
else
    echo -e "${RED}  ❌ TypeScript errors found${NC}"
    VALIDATION_PASSED=false
    ERRORS+=("Fix TypeScript errors: npm run typecheck")
fi

# Run lint
echo "  Running lint..."
if npm run lint &> /dev/null; then
    echo -e "${GREEN}  ✅ Lint check passed${NC}"
else
    echo -e "${YELLOW}  ⚠️  Lint warnings found${NC}"
    WARNINGS+=("Fix lint issues: npm run lint")
fi

# Test build
echo "  Testing production build..."
if npm run build &> /dev/null; then
    echo -e "${GREEN}  ✅ Build successful${NC}"
else
    echo -e "${RED}  ❌ Build failed${NC}"
    VALIDATION_PASSED=false
    ERRORS+=("Fix build errors: npm run build")
fi

# =====================================================
# 5. CHECK DEPENDENCIES
# =====================================================
echo ""
echo "📋 Checking Dependencies..."

# Check for security vulnerabilities
AUDIT_RESULT=$(npm audit --audit-level=high 2>&1 | grep "found" || echo "0 vulnerabilities")
if [[ "$AUDIT_RESULT" == *"0 vulnerabilities"* ]]; then
    echo -e "${GREEN}  ✅ No high/critical vulnerabilities${NC}"
else
    echo -e "${YELLOW}  ⚠️  $AUDIT_RESULT${NC}"
    WARNINGS+=("Run: npm audit fix")
fi

# =====================================================
# 6. VALIDATE SUPABASE
# =====================================================
echo ""
echo "📋 Checking Supabase Connection..."

# Test Supabase URL
if [ ! -z "$NEXT_PUBLIC_SUPABASE_URL" ]; then
    if curl -s "$NEXT_PUBLIC_SUPABASE_URL/rest/v1/" &> /dev/null; then
        echo -e "${GREEN}  ✅ Supabase URL reachable${NC}"
    else
        echo -e "${RED}  ❌ Cannot reach Supabase${NC}"
        ERRORS+=("Supabase URL may be incorrect")
    fi
fi

# =====================================================
# FINAL REPORT
# =====================================================
echo ""
echo "🔒 =========================================="
echo "🔒 VALIDATION REPORT"
echo "🔒 =========================================="

if [ ${#ERRORS[@]} -gt 0 ]; then
    echo -e "${RED}❌ ERRORS FOUND:${NC}"
    for error in "${ERRORS[@]}"; do
        echo -e "${RED}  • $error${NC}"
    done
fi

if [ ${#WARNINGS[@]} -gt 0 ]; then
    echo -e "${YELLOW}⚠️  WARNINGS:${NC}"
    for warning in "${WARNINGS[@]}"; do
        echo -e "${YELLOW}  • $warning${NC}"
    done
fi

if [ "$VALIDATION_PASSED" = true ]; then
    echo ""
    echo -e "${GREEN}✅ =========================================="
    echo -e "✅ DEPLOYMENT VALIDATION PASSED!"
    echo -e "✅ Safe to deploy to production"
    echo -e "✅ ==========================================${NC}"
    echo ""
    echo "To deploy, run:"
    echo "  vercel --prod"
    exit 0
else
    echo ""
    echo -e "${RED}❌ =========================================="
    echo -e "❌ DEPLOYMENT VALIDATION FAILED!"
    echo -e "❌ Fix errors before deploying"
    echo -e "❌ ==========================================${NC}"
    exit 1
fi