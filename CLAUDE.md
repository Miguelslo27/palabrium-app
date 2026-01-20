# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Palabrium is a storytelling platform built with Next.js 15, React 19, MongoDB, and Clerk authentication.

## Commands

```bash
pnpm dev              # Start dev server (Turbopack)
pnpm build            # Production build
pnpm lint             # ESLint
pnpm validate         # lint + build (run before pushing)

# Testing
pnpm test             # Unit tests
pnpm test:watch       # Unit tests in watch mode
pnpm test -- -t "test name"  # Run single test by name
pnpm test:integration # Integration tests (requires ENABLE_INTEGRATION_DB=true)
pnpm test:coverage:all # All tests with combined coverage
```

## Architecture

### Data Layer Pattern
The codebase uses a two-tier data access pattern:

1. **Data Layer** (`src/lib/data/`) - Direct MongoDB access for Server Components
   - `stories.ts`, `chapters.ts`, `comments.ts`
   - Pure data functions that take userId as parameter
   - Used by Server Components and Server Actions

2. **Server Actions** (`src/app/actions.ts`) - Mutations with auth
   - Wraps data layer functions with Clerk auth checks
   - Handles `revalidatePath()` for cache invalidation
   - Use with `useTransition()` in Client Components

### Models
Mongoose schemas in `src/models/`:
- **Story**: title, description, authorId, published, bravos (likes), chapters (1:N relation)
- **Chapter**: title, content, storyId, order, published
- **Comment**: content, storyId, userId
- **User**: synced from Clerk via webhook

### Authentication
- Clerk middleware in `src/middleware.ts`
- Protected routes: `/stories/mine`, `/story/new`, `/story/[id]/edit`
- Auth routes redirect logged-in users to home

### Testing
- **Unit tests**: `__tests__/unit/` - jsdom environment, mocked dependencies
- **Integration tests**: `__tests__/integration/` - MongoDB Memory Server, real database operations
- Integration tests require `ENABLE_INTEGRATION_DB=true` env var
- Test helpers in `__tests__/integration/helpers/` for DB setup/teardown

### Git Hooks
Pre-push hook runs: lint → all tests with coverage → build
