# Code Style and Conventions

## TypeScript
- Strict mode enabled
- Use type imports: `import type { ... }`
- Interfaces for props, types for unions/enums
- Naming: PascalCase for components/types, camelCase for functions/variables

## React Components
- Functional components with hooks
- Named exports for components
- Props interface naming: `ComponentNameProps`
- Use `'use client'` directive for client components

## File Organization
- Components in `src/components/`
- Game components in `src/components/games/`
- Hooks in `src/hooks/`
- Types in `src/types/`
- API routes in `src/app/api/`

## Imports
- Absolute imports with `@/` for src directory
- Package imports from workspace: `@fuzzy/game-engine`

## Styling
- Tailwind CSS classes
- shadcn/ui components
- class-variance-authority for variant styles
- clsx for conditional classes

## State Management
- Zustand for global state
- React Query with tRPC for server state
- useState/useReducer for local state