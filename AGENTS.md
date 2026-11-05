<!-- BEGIN:nextjs-agent-rules -->

## This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

# Project guardrails

Follow these rules for every change in this repository.

## Stack

- Next.js 16 App Router only (`src/app`). Do not add Pages Router.
- React 19.
- TypeScript strict.
- Tailwind CSS for layout utilities only.
- `next-intl` for all user-facing text. Strings live in `messages/en.json` — never hardcode UI copy.
- Prisma + PostgreSQL for persistence. Do not invent a second data layer.
- Keep the project lean. No unused libraries, dead abstractions, or speculative features.

## Code organization

- UI components live under `src/components/` and must be imported from there (e.g. `@/components/...`).
- Domain logic lives under `src/domain/`.
- Shared TypeScript data shapes live under `src/types/`.
- Server helpers live under `src/lib/`.
- Browser calls to this app's route handlers go through `src/lib/apiClient.ts` only. Do not call `fetch` on `/api/...` from a component.
- Prefer thin `page.tsx` files that compose components. Pages do not query the database.

## Comments

- Every exported and non-trivial function must have a short JSDoc or block comment describing intent.
- Prefer “why” over restating the obvious.

## Styling

- Theme tokens (colors, font sizes) are defined only in `src/app/globals.css`.
- Do not introduce ad-hoc hex/rgb colors or font-size values in components.
- Visual theme is white + light blue. Avoid dark mode, purple gradients, and heavy decorative styling.
- Prefer few utility classes over elaborate style systems. No shadcn/ui unless explicitly requested.

## Data access

- Prisma queries and `prisma.$transaction` blocks live only in `src/app/api/**/route.ts`.
- Pages and components must not import the Prisma client. They call a function exported from the route module that owns that query.
- Do not `fetch` this app's own API during render. A Server Component calls the route function in the same request so the dev server cannot deadlock on itself.
- Client calls to those routes go through `src/lib/apiClient.ts`. `apiFetch` throws `ApiError` for every non-2xx response (including 400, 401, and 500) and leaves the `code` for the caller to present.
- Outbound provider calls, such as the vision model, stay next to that provider. They are not app route calls.
- Session lookup in `src/lib/auth.ts` is the exception. Route handlers use it to identify the caller before they query.

## Role-gated UI

- Show or hide a role-specific control in a Server Component.
- Read the session on the server. If the role does not match, return `null`.
- A client component may own interaction (open a dialog, upload a file) only after that server check has already passed. It must not decide the role itself.

## Data & types

- Domain entities (`User`, `Batch`, `Inspection`, defect taxonomy, KPIs) must have TypeScript definitions in `src/types/`.
- Validate AI / API payloads with Zod where constrained output matters.
- Never overwrite AI prediction fields when a human overrides.

## Auth

- Login screen with two seeded users. No OAuth, signup, or invites.
- Session cookie is set only after a successful login and cleared on logout.
- Enforce `QUALITY_ENGINEER` on the server for batch create and inspection classify/save. UI hiding alone is not enough.
- Production Supervisor may view list and dashboard only.

## Out of scope unless asked

- Full auth product (OAuth, signup, invites, password reset).
- Python / FastAPI services.
- NL reporting, batch edit/close workflows, retry queues.
