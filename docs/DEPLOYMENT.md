# Deployment

## Local development

1. `cp .env.example .env` and keep `.env` out of git.
2. Start MySQL with `docker compose up -d mysql`, or use a local MySQL 8 instance matching `DB_URL`, `DB_USERNAME`, and `DB_PASSWORD`.
3. Run the backend with JDK 21: `set -a; . ./.env; set +a; cd roommates_BE && ./mvnw spring-boot:run`.
4. Run the frontend: `cd roomets_FE && npm ci && npm run dev`.

Use `SPRING_PROFILES_ACTIVE=dev` for seed data during development. `DataInitializer` is gated to the `dev` profile; delete any demo accounts already created in an older database.

## Production

- Set real values in `.env` for `JWT_SECRET` (32+ bytes), DB credentials, SMTP credentials (`MAIL_PASSWORD`, or the optional `MAIL_APP_PASSWORD` alias), `MAIL_FROM`, `FRONTEND_URL`, and `CORS_ALLOWED_ORIGINS`. The `prod` profile has no defaults for `JWT_SECRET`, `DB_USERNAME`, or `DB_PASSWORD`.
- Set `SPRING_PROFILES_ACTIVE=prod`. Seed data never runs outside `dev`; set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` once to create the first admin if none exists. The `prod` profile uses Flyway with `ddl-auto=validate`; follow `roommates_BE/docs/database-migrations.md` for existing databases.
- Start with `docker compose up -d --build`. Backend listens on `8080`; nginx serves the frontend on `80`.
- Uploads: `ROOM_UPLOAD_DIR` is `/var/lib/roommates/uploads` in the container and is backed by the named `uploads` volume. Back up this volume with the database; recreating the container without it loses room images.

## Health check

Spring Boot Actuator is configured. Use `GET /actuator/health` as the public probe; it returns 200 when the app and database are available, and Compose healthchecks the backend this way.

## CORS and frontend URL

- `CORS_ALLOWED_ORIGINS` must contain the exact browser origin (scheme + host + port). With the Compose nginx proxy, callers use the frontend origin, e.g. `http://localhost`; for direct API access, add the frontend origin used by users.
- `FRONTEND_URL` is used for links in outgoing mail; set it to the same public frontend origin.
- `VITE_API_URL` is compiled into the JS bundle by Vite and cannot be changed by runtime env vars. The Dockerfiles default it to `/`, so the browser calls `/api/...` and `/uploads/...` on the frontend origin and nginx proxies them to `BACKEND_URL`. To use a different API origin, rebuild the frontend with `--build-arg VITE_API_URL=<origin>` and update `CORS_ALLOWED_ORIGINS` accordingly.
- `nginx.conf` is installed as an nginx template; the frontend image sets `NGINX_ENVSUBST_FILTER=BACKEND_URL` so `${BACKEND_URL}` is replaced at startup while nginx variables such as `$uri` remain intact.

## Tests before release

```bash
cd roommates_BE && ./mvnw -B test && ./mvnw -B -DskipTests package
cd roomets_FE && npm ci && npm run lint && npm test && npm run build
```

Backend tests use in-memory H2 and need no MySQL instance; see the root `README.md`.
