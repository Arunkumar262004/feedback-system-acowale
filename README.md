# Acowale CRM Machine Test by [Your Name]

A lightweight customer feedback platform: a public form where users submit feedback,
and an admin dashboard (**Acodash**) where the team analyses trends.

Built on the **PERN stack** — PostgreSQL, Express, React, Node.js.

---

## Live Links

| | |
|---|---|
| **Live App (frontend)** | `https://<your-app>.vercel.app` |
| **Live API (backend)** | `https://<your-app>.onrender.com/api` |
| **API Health Check** | `https://<your-app>.onrender.com/api/health` |
| **Source Code** | [Arunkumar262004/feedback-system-acowale](https://github.com/Arunkumar262004/feedback-system-acowale) |

> Replace the placeholders above once deployed (see [Deployment](#deployment) below).

---

## Architecture

```
acowale-crm/
├── backend/                  Node.js + Express REST API
│   ├── src/
│   │   ├── config/           DB pool, logger
│   │   ├── middleware/       auth, rate limiting, validation, error handling
│   │   ├── routes/           auth, feedback, analytics, health
│   │   ├── controllers/      request handlers
│   │   ├── models/           raw SQL data access (pg)
│   │   ├── db/                migrations + migration runner
│   │   ├── utils/            Prometheus metrics
│   │   ├── app.js            Express app assembly
│   │   └── server.js         entry point, graceful shutdown
│   ├── tests/                Jest + Supertest unit tests
│   ├── render.yaml           Render deploy blueprint
│   └── Dockerfile
├── frontend/                 React (Vite) SPA
│   └── src/
│       ├── api/              Axios client
│       ├── context/          Auth context (JWT)
│       ├── components/       Navbar, StatCard, FeedbackCard
│       └── pages/            FeedbackForm, Login, Dashboard
├── .github/workflows/ci.yml  CI: test backend, build frontend
├── docker-compose.yml        Local Postgres + API for dev
├── DECISIONS.md               Engineering decision log
└── TEACH_US.md                 Optional bonus write-up
```

**Request flow:** React SPA (Vercel) → REST API (Render, Express) → PostgreSQL (Render).
The public feedback form hits unauthenticated endpoints; the admin dashboard requires a
JWT issued at `/api/auth/login`.

---

## Tech Stack & Why

| Layer | Choice | Why |
|---|---|---|
| Frontend | React + Vite | Fast dev server, small bundle, huge ecosystem, matches the reference mockup's SPA feel |
| Charts | Recharts | Declarative, lightweight, good enough for a pie/trend chart without pulling in a heavy BI lib |
| Backend | Node.js + Express | Minimal, well-understood, fast to build a small REST API, same language as frontend (one skillset) |
| Database | PostgreSQL | Relational data (feedback + users) with real constraints (CHECK on category/status), strong `GROUP BY` support for analytics, free tier on Render |
| Auth | JWT + bcrypt | Stateless auth is simple to reason about and works cleanly across separate frontend/backend hosts (Vercel + Render) without shared session storage |
| ORM | None (raw SQL via `pg`) | The schema is small (2 tables); raw SQL keeps queries transparent and avoids an abstraction I'd need to fight for the analytics `GROUP BY` queries |

Full rationale in [`DECISIONS.md`](./DECISIONS.md).

---

## Features

**Product requirements**
- Public feedback form: category, comment, optional email, optional rating
- Admin dashboard: total count, category distribution (pie chart), recent submissions, status breakdown, filtering + search
- REST APIs: submit feedback, fetch feedback (paginated/filterable), analytics summary

**Production readiness**
- Environment variables (`.env` in both apps)
- Centralized error handling with consistent JSON error shape
- Input validation on every write endpoint (`express-validator`)
- Structured logging (`winston` + `morgan`)
- Health-check endpoint (`/api/health`) checking real DB connectivity

**Bonus points — all implemented**
- ✅ **Authentication** — JWT-based admin login (`bcrypt` password hashing), protects dashboard/analytics routes
- ✅ **Unit tests** — Jest + Supertest, 12 tests across auth/feedback/health (DB mocked, no live DB needed in CI)
- ✅ **Monitoring** — Prometheus-compatible `/metrics` endpoint (`prom-client`): request counts, latency histograms, feedback-submission counter, default Node process metrics
- ✅ **Rate limiting** — `express-rate-limit`: general API limiter, stricter limiter on feedback submission (anti-spam), stricter limiter on login (anti-brute-force)
- ✅ **CI/CD** — GitHub Actions (`.github/workflows/ci.yml`) runs backend tests + frontend build on every push/PR; Render and Vercel auto-deploy green commits on `main`
- ✅ **Observability** — structured JSON logs in production, request-duration histograms, `/api/health` for uptime checks, `/metrics` for scraping

---

## Local Development

### Prerequisites
- Node.js 18+
- Docker and Docker Compose

### 1. Database Setup
The application is configured to connect to a local **PostgreSQL database** running in Docker.
1. Spin up the local database container:
   ```bash
   docker compose up -d db
   ```
   This starts the PostgreSQL instance on port `5433`.

### 2. Backend Setup
1. Navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Ensure your `.env` file is present (the connection string `DATABASE_URL` should point to your local PostgreSQL instance: `postgresql://acowale:acowale@localhost:5433/acowale_crm`).
3. Install dependencies:
   ```bash
   npm install
   ```
4. Run migrations (this will create tables and seed the default admin account on the local database):
   ```bash
   npm run migrate
   ```
5. Start the development server (runs by default on port `5002`):
   ```bash
   npm run dev
   ```

### 3. Frontend Setup
1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Ensure your `.env` file is present. For local development, it should point to your local backend API:
   ```env
   VITE_API_URL=http://localhost:5002/api
   ```
3. Install dependencies:
   ```bash
   npm install
   ```
4. Start the Vite development server:
   ```bash
   npm run dev
   ```
   The frontend application will be running at `http://localhost:5173`.

### 4. Run Tests
To run backend unit tests (uses database mocks so no live connection is required):
```bash
cd backend
npm test
```

### Default Admin Login (from backend/.env)
```
email: admin@acowale.com
password: Admin@123
```
You can customize these credentials in `backend/.env` before running migrations for the first time.

---

## Deployment

### Backend → Render
1. Push this repo to GitHub.
2. In Render: **New → Blueprint**, point it at this repo. `backend/render.yaml` provisions:
   - a free PostgreSQL instance
   - a free web service running `npm run migrate && npm start`
3. Set the secret env vars Render will prompt for: `ADMIN_EMAIL`, `ADMIN_PASSWORD`, `CORS_ORIGINS` (your Vercel URL).
4. Confirm `https://<service>.onrender.com/api/health` returns `200`.

### Frontend → Vercel
1. Import the repo in Vercel, set **root directory** to `frontend`.
2. Framework preset: Vite. Build command `npm run build`, output `dist`.
3. Add env var `VITE_API_URL=https://<your-render-service>.onrender.com/api`.
4. Deploy. Vercel auto-redeploys on every push to `main`.

### CI/CD flow
```
push to main → GitHub Actions runs backend tests + frontend build
             → if green, Render redeploys API, Vercel redeploys SPA
```

---

## API Reference (summary)

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/feedback` | Public (rate-limited) | Submit feedback |
| GET | `/api/feedback` | Admin (JWT) | List/filter/search feedback |
| GET | `/api/analytics/summary` | Admin (JWT) | Totals, category/status breakdown, 30-day trend, avg rating |
| POST | `/api/auth/login` | Public (rate-limited) | Exchange email+password for a JWT |
| GET | `/api/auth/me` | Admin (JWT) | Current admin identity |
| GET | `/api/health` | Public | Liveness + DB connectivity check |
| GET | `/metrics` | Public | Prometheus metrics |

See `DECISIONS.md` for the full engineering write-up and answers to the assignment's
reflection questions.
