# roommates

Room-rental marketplace with a React (Vite) frontend, a Spring Boot backend, and MySQL.

## Architecture

- `roommates_BE/` — Spring Boot 4.1.1, Java 21, Maven wrapper, executable WAR, JPA, Spring Security + JWT, SMTP/OTP, image uploads. Serves `/api/**` and `/uploads/**` on port `8080`.
- `roomets_FE/` — React 19 + Vite, Axios, MUI, Leaflet. Dev server on port `5173`. `VITE_API_URL` is baked in at build time (defaults to `http://localhost:8080/` in `roomets_FE/src/API/app-config.js`).
- MySQL 8 — application data. Docker Compose runs MySQL, backend, and frontend together; nginx proxies `/api/` and `/uploads/` to the backend.
- Uploaded images are written under `ROOM_UPLOAD_DIR/rooms` and served from `/uploads/rooms/...`.

## Prerequisites

- JDK 21 (the Maven wrapper downloads Maven 3.9.16; no system Maven needed)
- Node 22 and npm 10
- MySQL 8, or Docker with Compose

Copy `.env.example` to `.env` and replace placeholders before starting anything. Never commit `.env`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | JWT signing secret; use at least 32 random bytes |
| `DB_URL`, `DB_USERNAME`, `DB_PASSWORD` | JDBC connection for the backend |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME` | SMTP settings for OTP/password-reset mail |
| `MAIL_PASSWORD` | SMTP credential; leave blank to disable outgoing mail locally |
| `MAIL_APP_PASSWORD` | Optional alias for `MAIL_PASSWORD` |
| `MAIL_FROM` | From address used for outgoing mail |
| `FRONTEND_URL` | Public frontend origin used in generated mail links |
| `ROOM_UPLOAD_DIR` | Writable directory for room images; must be a persistent volume in containers |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `OTP_EXPIRATION_MS` | OTP lifetime in milliseconds |
| `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD` | Optional first admin created only in `prod` when the account does not exist |
| `SPRING_PROFILES_ACTIVE` | Set to `dev` locally; use `prod` in deployment |
| `VITE_API_URL` | Frontend API base, baked into JS at build time; `/` enables the nginx proxy |
| `BACKEND_URL` | nginx proxy target, substituted at container startup |
| `MYSQL_ROOT_PASSWORD` | MySQL root password used by Compose |

`application.properties` has local-development defaults for `JWT_SECRET`, `DB_USERNAME`, and `DB_PASSWORD`. The `prod` profile removes those defaults and requires them from the environment. Mail is skipped when no username/password is configured.

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

Uploads: set `ROOM_UPLOAD_DIR` to a writable local path (the committed default is machine-specific). The app creates the `rooms` subdirectory itself; keep this directory when upgrading.

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

Frontend is served on port `80`, backend on `8080`, and uploads persist in the `uploads` named volume. Build-time `VITE_API_URL=/` makes the browser call the same origin; nginx forwards `/api/` and `/uploads/` to `BACKEND_URL`. Runtime env changes cannot rewrite the built JS; rebuild the frontend image for a different API origin.

See `docs/DEPLOYMENT.md` for production notes.
