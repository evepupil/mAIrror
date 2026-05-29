# GEMINI.md

This file provides guidance to Gemini CLI when working with code in this repository.

## Project Overview

NextDevTpl is a production-ready Next.js SaaS template. It provides a complete foundation for building SaaS products with authentication, payments, credits system, background job processing, i18n, admin panel, support tickets, and more. Clone, customize, and ship.

**Deployment:** Self-hosted or Vercel + Neon PostgreSQL + Cloudflare R2 (storage)

## Commands

```bash
pnpm dev              # Dev server (Turbopack)
pnpm build            # Production build
pnpm lint             # Biome lint
pnpm format           # Biome format
pnpm check            # Biome check + autofix
pnpm typecheck        # tsc --noEmit
pnpm db:push          # Push Drizzle schema to database
pnpm db:generate      # Generate Drizzle migrations
pnpm db:migrate       # Run Drizzle migrations
pnpm db:studio        # Open Drizzle Studio GUI
pnpm test             # Vitest (watch mode)
pnpm test:run         # Vitest (single run)
pnpm test:ui          # Vitest (UI mode)
pnpm test:run -- src/test/path/to/file.test.ts  # Run single test file
pnpm test:coverage    # Vitest with coverage
```

Tests live in `src/test/` (not colocated), run sequentially to avoid DB race conditions, with 30s timeout for integration tests. Test env vars loaded from `.env.test`.

## AI Engineering Guardrails

### Scope
- These rules apply to AI-assisted code changes in this repository.
- Keep changes focused on the current task. Do not perform unrelated broad refactors.
- If historical code does not meet these rules, improve only the touched area unless the task explicitly asks for cleanup.

### Project Toolchain
- Language/runtime: TypeScript (strict), Node.js, React 19, Next.js 16 (App Router)
- Package/build tool: pnpm
- Test framework: Vitest (sequential, 30s timeout, `.env.test` env)
- Static/types: `pnpm typecheck` (tsc --noEmit)
- Lint/format: `pnpm lint` / `pnpm format` / `pnpm check` (Biome)
- Build: `pnpm build` (next build)

### Type, Static, and Build Checks
- Run `pnpm typecheck` before reporting completion when code changes affect behavior or public contracts.
- Run `pnpm lint` on changed files to catch unused imports, unused variables, and explicit `any` usage.
- Run `pnpm build` when changes affect route structure, API endpoints, or build-time dependencies.

### Verification Before Completion
- Never claim work is complete, fixed, or passing without running the relevant verification commands and confirming their output.
- Evidence before assertions: run `pnpm typecheck`, `pnpm lint`, and `pnpm test:run` (or targeted tests) before reporting success.
- When adding new routes or API endpoints, run `pnpm build` to verify no build-time errors.
- If verification fails, fix the issues and re-verify before reporting completion.

### Formatting and Linting
- Biome: double quotes, semicolons, trailing commas (ES5), 2-space indent, 80 char line width.
- Strict lint rules: `noExplicitAny: error`, `noUnusedImports: error`, `noUnusedVariables: error`, `useImportType: error`.
- Do not run `pnpm format` on the whole repo when historical formatting drift would create unrelated churn.
- At minimum, keep touched files consistent with nearby code and avoid introducing new lint noise.

### Tests
- Bug fixes should include a regression test when practical.
- New behavior should include unit, integration, or smoke coverage appropriate to the risk.
- Tests go in `src/test/<feature>/` following the existing directory structure.
- Tests run sequentially; avoid shared mutable state across tests without proper setup/teardown.
- If tests cannot be added or run, explain the reason and provide a manual verification path.

### AI Pre-commit Review
- Before AI-assisted commits, review the staged diff with `git diff --cached`.
- Check for missing tests, boundary cases, permission/auth risks, data consistency issues, accidental broad changes, and secrets.
- Verify that Server Actions use the correct action tier (`actionClient`, `protectedAction`, `adminAction`).
- Fix critical or major findings before committing, or explicitly report why they remain.

### Commit Messages
- Use Conventional Commits: `<type>(<scope>): <summary>`.
- Prefer `feat`, `fix`, `refactor`, `test`, `docs`, `chore`, `build`, `ci`, `perf`, or `revert`.
- Generate the final message from the actual diff, not from an earlier plan.

### Project-Specific Rules
- **Server Components by default** — only add `"use client"` when interactivity is needed.
- **Data fetching in RSC** — Server Components call Drizzle directly; mutations use Server Actions.
- **i18n navigation** — Import `Link`, `redirect`, `usePathname`, `useRouter` from `@/i18n/routing` (not `next/link` or `next/navigation`).
- **API route wrapping** — Use `withApiLogging(handler)` from `@/lib/api-logger.ts`.
- **Optional services degrade gracefully** — Rate limiting, Axiom logging, Sentry monitoring all check env vars and silently skip when unconfigured.
- **Path alias** — `@/*` maps to `src/*`.
- **Chinese comments** — Comments throughout the codebase use Chinese; code identifiers and strings use English.
- **Feature modules** — New features go in `src/features/<name>/` with `components/`, `actions/`, `hooks/`, `types/`, and `index.ts`.
- **Safe actions** — Use `actionClient` (base), `protectedAction` (auth), or `adminAction` (admin role) from `@/lib/safe-action.ts`.
- **Database IDs** — All tables use `text` primary keys with `nanoid()` defaults.
