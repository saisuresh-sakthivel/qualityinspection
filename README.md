# Quality Inspection

Next.js 16 + React 19 take-home app for human-in-the-loop visual quality inspection.

## Project Details

The section headings below were drafted with an AI assistant. This note is my own account of the decisions in the app.

The task is one full-stack Next.js 16 app on React 19. Next.js 16 uses Turbopack for the dev server instead of webpack, so local reloads stay quick. Unit photos are classified with OpenAI `gpt-5.6-terra`. A reply is kept only when the label is one of Scratch, Dent, Paint Issue, Missing Component, or No Defect.

**Demo video:** `PASTE_DEMO_VIDEO_URL`

**Model cost:** `PASTE_MODEL_COST`

### Proxy

Next.js 16 puts the old middleware in `src/proxy.ts`. It runs before any page renders. Login writes the database role into the signed session cookie, and the proxy reads that cookie:

- A visitor with no session is sent to `/login`.
- A signed-in visitor who opens `/login` is sent to `/batches`.
- A Production Supervisor who opens `/batches/[batchId]/inspect`, including by typing the URL, is sent back to `/batches`.

Changing the role in the cookie breaks the signature, so the request is treated as logged out. API routes are outside the proxy matcher. Classify and save still return 403 from the route handlers when the caller is not a Quality Engineer.

### Suspense

The batch list, inspection list, dashboard, and inspect page each render the heading first and wrap the database read in `Suspense`. The visitor sees a loading line, then the rows or steps stream in, so the shell does not wait on Postgres.

### Icons

Icons come from Lucide (`lucide-react`). Each one is an inline SVG imported by name, such as the header mark, logout, upload, and step chevrons. The app does not ship an icon font.

### Theme

The UI is a dark theme with a dark red tone. Tokens live in `src/app/globals.css`: a reddish black background and red-500 for primary actions.

## Prerequisites

### 1. Node.js 22

```bash
nvm use 22
node -v   # expect v22.x
```

### 2. Docker (for Postgres)

Install Docker Desktop (or Docker Engine + Compose). Confirm:

```bash
docker --version
docker compose version
```

### 3. Start PostgreSQL

From the repo root:

```bash
docker compose up -d
```

This starts Postgres 16 on `localhost:5432` with:

| Setting   | Value               |
| --------- | ------------------- |
| User      | `qi`                |
| Password  | `qi`                |
| Database  | `qualityinspection` |
| Host port | `5432`              |

Stop it later with `docker compose down`. Data persists in the `qi_pg_data` volume unless you add `-v`.

### 4. Environment file

```bash
cp .env.example .env
```

Default `DATABASE_URL` matches the Compose service. Change it only if your Postgres differs.

### 5. Install dependencies

```bash
npm install
```

### 6. Run the app (UI draft)

```bash
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Login and roles

Open [http://localhost:3000/login](http://localhost:3000/login).

- Quality Engineer can create batches, upload a photo, and save an inspection.
- Production Supervisor can open the inspection list and dashboard only.
- Those restrictions are enforced on `POST /api/batches`, `POST /api/inspections/classify`, and `POST /api/inspections` (403), not only in the UI.

Set `AUTH_SECRET` in `.env` before logging in. The live classifier is OpenAI `gpt-5.6-terra` (`OPENAI_API_KEY`). Switch to Gemini `gemini-flash-latest` by importing `classifyUnitImage` from `src/ai/gemini.ts` instead of `src/ai/openai.ts`. Model replies are parsed with Zod and kept only when the label is one of Scratch, Dent, Paint Issue, Missing Component, or No Defect.

A Quality Engineer accepts that label or denies it with a different category. The save route copies the AI fields from the stored classification and sets `was_overridden` when the final label differs. Those columns are not taken from the browser.

## Quality checks

`npm install` runs `prepare`, which points Git at `.husky`. Every `git commit` then runs, in order:

1. Prettier and ESLint (`eslint` 10 with `eslint-config-next` 16) on the staged files
2. `npm test` — Vitest for the taxonomy, override flag, vision parse, and KPI rates
3. `npm run lint` — ESLint on the project
4. `npm run audit` — `npm audit --audit-level=high`

A failing step aborts the commit.

Confirm the hook is installed:

```bash
git config core.hooksPath   # .husky/_
test -x .husky/pre-commit && echo "pre-commit is active"
```

Run the same checks without committing:

```bash
npm test
npm run lint
npm run format:check
npm run audit
```

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS + tokens in `src/app/globals.css` (dark red)
- `next-intl` + `messages/en.json` for all UI strings
- Prisma + PostgreSQL

See `AGENTS.md` for coding guardrails.
