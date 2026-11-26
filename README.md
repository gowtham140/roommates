# roommates

Room-rental marketplace with a React (Vite) frontend, a Spring Boot backend, and MySQL.

## Architecture

- `roommates_BE/` — Spring Boot 4.1.1, Java 21, Maven wrapper, executable WAR, JPA, Spring Security + JWT, SMTP/OTP, image uploads. Serves `/api/**` and `/uploads/**` on port `8080`.
- `roomets_FE/` — React 19 + Vite, Axios, MUI, Leaflet. Dev server on port `5173`. The API base comes from runtime `window.__APP_CONFIG__.API_URL` (`/env.js`), then build-time `VITE_API_URL`, then `http://localhost:8080/`.
- MySQL 8 — application data. Docker Compose runs MySQL, backend, and frontend together; nginx proxies `/api/` and `/uploads/` to the backend.
- Uploaded images are stored in the S3-compatible bucket under `rooms/...` and served by the backend from `/uploads/rooms/...`.

## Prerequisites

- JDK 21 (the Maven wrapper downloads Maven 3.9.16; no system Maven needed)
- Node 22 and npm 10
- MySQL 8, or Docker with Compose

Copy `.env.example` to `.env` and replace placeholders before starting anything. Never commit `.env`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | JWT signing secret; use at least 32 random bytes |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | Shared JDBC connection; set local values for `dev` and production values for `prod` |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME` | SMTP settings for OTP/password-reset mail |
| `MAIL_PASSWORD` | SMTP credential; leave blank to disable outgoing mail locally |
| `MAIL_APP_PASSWORD` | Optional alias for `MAIL_PASSWORD` |
| `MAIL_FROM` | From address used for outgoing mail |
| `APP_MAIL_DEV_CONSOLE_OTP` | Local fallback when SMTP is blank; logs and returns the OTP, forced off in `prod` |
| `FRONTEND_URL` | Public frontend origin used in generated mail links |
| `STORAGE_BUCKET`, `STORAGE_ENDPOINT`, `STORAGE_REGION` | S3-compatible bucket, endpoint, and signing region |
| `STORAGE_ACCESS_KEY`, `STORAGE_SECRET_KEY` | S3-compatible access credentials; keep only in `.env` |
| `STORAGE_PATH_STYLE_ACCESS` | Use path-style bucket URLs; keep `false` for Tigris virtual-hosted access |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `OTP_EXPIRATION_MS` | OTP lifetime in milliseconds |
| `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD` | Optional first admin created only in `prod` when the account does not exist |
| `SPRING_PROFILES_ACTIVE` | Set to `dev` locally; use `prod` in deployment |
| `PUBLIC_API_URL` | Runtime frontend API base written to `/env.js` at container startup; overrides `VITE_API_URL` |
| `VITE_API_URL` | Build-time frontend API base fallback; set for static hosts that cannot generate `/env.js` |
| `BACKEND_URL` | nginx proxy target, substituted at container startup |
| `MYSQL_ROOT_PASSWORD` | MySQL root password used by Compose |

`application.properties` auto-loads the ignored `.env` from the repo root or backend directory. Both profiles use the shared `DB_*` credentials; set values for the environment being run. `prod` uses `ddl-auto=validate`, Flyway, and `clean-disabled=true` so the production database is never wiped. When SMTP credentials are blank locally, `/api/auth/send-otp` returns the OTP in `data` and logs it instead of emailing; `prod` rejects unconfigured mail.

## Local development

```bash
cp .env.example .env
docker compose up -d mysql
set -a; . ./.env; set +a

cd roommates_BE && ./mvnw spring-boot:run
# in another terminal, from the repository root:
cd roomets_FE && npm ci && npm run dev
```

Open the frontend on `http://localhost:5173` and the API on `http://localhost:8080`.

Seed data: `DataInitializer` is gated to the `dev` profile, so set `SPRING_PROFILES_ACTIVE=dev` locally if you want demo users and rooms. It never runs in `prod` or tests. See `docs/DEPLOYMENT.md`.

Uploads: set the `STORAGE_*` variables in `.env`. Both local and production use the same bucket; the backend stores objects under `rooms/` and serves them at `/uploads/rooms/...`.

## Test and build commands

Backend tests use an in-memory H2 database and need no external services:

```bash
cd roommates_BE && ./mvnw -B test
cd roommates_BE && ./mvnw -B -DskipTests package
```

Frontend tests use Vitest and React Testing Library:

```bash
cd roomets_FE && npm ci
cd roomets_FE && npm run lint
cd roomets_FE && npm test
cd roomets_FE && npm run build
```

## Docker

```bash
docker compose up --build
```

Frontend is served on port `80`, backend on `8080`, and uploads persist in the S3-compatible bucket. The frontend container writes `/env.js` from `PUBLIC_API_URL` at startup, so the browser API base can change without rebuilding. `VITE_API_URL` remains as a build-time fallback for static hosts; nginx also forwards `/api/` and `/uploads/` to `BACKEND_URL`.

See `docs/DEPLOYMENT.md` for production notes.
