# Deployment

## Local development

1. `cp .env.example .env` and keep `.env` out of git. The backend auto-loads it from the repo root or `roommates_BE`.
2. Start MySQL with `docker compose up -d mysql`, or use a local MySQL 8 instance matching the `dev` profile `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.
3. Run the backend with JDK 21: `cd roommates_BE && JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 mvn spring-boot:run`.
4. Run the frontend: `cd roomets_FE && npm ci && npm run dev`.

Use `SPRING_PROFILES_ACTIVE=dev` for seed data during development. `DataInitializer` is gated to the `dev` profile; delete any demo accounts already created in an older database. With blank SMTP credentials, `APP_MAIL_DEV_CONSOLE_OTP=true` logs the OTP and returns it in `/api/auth/send-otp` instead of emailing it. With SMTP configured, `send-otp` sends real mail; store Gmail app passwords without spaces.

## Production

- Set real values in `.env` or the deployment environment for `JWT_SECRET` (32+ bytes), `DB_URL`, `DB_USERNAME`, `DB_PASSWORD`, SMTP credentials (`MAIL_PASSWORD`, or the optional `MAIL_APP_PASSWORD` alias), `MAIL_FROM`, `FRONTEND_URL`, and `CORS_ALLOWED_ORIGINS`. The `prod` profile has no database defaults for these values.
- Set `SPRING_PROFILES_ACTIVE=prod`. Seed data never runs outside `dev`; set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` once to create the first admin if none exists. The `prod` profile uses Flyway with `ddl-auto=validate` and `spring.flyway.clean-disabled=true`; it never wipes the production database. Follow `roommates_BE/docs/database-migrations.md` for existing databases.
- Start with `docker compose up -d --build`. Backend listens on `8080`; nginx serves the frontend on `80`.
- Uploads: both local and production use the S3-compatible bucket configured by `STORAGE_BUCKET`, `STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY`, and `STORAGE_SECRET_KEY`. The backend stores objects under `rooms/` and serves them at `/uploads/rooms/...`; back up the bucket with the database. The key must allow `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` on `roomates/*`; keep `STORAGE_PATH_STYLE_ACCESS=false` for Tigris.

## Health check

Spring Boot Actuator is configured. Use `GET /actuator/health` as the public probe; it returns 200 when the app and database are available, and Compose healthchecks the backend this way.

## CORS and frontend URL

- `CORS_ALLOWED_ORIGINS` must contain the exact browser origin (scheme + host + port). With the Compose nginx proxy, callers use the frontend origin, e.g. `http://localhost`; for direct API access, add the frontend origin used by users.
- `FRONTEND_URL` is used for links in outgoing mail; set it to the same public frontend origin.
- `PUBLIC_API_URL` is the runtime frontend API base. The frontend container writes it to `/env.js` at startup, so changing the backend URL requires only a container restart. The current production backend URL is `https://roommates-ky68.onrender.com`; set it as `PUBLIC_API_URL` for direct API calls, or keep `PUBLIC_API_URL=/` and set `BACKEND_URL` to that URL to proxy `/api/` and `/uploads/` through nginx.
- `VITE_API_URL` is only the build-time fallback compiled into the JS bundle. Set it for static hosts that cannot generate `/env.js`, and update `CORS_ALLOWED_ORIGINS` with the browser origin when calling the API directly.
- `nginx.conf` is installed as an nginx template; the frontend image sets `NGINX_ENVSUBST_FILTER=BACKEND_URL` so `${BACKEND_URL}` is replaced at startup while nginx variables such as `$uri` remain intact.

## Tests before release

```bash
cd roommates_BE && ./mvnw -B test && ./mvnw -B -DskipTests package
cd roomets_FE && npm ci && npm run lint && npm test && npm run build
```

Backend tests use in-memory H2 and need no MySQL instance; see the root `README.md`.
