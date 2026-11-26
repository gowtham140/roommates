# Deployment

## Local development

1. Edit `roommates_BE/src/main/resources/application.properties` directly. There is no `.env` file.
2. Start MySQL with `docker compose up -d mysql`, or use a local MySQL 8 instance matching the `spring.datasource.*` values in `application.properties`.
3. Run the backend with JDK 21: `cd roommates_BE && JAVA_HOME=/usr/lib/jvm/java-21-openjdk-amd64 mvn spring-boot:run`.
4. Run the frontend: `cd roomets_FE && npm ci && npm run dev`.

The active profile is controlled in `application.properties`; `local` enables seed data. `DataInitializer` is gated to `local` and legacy `dev`; delete any demo accounts already created in an older database. With a blank `RESEND_API_KEY` or `MAIL_FROM`, `APP_MAIL_DEV_CONSOLE_OTP=true` logs the OTP and returns it in `/api/auth/send-otp` instead of emailing it. When both are configured, `send-otp` sends real mail through the Resend API.

## Production

- All backend config lives in `application.properties`: DB, JWT, mail, S3, CORS, Actuator, and frontend URL. Set `RESEND_API_KEY` in deployment and set `MAIL_FROM` to a sender verified in Resend; `JWT_SECRET` falls back safely instead of failing bean creation.
- Switch `application.properties` to `#spring.profiles.active=prod` / `spring.profiles.active=local` as needed, and replace the commented production `spring.datasource.*` block before deploying. `application-local.properties` and `application-prod.properties` contain only DDL/Flyway settings.
- Seed data never runs outside `local`/`dev`; set `ADMIN_BOOTSTRAP_EMAIL` and `ADMIN_BOOTSTRAP_PASSWORD` once to create the first admin if none exists. The `prod` profile uses Flyway with `ddl-auto=validate` and `spring.flyway.clean-disabled=true`; it never wipes the production database. Follow `roommates_BE/docs/database-migrations.md` for existing databases.
- Start with `docker compose up -d --build`. Backend listens on `8080`; nginx serves the frontend on `80`.
- Uploads: both local and production use the S3-compatible bucket configured by `STORAGE_BUCKET`, `STORAGE_ENDPOINT`, `STORAGE_REGION`, `STORAGE_ACCESS_KEY`, and `STORAGE_SECRET_KEY`. The backend stores objects under `rooms/` and serves them at `/uploads/rooms/...`; back up the bucket with the database. The key must allow `s3:PutObject`, `s3:GetObject`, and `s3:DeleteObject` on `roomates/*`; keep `STORAGE_PATH_STYLE_ACCESS=false` for Tigris.

## Health check

Spring Boot Actuator is configured. Use `GET /actuator/health` as the public probe; it returns 200 when the app and database are available, and Compose healthchecks the backend this way.

## CORS and frontend URL

- `CORS_ALLOWED_ORIGINS` must contain the exact browser origin (scheme + host + port). With the Compose nginx proxy, callers use the frontend origin, e.g. `http://localhost`; for direct API access, add the frontend origin used by users.
- `FRONTEND_URL` is used for links in outgoing mail; set it to the same public frontend origin.
- `VITE_API_URL` is compiled into the JS bundle by Vite and cannot be changed by runtime env vars. The Dockerfiles default it to `https://roommates-ky68.onrender.com`, so the browser calls the production backend directly. To use a different API origin, rebuild the frontend with `--build-arg VITE_API_URL=<origin>` and update `CORS_ALLOWED_ORIGINS` accordingly.
- `nginx.conf` is installed as an nginx template; the frontend image sets `NGINX_ENVSUBST_FILTER=BACKEND_URL` so `${BACKEND_URL}` is replaced at startup while nginx variables such as `$uri` remain intact.

## Tests before release

```bash
cd roommates_BE && ./mvnw -B test && ./mvnw -B -DskipTests package
cd roomets_FE && npm ci && npm run lint && npm test && npm run build
```

Backend tests use in-memory H2 and need no MySQL instance; see the root `README.md`.
