# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Fuzzy's Home School is an educational platform with AI tutoring, gamified learning, and AR/QR Colonial Zone exploration. It's a monorepo using Turbo, with Next.js 14 for the web app, Supabase for backend, and DeepSeek AI for intelligent tutoring.

## Development Commands

```bash
# Install dependencies (from root)
npm install

# Development server (port 3000)
npm run dev

# Build for production
npm run build

# Start production server
npm run start

# Linting
npm run lint

# Clean build artifacts
npm run clean

# Deploy to Vercel (recommended)
npm run deploy:vercel

# Deploy to Netlify
npm run deploy:netlify
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

## Deployment Notes

- **Output**: Standalone mode for edge deployment
- **Image optimization**: Disabled for Cloudflare Pages compatibility
- **Locales**: Spanish (default) and English
- **Transpiled packages**: All workspace packages are transpiled
- **Webpack fallbacks**: Node.js modules disabled for browser compatibility