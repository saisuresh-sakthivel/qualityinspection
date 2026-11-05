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
- Prefer thin `page.tsx` files that compose components and call server helpers.

## Comments

- Every exported and non-trivial function must have a short JSDoc or block comment describing intent.
- Prefer “why” over restating the obvious.

## Styling

- Theme tokens (colors, font sizes) are defined only in `src/app/globals.css`.
- Do not introduce ad-hoc hex/rgb colors or font-size values in components.
- Visual theme is white + light blue. Avoid dark mode, purple gradients, and heavy decorative styling.
- Prefer few utility classes over elaborate style systems. No shadcn/ui unless explicitly requested.

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
