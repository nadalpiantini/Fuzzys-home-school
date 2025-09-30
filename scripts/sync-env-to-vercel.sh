#!/bin/bash

# =====================================================
# 🔄 VERCEL ENV SYNC SCRIPT
# =====================================================
# Sincroniza TODAS las variables de .env.local con Vercel
# de forma segura y automatizada
# =====================================================

set -e

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}🔄 =========================================="
echo "🔄 VERCEL ENVIRONMENT SYNC"
echo -e "🔄 ==========================================${NC}"
echo ""

# Check if .env.local exists
if [ ! -f .env.local ]; then
    echo -e "${RED}❌ .env.local not found!${NC}"
    echo "Please create .env.local with your actual values"
    exit 1
fi

# Check if vercel CLI is installed
if ! command -v vercel &> /dev/null; then
    echo -e "${RED}❌ Vercel CLI not installed!${NC}"
    echo "Run: npm install -g vercel"
    exit 1
fi

# Check if linked to project
if ! vercel env ls production &> /dev/null; then
    echo -e "${RED}❌ Not linked to Vercel project!${NC}"
    echo "Run: vercel link"
    exit 1
fi

echo -e "${YELLOW}⚠️  WARNING: This will sync ALL variables from .env.local to Vercel production${NC}"
read -p "Continue? (y/N): " -n 1 -r
echo
if [[ ! $REPLY =~ ^[Yy]$ ]]; then
    echo "Cancelled"
    exit 0
fi

echo ""
echo "📤 Syncing environment variables..."

# Required variables list
declare -a REQUIRED_VARS=(
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

# Load .env.local
export $(cat .env.local | grep -v '^#' | xargs)

SUCCESS_COUNT=0
FAIL_COUNT=0

# Process each variable
for VAR in "${REQUIRED_VARS[@]}"; do
    VALUE="${!VAR}"

    if [ -z "$VALUE" ]; then
        echo -e "${RED}  ❌ $VAR is not set in .env.local${NC}"
        ((FAIL_COUNT++))
        continue
    fi

    # Remove any existing variable first (to update value)
    echo -n "  Updating $VAR... "

    # Use printf to avoid newlines
    if printf "%s" "$VALUE" | vercel env add "$VAR" production --force 2>/dev/null; then
        echo -e "${GREEN}✅${NC}"
        ((SUCCESS_COUNT++))
    else
        # Try removing first then adding (in case it exists)
        yes | vercel env rm "$VAR" production 2>/dev/null || true
        if printf "%s" "$VALUE" | vercel env add "$VAR" production 2>/dev/null; then
            echo -e "${GREEN}✅${NC}"
            ((SUCCESS_COUNT++))
        else
            echo -e "${RED}❌${NC}"
            ((FAIL_COUNT++))
        fi
    fi
done

echo ""
echo "🔄 =========================================="
echo "🔄 SYNC COMPLETE"
echo "🔄 =========================================="
echo -e "${GREEN}✅ Success: $SUCCESS_COUNT variables${NC}"
if [ $FAIL_COUNT -gt 0 ]; then
    echo -e "${RED}❌ Failed: $FAIL_COUNT variables${NC}"
fi

echo ""
echo "Next steps:"
echo "1. Verify in Vercel dashboard: https://vercel.com/nadalpiantini-fcbc2d66/web/settings/environment-variables"
echo "2. Run deployment validation: ./scripts/validate-deployment.sh"
echo "3. Deploy to production: vercel --prod"

exit 0