# AGENTS.md (repo-wide)

This is a Next.js App Router frontend (`src/app`) using:

- Next.js 15 + React 19
- TypeScript (`strict: true`)
- Tailwind CSS v4 (CSS-first config in `src/app/globals.css`)
- shadcn/Radix UI primitives under `src/components/ui/**`
- React Query (`@tanstack/react-query`)
- A generated CMS SDK (`@cms/sdk`)

These notes are for agentic coding assistants working in this repo.

## Commands

### Install

- Install deps (CI-parity): `npm ci`
- Regenerate lockfile (only if needed): `npm install`

### Dev

- Dev server (turbopack): `npm run dev`
- Dev server with TLS: `npm run dev:tls`

### Build / Start

- Production build: `npm run build`
  - Build is `next build --no-lint` (lint is separate).
- Start prod server (after build): `npm run start`

### Lint

- Lint all: `npm run lint`
- Lint and autofix: `npm run lint -- --fix`
- Lint one file: `npm run lint -- --file src/app/(home)/page.tsx`
- Lint one directory: `npm run lint -- --dir src/components`

### Format (Prettier)

- Write formatting: `npx prettier --write .`
- Check formatting (CI-style): `npx prettier --check .`

### Typecheck

There is no `typecheck` script.

- TypeScript check: `npx tsc --noEmit`

### Tests

There is currently **no configured test runner**:

- No `jest.config.*`, `vitest.config.*`, `playwright.config.*`, `cypress.config.*`
- No `*.test.*` / `*.spec.*` files

If a runner is added, also add scripts to `package.json` and update this section with:

- `npm test`
- “single test” examples, e.g.
  - Vitest: `npx vitest src/foo.test.ts -t "case name"`
  - Jest: `npx jest src/foo.test.ts -t "case name"`
  - Playwright: `npx playwright test path/to/spec --grep "case name"`

## Project Layout

- `src/app/**` — App Router routes/layouts/pages.
- `src/components/**` — shared UI components.
  - `src/components/ui/**` — shadcn/Radix primitives.
- `src/providers/**` — React context providers.
- `src/lib/**` — small utilities (`cn()` lives in `src/lib/utils.ts`).
- `src/i18n/**` — localization hooks.
- `public/**`, `src/assets/**` — static assets.

## Code Style

### Next.js / React

- Prefer Server Components by default; add `"use client"` only when needed.
- Keep `"use client"` modules focused (UI + hooks); avoid importing server-only modules there.
- Prefer function components + hooks.
- Use `Suspense` boundaries when rendering async/streamed content.

### Imports

- Order imports top-to-bottom:
  1. React/Next (`react`, `next/*`)
  2. Third-party packages (`@tanstack/*`, `@radix-ui/*`, `lucide-react`, etc.)
  3. Internal `@/*` aliases
  4. Relative imports
- Separate groups with a blank line.
- Use `import type { ... } from "..."` for type-only imports.
- Prefer `@/*` path alias (configured in `tsconfig.json`).

### Types

- Prefer `type` over `interface` unless you need declaration merging.
- Avoid `any`; prefer `unknown` at boundaries and narrow intentionally.
- Derive DOM/component props via React helpers:
  - `React.ComponentProps<"button">`
  - `React.ComponentProps<typeof Button>`
- Export prop types when used outside the file.

### Naming

- Components: `PascalCase`.
- Hooks: `useX`.
- Files/folders:
  - Routes: `page.tsx`, `layout.tsx`.
  - Component folders typically `PascalCase/ComponentName.tsx`.
- Variables/functions: `camelCase`.
- Constants: `SCREAMING_SNAKE_CASE` only for true constants.

### Error Handling

- Throw explicit errors for invariant violations/programmer mistakes.
  - Example pattern: hooks throwing when provider is missing.
- In event handlers, never leave unhandled promise rejections:
  - `void doAsync().catch(handleError)`
  - or `doAsync().catch(() => {/* intentionally ignored */})` with a short rationale.
- Avoid silently swallowing errors unless UX explicitly requires it.

### React Query

- React Query is wired in `src/app/providers.tsx`.
- Prefer stable query keys and targeted invalidation.
  - Example keys: `["carts"]`, `["carts", cartId]`.
- Avoid invalidating overly broad keys if not needed.

### Styling (Tailwind)

- Prefer Tailwind utilities over custom CSS.
- `src/app/globals.css` defines tokens (breakpoints/colors) via Tailwind v4 `@theme`.
- Use `cn()` from `src/lib/utils.ts` for conditional/merged classes.
- For long class lists, prefer multi-line template literals for readability.

### Formatting

- Prettier config is in `package.json` (2 spaces, semicolons, trailing commas).
- `.editorconfig` enforces LF + trims trailing whitespace.

### Linting

- ESLint uses `eslint.config.mjs` with `next/core-web-vitals` and `next/typescript`.
- Keep code compatible with Next.js lint rules (hooks, `next/link`, etc.).

## Runtime Notes

- `next.config.ts` rewrites `/api/*` and `/media/*` to stage; be careful changing request paths.
- `turbopack.root` is `resolve("../")`; avoid repo-structure changes without validating.
- `@cms/sdk` is transpiled via `transpilePackages`.

## Cursor / Copilot Rules

No Cursor/Copilot instruction files were found:

- No `.cursorrules`
- No `.cursor/rules/**`
- No `.github/copilot-instructions.md`

If these files are added later, summarize their requirements here.
