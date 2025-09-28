# Fuzzy's Home School Project Overview

## Purpose
Educational platform with AI tutoring, gamified learning, and AR/QR Colonial Zone exploration. Built for the Dominican Republic education system with Spanish/English support.

## Tech Stack
- **Framework**: Next.js 14 with App Router
- **Language**: TypeScript with strict mode
- **Database**: Supabase (PostgreSQL with vector extension)
- **AI**: DeepSeek API (OpenAI-compatible)
- **UI**: Tailwind CSS + shadcn/ui components
- **State**: Zustand
- **API**: tRPC with React Query
- **Monorepo**: Turbo with workspaces
- **i18n**: i18next for Spanish/English
- **Special**: AR.js, Three.js, Leaflet maps

## Project Structure
- `apps/web/` - Main Next.js application
- `packages/game-engine/` - Game logic and types
- `packages/ui/` - Shared UI components
- `packages/schemas/` - Zod validation schemas
- `packages/i18n/` - Internationalization

## Current Game Types
Already implemented in the project:
1. MCQ (Multiple Choice)
2. TrueFalse
3. ShortAnswer
4. DragDrop
5. Hotspot
6. ImageSequence
7. GapFill
8. Crossword
9. WordSearch
10. MemoryCards
11. Flashcards
12. BranchingScenario
13. Timeline
14. MindMap
15. LiveQuiz
16. TeamChallenge
17. ColonialRally
18. MathSolver
19. CodeChallenge
20. Match

## Game Components Location
`apps/web/src/components/games/` - All game UI components