# ISTE NEXUS — Full-Stack + AI/ML Platform

A production-grade student council / event / certification system for the
**MHSSCOE ISTE Student Chapter**, built with **Next.js**, **Prisma +
PostgreSQL**, **Supabase**, and a genuine **LLM-powered intelligence layer**
(semantic search, RAG assistant, hybrid recommendations, fraud/anomaly
heuristics).

## Architecture

```
src/app/page.tsx            → Landing page (all sections)
src/components/             → Front-end sections (SWR/fetch-backed)
src/app/admin/              → ADMIN dashboard (credentials, intake, certificates)
src/app/dashboard/          → HEAD & MEMBER self-service portal
app/api/                    → Route Handlers
  auth/                     → login / me / logout / change-password (session cookies)
  certificates/             → GET verify (rate-limited)
  events/                   → GET list (paged) + /register POST
  council/                  → GET by team
  intake/                   → POST apply (risk-scored)
  admin/                    → users CRUD (HEAD/ADMIN), intake, certificates
  ai/chat/                  → POST RAG chat assistant
  ai/recommend-events/      → GET hybrid recommendations
  ai/certificates/risk-check/ → POST admin risk recompute
  ai/embeddings/reindex/    → POST admin embedding backfill (requires pgvector)
lib/
  db.ts                     → Prisma client singleton
  validators/               → Shared Zod schemas (client + server)
  ai/                       → embeddings, retrieval, chat, recommend, risk, rate-limiter
  auth/                     → password/scrypt, session tokens, role guards
  log/logger.ts             → Structured + AI cost logging
  client/api.ts             → Typed fetch wrapper
prisma/schema.prisma        → Data model (User + roles, events, intake, ...)
prisma/seed.ts              → Seed data + default admin/head/member accounts
scripts/backfill-embeddings.ts → One-off vector backfill (requires pgvector)
tests/                      → Unit tests + assistant eval set
.github/workflows/ci.yml    → CI + migration deploy
```

## Design principle: graceful degradation

**Every AI feature is additive, never blocking.** If the LLM/embedding provider
is down or rate-limited, registrations, certificate verification, and the
council directory keep working. If the database/API is unreachable, the
front-end components fall back to demo data (clearly labelled) so the UI is
still demonstrable.

## Prerequisites

- Node.js 20+
- PostgreSQL 15+ locally (or Supabase Postgres)
- Optional: an OpenAI-compatible embeddings + chat API key (AI features only)

## Setup

### 1. Install & configure

```bash
npm install
cp .env.example .env   # then fill in values
```

Key variables in `.env`:

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | App traffic connection (Supabase pooler in prod) |
| `DIRECT_URL` | Session connection used by migrations |
| `NEXT_PUBLIC_SUPABASE_URL` / `ANON_KEY` | Client auth |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only, never `NEXT_PUBLIC_` |
| `AI_PROVIDER_API_KEY` | Server-only embeddings/chat key |
| `AI_EMBEDDING_MODEL` | e.g. `text-embedding-3-small` |
| `AI_CHAT_MODEL` | e.g. `gpt-4o-mini` |
| `AI_RATE_LIMIT_PER_MIN` | Per-session/IP token-bucket limit |
| `ADMIN_API_KEY` | Server-only admin guard fallback (used when Supabase is not configured) |
| `AUTH_SECRET` | Signs session cookies for the role-based login (admin/head/member) |

### 2. Local DB password mismatch?

If the app returns 500 on API routes because PostgreSQL rejects the configured
password (`Authentication failed against database server`), you likely have a
non-blank `postgres` password from install. The included script resets it,
provisions `iste_nexus_db` + pgvector, and rewrites `.env` (safe, self-cleaning):

```powershell
# In ANY PowerShell / Command Prompt (the script elevates itself via UAC):
powershell -ExecutionPolicy Bypass -File scripts\fix-local-db.ps1
```

Or point `DATABASE_URL` at Supabase instead (no local password involved).

### 3. Enable pgvector (optional, only for AI search + RAG)

The core schema no longer depends on pgvector, so the site runs on any
PostgreSQL out of the box. To enable the AI semantic-search features, install
the pgvector extension and add an OpenAI-compatible `AI_PROVIDER_API_KEY`:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

Re-add the `embedding vector(1536)` columns to `Event` and `Publication` in
`prisma/schema.prisma`, regenerate, migrate, then:
`npm run backfill:embeddings`. Without these, the AI endpoints degrade
gracefully (the assistant stays conversational, recommendations fall back to
"Popular this month").

### 4. Migrate, generate, seed

```bash
npx prisma migrate dev --name init   # local dev
npx prisma generate
npm run db:seed                      # or: npx prisma db seed
```

The seed creates three default accounts (passwords shown for local dev — change
them after first login):

| Email | Role | Default password |
| --- | --- | --- |
| `admin@iste.com` | ADMIN | `Admin@123` |
| `head@iste.com` | HEAD | `Head@123` |
| `member@iste.com` | MEMBER | `Member@123` |

Admins create credentials for heads/members from the **Admin — Users & Access**
tab; heads create member accounts from their **Manage Members** tab.

### 5. Backfill embeddings (optional, needed for AI search/recommendations)

```bash
npm run backfill:embeddings
```

### 6. Run

```bash
npm run dev
```

Open http://localhost:3000. The page degrades gracefully if the DB/API keys are
not configured.

## API reference

- `POST /api/auth/login` — `{ email, password }` → sets an httpOnly session
  cookie; returns the user (`{ user }`).
- `GET /api/auth/me` — returns the signed-in user (`{ user }`) or 401.
- `POST /api/auth/logout` — clears the session cookie.
- `POST /api/auth/change-password` — **MEMBER+**, `{ currentPassword, newPassword }`.
- `GET /api/admin/users` — **HEAD+** (ADMIN sees everyone, HEAD sees members).
- `POST /api/admin/users` — **HEAD+** (HEAD may only create MEMBER accounts;
  only ADMIN can create HEAD/ADMIN).
- `PATCH /api/admin/users/[id]` — **HEAD+** manage name/role/team/`isActive`,
  or `resetPassword`. Self-demotion and self-deactivation are blocked.
- `DELETE /api/admin/users/[id]` — **HEAD+**; ADMINS cannot be deleted.
- `GET /api/certificates/verify?id={id}` — verify a credential (rate-limited,
  returns `pendingManualReview` note if risk elevated).
- `GET /api/events?category=&page=&limit=` — paged event list.
- `POST /api/events/register` — `{ eventId, userName, email, phone, teamName? }`;
  duplicate `(eventId, email)` → 409.
- `GET /api/council?team=` — members ordered by `order`.
- `POST /api/intake/apply` — `{ fullName, email, department, yearOfStudy, portfolioUrl? }`;
  runs risk heuristics, saves application, sets `FLAGGED` status if triggered
  (never auto-rejects).
- `POST /api/ai/chat` — `{ sessionId?, message }` → RAG-grounded assistant.
- `GET /api/ai/recommend-events?email=&interests=` → hybrid recommendations.
- `POST /api/ai/certificates/risk-check` — **ADMIN only**, recompute risk score.
- `POST /api/ai/embeddings/reindex` — **ADMIN only**, regenerate vectors (requires pgvector).
- `GET /api/admin/intake` — **HEAD+**, list applications + summary counts.
- `PATCH /api/admin/intake/[id]` — **HEAD+**, update application status.
- `GET /api/admin/certificates` — **ADMIN only**, list (optionally `highRisk=true`).

### Roles & access

Three roles, enforced by server-side guards in `lib/auth/guards.ts`:

| Role | Can |
| --- | --- |
| **ADMIN** | Everything: create/manage HEAD & MEMBER accounts, reset passwords, roles, intake, certificates, AI admin actions |
| **HEAD** | Manage members (create, deactivate, reset password, delete), review intake applications |
| **MEMBER** | Sign in to the portal, view own profile/team, change own password |

- Dashboard: **`/admin`** (ADMIN) and **`/dashboard`** (HEAD/MEMBER) — the pages
  redirect users to the correct portal for their role.
- Sessions are signed HMAC tokens in an httpOnly cookie. The legacy
  `Authorization: Bearer <ADMIN_API_KEY>` header still works for admin routes
  and the role checks (`lib/auth/guards.ts`), enabled in `require-admin.ts`.

### Admin access

1. Log in at `/admin` with `admin@iste.com`. Register team accounts from the
   **Users & Access** tab — the generated password is shown once for copy/paste.
2. Heads sign in at `/dashboard` to manage members and review intake.
3. Members sign in at `/dashboard` for profile and password management.

Original admin flow (API key) still works as a fallback:

```bash
# .env
ADMIN_API_KEY=change-me-dev-admin-key
```

## AI/ML layer

- **Semantic search / RAG** — `lib/ai/retrieval.ts` embeds the query and runs
  pgvector cosine similarity (`<=>`) against event/publication embeddings; the
  grounded chat (`lib/ai/chat.ts`) template forbids hallucination and never
  certifies certificates via chat. `retrievedIds` are stored with each answer.
- **Hybrid recommendations** — `lib/ai/recommend.ts` blends vector similarity
  with category affinity from past registrations + recency + featured boost.
- **Anomaly detection** — `lib/ai/riskHeuristics.ts` scores certificates and
  intake applications (duplicate issue, malformed ID, future dates, disposable
  emails, unreachable portfolios). Rules-first on day one; a human always
  reviews flagged items.

## Security

- Zod validation before any Prisma access; structured 400s, never stack traces.
- IP-based rate limiting on public writes and all AI routes.
- `SUPABASE_SERVICE_ROLE_KEY` and `AI_PROVIDER_API_KEY` are server-only.
- Admin routes gated by Supabase auth role check, not hidden URLs.
- `retrievedIds` persist for answer auditability.

## Testing & CI

```bash
npm test              # unit tests (validators, risk heuristics, rate limiter, assistant eval)
npm run typecheck
npm run lint
npm run build
```

CI (`.github/workflows/ci.yml`) runs `prisma validate`, typecheck, lint, and
`npm test` on every PR; `prisma migrate deploy` runs against Supabase
`DIRECT_URL` on merge to `main`.

## Deployment (Vercel + managed Postgres)

The app builds and runs on Vercel. All database calls go through API routes
(dynamic), so a build does **not** need a reachable database; the Prisma client
is generated automatically via the `postinstall` script.

### 1. Push to GitHub, import the repo in Vercel

- Import `iste-mhssce/iste-website` in the Vercel dashboard.
- Framework preset: **Next.js** (auto-detected).
- Build command: default (`next build`). Install command: default (`npm ci` runs
  `postinstall` → `prisma generate`).

### 2. Add environment variables (Settings → Environment Variables)

| Variable | Required | Notes |
|---|---|---|
| `DATABASE_URL` | **Yes** | App traffic connection (use the pooler/edge URL from Neon/Supabase/Vercel Postgres) |
| `DIRECT_URL` | **Yes** | Session/direct connection used by Prisma migrate; must be set for `prisma` CLI steps |
| `AUTH_SECRET` | **Yes** | Signs session cookies. Generate a strong value, e.g. `openssl rand -base64 32`. Without it login/roles fail |
| `NEXT_PUBLIC_SUPABASE_URL` | No | Only if using Supabase for auth/storage |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | No | ditto |
| `SUPABASE_SERVICE_ROLE_KEY` | No | server-only, never expose publicly |
| `ADMIN_API_KEY` | No | Optional legacy Bearer fallback for admin routes |
| `AI_PROVIDER_API_KEY` | No | Optional; chat/recommendations degrade gracefully without it |
| `AI_CHAT_MODEL` / `AI_EMBEDDING_MODEL` | No | Optional overrides |

### 3. Run migrations + seed once (production database)

After the first deploy, connect the deploy machine (or the CI `deploy-migrations`
job — add `DATABASE_URL`/`DIRECT_URL` as GitHub Actions secrets) to your prod DB:

```bash
npx prisma migrate deploy   # uses DIRECT_URL (session connection)
npm run seed                # creates default admin/head/member + demo data
```

### 4. Hardening before going public

- **Change the default admin password** (`admin@iste.com` / `Admin@123`) after the
  first login — the seed logs them out on the dashboard and resets happen via
  `PATCH /api/admin/users`.
- Set a unique, strong `AUTH_SECRET` (never reuse the local dev value).
- If AI search/RAG should be production-grade: install `pgvector` on your host and
  run `npm run backfill:embeddings`.

Verify `/api/ai/chat` and `/api/ai/recommend-events` return grounded output
before announcing AI features publicly.
