# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fuzzy's Home School is an educational platform with AI tutoring, gamified learning, and AR/QR Colonial Zone exploration. It's a monorepo using Turbo, with Next.js 14 for the web app, Supabase for backend, and DeepSeek AI for intelligent tutoring.

**⚠️ CRITICAL: Always read `DO_NOT_CHANGE.md` before making any architectural changes. This file documents intentional decisions that should NOT be modified.**

## Development Commands

```bash
# Install dependencies (from root)
npm install

# Development server (port 3000) - run from root or apps/web
npm run dev

# Build for production (runs validation checks first)
npm run build

# Preview deployment
npm run preview

# Production deployment
npm run ship

# Check deployment status
npm run status

# Rollback deployment
npm run rollback

# Start production server (from apps/web)
cd apps/web && npm run start

# Linting (from apps/web)
cd apps/web && npm run lint
cd apps/web && npm run lint:fix

# Type checking (from apps/web)
cd apps/web && npm run typecheck

# Code formatting (from apps/web)
cd apps/web && npm run format
cd apps/web && npm run format:check

# Clean build artifacts (from apps/web)
cd apps/web && npm run clean

# E2E testing with Playwright (from root)
npx playwright test
npx playwright test --ui        # With UI
npx playwright test --headed    # In headed mode
npx playwright test --debug     # Debug mode

# IMPORTANT: Use make commands for safe deployment
make validate      # Run pre-deployment checks
make deploy        # Safe production deployment
make sync          # Sync env vars to Vercel
make check-env     # Check environment status
make setup-env     # Initial environment setup
make clean         # Clean build artifacts
make reset         # Full reset (use with caution)
```

## 🔒 DEPLOYMENT PROTECTION SYSTEM

### Critical Pre-Deployment Checklist
```bash
# ALWAYS run these before deploying:
1. make validate    # Validates ALL requirements
2. make sync        # Syncs env vars to Vercel
3. make deploy      # Safe deployment with checks
```

### Required Environment Variables
ALL these variables MUST be set in both .env.local and Vercel:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Public anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side)
- `SUPABASE_JWT_SECRET` - JWT secret for auth
- `DEEPSEEK_API_KEY` - DeepSeek API key
- `DEEPSEEK_BASE_URL` - https://api.deepseek.com
- `DEEPSEEK_MODEL` - deepseek-chat
- `OPENAI_API_KEY` - Same as DEEPSEEK_API_KEY
- `OPENAI_BASE_URL` - https://api.deepseek.com
- `NEXT_PUBLIC_APP_URL` - Production URL
- Feature flags: All must be "true" or "false" (no spaces/newlines)

### Deployment Scripts
- `scripts/validate-deployment.sh` - Validates everything
- `scripts/sync-env-to-vercel.sh` - Syncs env vars
- `Makefile` - All deployment commands

### Emergency Recovery
```bash
make emergency-fix   # Bypass checks (emergency only)
make check-env       # Check current status
make setup-env       # Reset environment
```

## Architecture

### Monorepo Structure
- **Turbo-powered monorepo** with workspaces in `apps/*` and `packages/*`
- **Main application**: `apps/web` - Next.js 14 with App Router
- **Shared packages**:
  - `packages/ui` - Shared UI components
  - `packages/game-engine` - Quiz and game logic
  - `packages/schemas` - Zod validation schemas
  - `packages/i18n` - Internationalization
  - `packages/adaptive-engine` - AI-powered adaptive learning
  - `packages/creative-tools` - Content creation utilities
  - `packages/external-games` - Third-party game integrations
  - `packages/h5p-adapter` - H5P content integration
  - `packages/quiz-generator` - AI quiz generation
  - `packages/simulation-engine` - Interactive simulations
  - `packages/vr-ar-adapter` - VR/AR content support
  - `packages/sandbox-connector` - Sandboxed execution environment

### API Architecture
- **tRPC Router**: `apps/web/src/lib/trpc/router.ts` - Main API router
- **API Routes**: `apps/web/src/app/api/`
  - `/api/deepseek` - DeepSeek AI chat integration
  - `/api/games` - Game endpoints
  - `/api/quiz/generate` - Quiz generation
  - `/api/trpc/*` - tRPC endpoints

### Database & Auth
- **Supabase** for PostgreSQL, Auth, Storage, and Realtime
- **Database migrations**: `db/migrations/`
- **Vector extension** enabled for RAG features

### AI Integration
- **DeepSeek API** for AI tutoring (configured as OpenAI-compatible)
- Model: `deepseek-chat`
- Endpoint: `https://api.deepseek.com/v1/chat/completions`

### Frontend Stack
- **Next.js 14** with App Router
- **TypeScript** with strict mode
- **Tailwind CSS** + **shadcn/ui** components
- **Zustand** for state management
- **React Query** with tRPC
- **i18next** for Spanish/English support

### Special Features
- **AR/QR Integration**: AR.js, Three.js for Colonial Zone Rally
- **Maps**: Leaflet with OpenStreetMap
- **Games**: H5P, JClic, ClassQuiz integrations
- **Charts**: Chart.js for analytics
- **Calendar**: FullCalendar for scheduling

## Environment Configuration

Required environment variables in `apps/web/.env.local`:
- `NEXT_PUBLIC_SUPABASE_URL` - Supabase project URL
- `NEXT_PUBLIC_SUPABASE_ANON_KEY` - Supabase anon key
- `SUPABASE_SERVICE_ROLE_KEY` - Service role key (server-side)
- `DEEPSEEK_API_KEY` - DeepSeek API key
- `OPENAI_API_KEY` - Same as DEEPSEEK_API_KEY
- `OPENAI_BASE_URL` - Set to `https://api.deepseek.com`

## Key Application Routes

- `/` - Landing page
- `/student/*` - Student dashboard and features
- `/teacher/*` - Teacher dashboard and class management
- `/admin/*` - Admin panel
- `/games/*` - Educational games
- `/colonial-rally/*` - AR/QR exploration feature
- `/debug/*` - Debug pages (development only)

## Testing

- **E2E Testing**: Playwright configured for cross-browser testing
- **Test Directory**: `tests/e2e/`
- **Browsers**: Chrome, Firefox, Safari (desktop and mobile)
- **Test Server**: Automatically starts dev server on localhost:3000
- **Configuration**: `playwright.config.ts` in project root

## Code Quality

- **ESLint**: Configured with Next.js, React, and TypeScript rules
- **Prettier**: Code formatting with consistent style
- **Husky**: Git hooks for pre-commit validation
- **Lint-staged**: Runs linting and formatting on staged files
- **TypeScript**: Strict mode enabled with comprehensive type checking

## Deployment Notes

- **Output**: Standalone mode for edge deployment
- **Image optimization**: Disabled for Cloudflare Pages compatibility
- **Locales**: Spanish (default) and English
- **Transpiled packages**: All workspace packages are transpiled
- **Webpack fallbacks**: Node.js modules disabled for browser compatibility
- **Sentry**: Error tracking and performance monitoring configured
# important-instruction-reminders
Do what has been asked; nothing more, nothing less.
NEVER create files unless they're absolutely necessary for achieving your goal.
ALWAYS prefer editing an existing file to creating a new one.
NEVER proactively create documentation files (*.md) or README files. Only create documentation files if explicitly requested by the User.