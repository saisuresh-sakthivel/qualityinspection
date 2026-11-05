# Quality Inspection

Next.js 16 + React 19 take-home app for human-in-the-loop visual quality inspection.

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

| Setting  | Value              |
|----------|--------------------|
| User     | `qi`               |
| Password | `qi`               |
| Database | `qualityinspection`|
| Host port| `5432`             |

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

## Database

Prisma schema: `prisma/schema.prisma`. Seed script: `prisma/seed.ts`.

```bash
npx prisma generate
npx prisma migrate dev
npm run db:seed
```

Seed creates:

| Kind | Data |
|------|------|
| Users | `priya` / `engineer` — Priya Singh, Quality Engineer. `alex` / `supervisor` — Alex Chen, Production Supervisor. |
| Batches | `BATCH-001` Steel Bracket — Model X200 / Line 3 (from the brief). `BATCH-002` Aluminum Housing — Model H50 / Line 1. |

Re-running `npm run db:seed` upserts the same rows.

## Login and roles

Open [http://localhost:3000/login](http://localhost:3000/login).

- Quality Engineer can create batches, upload a photo, and save an inspection.
- Production Supervisor can open the inspection list and dashboard only.
- Those restrictions are enforced on `POST /api/batches`, `POST /api/inspections/classify`, and `POST /api/inspections` (403), not only in the UI.

Set `AUTH_SECRET` in `.env` before logging in. Set `GEMINI_API_KEY` before analyzing a photo. The vision model is Gemini `gemini-flash-latest`, called with the `X-goog-api-key` header.

## Still to build

Inspection list filters, KPI dashboard, Vitest, and the pre-commit hook.

## Stack

- Next.js 16 App Router, React 19, TypeScript
- Tailwind CSS + tokens in `src/app/globals.css` (white / light blue)
- `next-intl` + `messages/en.json` for all UI strings
- Prisma + PostgreSQL (schema only in this draft)

See `AGENTS.md` for coding guardrails.
