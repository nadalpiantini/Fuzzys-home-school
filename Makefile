# =====================================================
# 🔒 FUZZY'S HOME SCHOOL - DEPLOYMENT MAKEFILE
# =====================================================
# Comandos seguros para deployment sin errores
# =====================================================

.PHONY: help validate sync deploy emergency-fix setup-env check-env

# Default target
help:
	@echo "🔒 =========================================="
	@echo "🔒 FUZZY'S HOME SCHOOL - DEPLOYMENT COMMANDS"
	@echo "🔒 =========================================="
	@echo ""
	@echo "Available commands:"
	@echo "  make validate      - Run all deployment validations"
	@echo "  make sync          - Sync env vars to Vercel"
	@echo "  make deploy        - Full production deployment (safe)"
	@echo "  make emergency-fix - Emergency deployment bypass"
	@echo "  make setup-env     - Initial environment setup"
	@echo "  make check-env     - Check environment status"
	@echo ""
	@echo "Quick deployment:"
	@echo "  make deploy        - This runs everything safely"
	@echo ""

# Validate everything before deployment
validate:
	@echo "🔍 Running deployment validation..."
	@./scripts/validate-deployment.sh

# Sync environment variables to Vercel
sync:
	@echo "🔄 Syncing environment variables..."
	@./scripts/sync-env-to-vercel.sh

# Full safe deployment
deploy: validate
	@echo "🚀 Starting safe deployment..."
	@echo "Step 1: Checking git status..."
	@git status --short
	@echo ""
	@echo "Step 2: Running tests..."
	@npm run typecheck
	@npm run lint
	@echo ""
	@echo "Step 3: Building..."
	@npm run build
	@echo ""
	@echo "Step 4: Deploying to Vercel..."
	@vercel --prod
	@echo ""
	@echo "✅ Deployment complete!"
	@echo "Check: https://vercel.com/nadalpiantini-fcbc2d66/web"

# Emergency deployment (skip some checks)
emergency-fix:
	@echo "⚠️  EMERGENCY DEPLOYMENT MODE"
	@echo "This bypasses some safety checks!"
	@read -p "Are you sure? (type 'yes' to continue): " confirm && [ "$$confirm" = "yes" ] || exit 1
	@echo "Deploying..."
	@vercel --prod --force
	@echo "✅ Emergency deployment complete"

# Initial setup
setup-env:
	@echo "📋 Setting up environment..."
	@if [ ! -f .env.local ]; then \
		cp .env.example .env.local; \
		echo "✅ Created .env.local from template"; \
		echo "⚠️  Please edit .env.local with your actual values"; \
	else \
		echo "✅ .env.local already exists"; \
	fi
	@echo ""
	@echo "Installing Vercel CLI..."
	@npm install -g vercel || echo "Vercel already installed"
	@echo ""
	@echo "Linking to Vercel project..."
	@vercel link || echo "Already linked"
	@echo ""
	@echo "✅ Setup complete!"

# Check current environment status
check-env:
	@echo "📋 Environment Status:"
	@echo ""
	@echo "Local files:"
	@ls -la .env* 2>/dev/null || echo "No env files found"
	@echo ""
	@echo "Git status:"
	@git status --short || echo "Clean"
	@echo ""
	@echo "Vercel env vars:"
	@vercel env ls production | head -20 || echo "Not linked to Vercel"
	@echo ""
	@echo "Last deployment:"
	@vercel ls --limit 1 || echo "No deployments found"

# Clean build artifacts
clean:
	@echo "🧹 Cleaning build artifacts..."
	@rm -rf .next
	@rm -rf node_modules/.cache
	@npm run clean
	@echo "✅ Cleaned"

# Full reset (use with caution)
reset: clean
	@echo "🔄 Full reset..."
	@rm -rf node_modules
	@npm install
	@echo "✅ Reset complete"