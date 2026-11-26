# roommates

Room-rental marketplace with a React (Vite) frontend, a Spring Boot backend, and MySQL.

## Architecture

- `roommates_BE/` — Spring Boot 4.1.1, Java 21, Maven wrapper, executable WAR, JPA, Spring Security + JWT, SMTP/OTP, image uploads. Serves `/api/**` and `/uploads/**` on port `8080`.
- `roomets_FE/` — React 19 + Vite, Axios, MUI, Leaflet. Dev server on port `5173`. `VITE_API_URL` is baked in at build time and defaults to `https://roommates-ky68.onrender.com` in `roomets_FE/src/API/app-config.js`.
- MySQL 8 — application data. Docker Compose runs MySQL, backend, and frontend together; nginx proxies `/api/` and `/uploads/` to the backend.
- Uploaded images are stored in the S3-compatible bucket under `rooms/...` and served by the backend from `/uploads/rooms/...`.

## Prerequisites

- JDK 21 (the Maven wrapper downloads Maven 3.9.16; no system Maven needed)
- Node 22 and npm 10
- MySQL 8, or Docker with Compose

Edit `roommates_BE/src/main/resources/application.properties` before starting anything. There is no `.env` file; do not commit real production credentials.

## Configuration

| Variable | Purpose |
| --- | --- |
| `JWT_SECRET` | JWT signing secret; use at least 32 random bytes |
| `spring.datasource.*` | JDBC connection set directly in `application.properties`; Compose overrides only `DB_URL` for the container host |
| `MAIL_HOST`, `MAIL_PORT`, `MAIL_USERNAME` | SMTP settings for OTP/password-reset mail |
| `MAIL_PASSWORD` | SMTP credential; leave blank to disable outgoing mail locally |
| `MAIL_APP_PASSWORD` | Optional alias for `MAIL_PASSWORD` |
| `MAIL_FROM` | From address used for outgoing mail |
| `APP_MAIL_DEV_CONSOLE_OTP` | Local fallback when SMTP is blank; logs and returns the OTP, forced off in `prod` via profile config |
| `FRONTEND_URL` | Public frontend origin used in generated mail links |
| `STORAGE_BUCKET`, `STORAGE_ENDPOINT`, `STORAGE_REGION` | S3-compatible bucket, endpoint, and signing region |
| `storage.s3.access-key`, `storage.s3.secret-key` | S3-compatible credentials in `application.properties` (or deployment environment) |
| `STORAGE_PATH_STYLE_ACCESS` | Use path-style bucket URLs; keep `false` for Tigris virtual-hosted access |
| `CORS_ALLOWED_ORIGINS` | Comma-separated browser origins allowed to call the API |
| `OTP_EXPIRATION_MS` | OTP lifetime in milliseconds |
| `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD` | Optional first admin created only in `prod` when the account does not exist |
| `SPRING_PROFILES_ACTIVE` | Leave unset so `application.properties` controls the profile; switch there between `local` and `prod` |
| `VITE_API_URL` | Frontend API base, baked into JS at build time; defaults to `https://roommates-ky68.onrender.com` |
| `BACKEND_URL` | nginx proxy target, substituted at container startup |
| `MYSQL_ROOT_PASSWORD` | MySQL root password used by Compose |

`application.properties` owns all backend config (DB, JWT, mail, S3, CORS, Actuator). `application-local.properties` and `application-prod.properties` contain only profile-specific DDL/Flyway settings. `prod` uses `ddl-auto=validate`, Flyway, and `clean-disabled=true` so the production database is never wiped. When SMTP credentials are blank locally, `/api/auth/send-otp` returns the OTP in `data` and logs it instead of emailing; `prod` rejects unconfigured mail.

## Local development

```bash
docker compose up -d mysql

cd roommates_BE && ./mvnw spring-boot:run
# in another terminal, from the repository root:
cd roomets_FE && npm ci && npm run dev
```

Open the frontend on `http://localhost:5173` and the API on `http://localhost:8080`.

Seed data: `DataInitializer` is gated to the `local` profile (and legacy `dev`), which is active by default. It never runs in `prod` or tests. Switch the active profile in `application.properties`. See `docs/DEPLOYMENT.md`.

Uploads: set the `storage.s3.*` values in `application.properties`. Both local and production use the same bucket; the backend stores objects under `rooms/` and serves them at `/uploads/rooms/...`.

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

Frontend is served on port `80`, backend on `8080`, and uploads persist in the S3-compatible bucket. Build-time `VITE_API_URL` defaults to `https://roommates-ky68.onrender.com`; the browser calls that origin and `CORS_ALLOWED_ORIGINS` must allow the frontend origin. Runtime env changes cannot rewrite the built JS; rebuild the frontend image for a different API origin.

See `docs/DEPLOYMENT.md` for production notes.
