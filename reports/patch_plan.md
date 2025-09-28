# 🔧 Environment Variables Fix Plan

**Project**: Fuzzy's Home School
**Plan Date**: 2025-09-28
**Priority**: CRITICAL - Server hardcoded secrets still exposed

---

## 🚨 IMMEDIATE FIXES REQUIRED

### 1. Fix Hardcoded Secrets in server.ts
**File**: `apps/web/src/lib/supabase/server.ts`
**Status**: 🚨 CRITICAL - Contains hardcoded fallbacks

**Current Code** (Lines 3-8):
```typescript
export const createServerClient = () => {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://ggntuptvqxditgxtnsex.supabase.co',
    process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImdnbnR1cHR2cXhkaXRneHRuc2V4Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTkwMTAxMTYsImV4cCI6MjA3NDU4NjExNn0.pVVcvkFYRWb8STJB5OV-EQKSiPqSVO0gjfcbnCcTrt8'
  )
}
```

**Fixed Code** (Apply same pattern as client.ts):
```typescript
import { createClient } from '@supabase/supabase-js'

export const createServerClient = () => {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url) {
    throw new Error("Missing NEXT_PUBLIC_SUPABASE_URL in server context");
  }

  if (!serviceKey) {
    throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY in server context");
  }

  return createClient(url, serviceKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
  });
}
```

---

## 🔄 VARIABLE NAMING STANDARDIZATION

### 2. Fix Inconsistent Variable Names in Scripts

**Files to Update**:

#### A. `scripts/seed-games.ts` (Line 11)
**Current**:
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
```
**Fixed**:
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
```

#### B. `apps/web/scripts/seed-games.ts` (Line 9)
**Current**:
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
```
**Fixed**:
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
if (!supabaseServiceKey) {
  throw new Error("Missing SUPABASE_SERVICE_ROLE_KEY");
}
```

#### C. `apps/web/scripts/run-migrations.ts` (Line 10)
**Current**:
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY!;
```
**Fixed**:
```typescript
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
```

#### D. Update Error Messages in `scripts/seed-games.ts` (Lines 15-16)
**Current**:
```typescript
console.error('   NEXT_PUBLIC_SUPABASE_URL');
console.error('   SUPABASE_SERVICE_KEY');
```
**Fixed**:
```typescript
console.error('   NEXT_PUBLIC_SUPABASE_URL');
console.error('   SUPABASE_SERVICE_ROLE_KEY');
```

---

## 🏗️ ARCHITECTURE IMPROVEMENTS

### 3. Refactor Client Services to Server Actions

These services are currently accessing environment variables directly from potentially client-side contexts:

#### A. `apps/web/src/services/adaptive/AdaptiveService.ts`
**Current Issue**: Direct env access from service
**Solution**: Create server action wrapper

**Create**: `apps/web/src/app/actions/adaptive.ts`
```typescript
"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function getAdaptiveRecommendations(userId: string, subject: string) {
  const supabase = createServerClient();

  // Move AdaptiveService logic here
  // Remove direct env access from AdaptiveService.ts
}
```

#### B. `apps/web/src/services/externalGames.ts`
**Current Issue**: Direct env access from service
**Solution**: Create server action wrapper

**Create**: `apps/web/src/app/actions/external-games.ts`
```typescript
"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function getExternalGames() {
  const supabase = createServerClient();

  // Move externalGames logic here
  // Remove direct env access from externalGames.ts
}
```

#### C. `apps/web/src/services/quiz/QuizService.ts`
**Current Issue**: Direct env access from service
**Solution**: Create server action wrapper

**Create**: `apps/web/src/app/actions/quiz.ts`
```typescript
"use server";

import { createServerClient } from "@/lib/supabase/server";

export async function getQuizData(quizId: string) {
  const supabase = createServerClient();

  // Move QuizService logic here
  // Remove direct env access from QuizService.ts
}
```

---

## 🆕 MISSING ENVIRONMENT VARIABLES

### 4. Add Missing Variables

#### A. Add WebSocket Configuration
**File**: `.env.local` and `apps/web/.env.local`
```bash
# WebSocket Configuration
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001
```

**Production**:
```bash
NEXT_PUBLIC_WEBSOCKET_URL=wss://your-websocket-domain.com
```

---

## 📝 ENVIRONMENT FILE UPDATES

### 5. Create Comprehensive .env.example

**File**: `/.env.example` (Root level)
```bash
# Supabase Configuration
NEXT_PUBLIC_SUPABASE_URL=your_supabase_project_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_JWT_SECRET=your_supabase_jwt_secret

# AI Configuration
DEEPSEEK_API_KEY=your_deepseek_api_key
OPENAI_API_KEY=your_deepseek_api_key
OPENAI_BASE_URL=https://api.deepseek.com

# Database
DATABASE_URL=your_database_connection_string

# App Configuration
NEXT_PUBLIC_APP_URL=http://localhost:3000
NODE_ENV=development

# WebSocket (if using multiplayer features)
NEXT_PUBLIC_WEBSOCKET_URL=ws://localhost:3001

# External Games Integration (Optional)
NEXT_PUBLIC_EXTERNAL_GAMES_ENABLED=true
NEXT_PUBLIC_PHET_ENABLED=true
NEXT_PUBLIC_BLOCKLY_ENABLED=true
NEXT_PUBLIC_MUSIC_BLOCKS_ENABLED=true
NEXT_PUBLIC_AR_ENABLED=true

# AR Configuration (Optional)
NEXT_PUBLIC_AR_MARKER_BASE_URL=/ar-markers
NEXT_PUBLIC_AR_MODELS_BASE_URL=/models

# External Services URLs (Optional)
NEXT_PUBLIC_PHET_BASE_URL=https://phet.colorado.edu
NEXT_PUBLIC_PHET_LANGUAGE=es
NEXT_PUBLIC_BLOCKLY_BASE_URL=https://blockly.games
NEXT_PUBLIC_BLOCKLY_LANGUAGE=es
NEXT_PUBLIC_MUSIC_BLOCKS_URL=https://musicblocks.sugarlabs.org

# Analytics (Optional)
NEXT_PUBLIC_VERCEL_ANALYTICS_ID=
```

---

## 🧪 TESTING PLAN

### 6. Validation Steps After Fixes

#### A. Environment Validation
1. Test server.ts without hardcoded fallbacks
2. Verify all scripts use consistent variable names
3. Test missing variable error handling

#### B. Functionality Testing
1. Test Supabase server client creation
2. Test all modified scripts
3. Test service refactoring (if applied)

#### C. Security Validation
1. Verify no hardcoded secrets remain
2. Test that services work with server actions
3. Verify client can't access server-only variables

---

## 🛠️ IMPLEMENTATION ORDER

### Phase 1: Critical Security (Do Today)
1. ✅ **Fix server.ts hardcoded secrets** (5 minutes)
2. ✅ **Standardize variable names in scripts** (10 minutes)
3. ✅ **Test basic functionality** (15 minutes)

### Phase 2: Architecture (This Week)
4. **Add missing WEBSOCKET_URL** (5 minutes)
5. **Refactor client services** (2-4 hours)
6. **Create server actions** (2-4 hours)

### Phase 3: Automation (Next Sprint)
7. **Create env validation script** (1 hour)
8. **Add pre-commit hooks** (30 minutes)
9. **Document setup procedures** (1 hour)

---

## 🔍 VERIFICATION COMMANDS

After applying fixes, run these commands to verify:

```bash
# Check for remaining hardcoded secrets
grep -r "ggntuptvqxditgxtnsex\|eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9" apps/web/src/ || echo "✅ No hardcoded secrets found"

# Check variable name consistency
grep -r "SUPABASE_SERVICE_KEY" . --exclude-dir=node_modules || echo "✅ All variables use consistent naming"

# Test environment loading
npm run build:env-check || echo "⚠️ Environment validation needed"
```

---

**⚠️ CRITICAL**: Apply Phase 1 fixes immediately to secure the application. Server.ts currently exposes production secrets.