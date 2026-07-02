# DECISIONS.md — Acowale CRM Machine Test

## 1. Why did you choose this technology stack?

PERN (PostgreSQL, Express, React, Node) because:
- **One language end-to-end** (JavaScript) lets me move fast across frontend and backend without context-switching.
- **React + Vite** gives a snappy dev loop and a small, easy-to-deploy static bundle for Vercel.
- **Express** is minimal enough that every line of the API is legible in a short review — appropriate for a 6–10 hour test where reviewers need to understand the whole thing quickly.
- The task explicitly separates a *public form* from an *internal dashboard*, which maps naturally onto a decoupled frontend (Vercel) + API (Render) deployment rather than a monolith — closer to how Acowale would likely actually ship this.

## 2. Why did you choose this database?

PostgreSQL, because:
- The data is genuinely relational (feedback entries, optionally linked to users) with real constraints worth enforcing at the DB layer (`CHECK (category IN (...))`, `CHECK (rating BETWEEN 1 AND 5)`).
- The dashboard's core value is aggregation — `GROUP BY category`, `GROUP BY status`, 30-day trend by day. Postgres does this well and it's expressible in a few lines of SQL, versus needing an aggregation pipeline in a document store.
- Render offers a free managed Postgres instance, which matches the "publicly accessible, deployable from source" requirement without extra infra work.
- I used raw SQL via the `pg` driver instead of an ORM (Prisma/Sequelize) — at this scale (2 tables) an ORM adds a layer of indirection I'd spend more time configuring than it would save, and it keeps the analytics queries transparent.

## 3. Why did you structure your application this way?

Standard layered Express structure — `routes → controllers → models`, with `middleware/` and `config/` pulled out:
- **routes** define the HTTP surface and attach validation/auth/rate-limiting per-endpoint, so security posture is visible at a glance in one file.
- **controllers** are thin — they only translate HTTP ↔ domain calls, no SQL.
- **models** hold all SQL, so if I ever swap Postgres for something else, only this layer changes.
- **middleware** (auth, rate limiting, validation, error handling) is centralized and reused rather than duplicated per-route.

This isn't over-engineered for the assignment's size, but it's the shape I'd want on day one of a real product, since Acowale said to "assume this is a real product that #TeamAcowale would continue building after launch."

## 4. What trade-offs did you make due to time constraints?

- **No ORM / migration framework** (e.g. Prisma, Knex) — a single hand-written SQL migration file instead. Fine for one table set; would need a real migration tool the moment the schema needs to evolve with zero downtime.
- **Single hardcoded admin role** rather than a full user-management system (invite flows, password reset, multiple roles/permissions).
- **No refresh tokens** — JWTs expire in 8h and require re-login. Good enough for an internal admin tool, not ideal for a consumer-facing session.
- **Charts limited to category pie chart** — I skipped a full trend line chart in the UI (the API returns 30-day trend data, but I didn't have time to wire a second chart component) to keep the frontend scope tight.
- **No Redis/shared cache** — rate limiting is in-memory per Render instance. Fine for one instance; would need a shared store (Redis) the moment we run 2+ API instances.

## 5. What would you improve if you had one more week?

1. **Refresh tokens + shorter-lived access tokens**, with token rotation on the frontend.
2. **A real migration tool** (e.g. `node-pg-migrate`) so schema changes are versioned and reversible.
3. **Full-text search** on feedback comments (Postgres `tsvector`) instead of `ILIKE`, which doesn't scale past a few thousand rows.
4. **E2E tests** (Playwright) covering the actual form-submit → dashboard-appears flow, on top of the current backend unit tests.
5. **Admin actions** — let the dashboard change a feedback item's status (Received → In Progress → Resolved) directly, with an audit trail.
6. **Redis-backed rate limiting** so limits hold correctly across multiple API instances.
7. **Pagination controls in the UI** — the API supports `page`/`limit`, but the dashboard table doesn't yet expose page navigation.

## 6. What was the most difficult technical challenge you faced?

Getting **CORS + JWT auth to behave correctly across two separate hosts** (Vercel for the SPA, Render for the API) rather than one shared origin. Free-tier Render web services also spin down when idle, so the health-check endpoint and `trust proxy` setting needed to be right on the first cold request, or the frontend would see confusing 401/CORS errors that were actually just "the API hadn't woken up yet." I addressed this with an explicit `CORS_ORIGINS` allowlist read from env, `app.set('trust proxy', 1)` for correct client IPs behind Render's proxy (rate limiting depends on this), and a `/api/health` endpoint that verifies live DB connectivity rather than just returning `200` unconditionally.

## 7. Which AI tools did you use?

Claude (Anthropic) — used throughout for scaffolding the Express API structure, the React components, and the CSS design pass, then reviewed and adjusted line-by-line.

## 8. Share one instance where AI helped you.

Generating the **Prometheus metrics middleware** (`src/utils/metrics.js`) — I know roughly what I want out of `prom-client` (request duration histogram, request counter, a domain-specific counter for feedback submissions) but wiring the label cardinality correctly (route pattern vs raw path, to avoid unbounded label explosion) is easy to get subtly wrong. Having a first draft to review and correct was faster than writing it from the `prom-client` docs from scratch.

## 9. Share one instance where you disagreed with AI and why.

The initial draft used the raw `req.path` as a Prometheus label for every route. I changed it to prefer `req.route.path` (the route *pattern*, e.g. `/api/feedback/:id`) with a fallback to `req.path`, because using the raw path as a label means every unique feedback ID would create a new time-series in Prometheus — a classic cardinality bug that looks fine in a demo and quietly degrades a real metrics backend in production.

## 10. What would break first if this application suddenly had 100,000 users?

**In-memory rate limiting** would break first in a subtle way — on Render's free/starter tiers you're on a single instance, but the moment you scale horizontally, each instance tracks its own request counts, so the *effective* rate limit multiplies by instance count and stops protecting anything. Close behind that: the `ILIKE '%search%'` query on `feedback.comment` does a sequential scan once the table is large, and the free-tier Postgres connection pool (`max: 10` in `db.js`) would be a bottleneck under real concurrent load. The fix path is: Redis-backed rate limiting, a proper full-text search index, and a pooler (PgBouncer) or a bigger Postgres plan.

## 11. What is one thing in this assignment that you would improve, change, or challenge?

The brief asks for a "publicly accessible URL" but free-tier hosts (Render's free web service) spin down after inactivity, so an evaluator's first request can take 30–60 seconds and look like a broken deploy rather than a cold start. I'd suggest the assignment either budget for a paid always-on tier, or explicitly tell candidates cold-start delays on free tiers are expected and shouldn't be marked against them — otherwise strong submissions on free infrastructure risk being judged on hosting-provider behavior rather than engineering quality.
