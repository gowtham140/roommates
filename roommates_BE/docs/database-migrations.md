# Database migrations

Flyway is disabled by default so local development can keep using Hibernate `ddl-auto=update`.

## Production (`prod` profile)

- `spring.jpa.hibernate.ddl-auto=validate` prevents Hibernate from changing the schema.
- Flyway runs `classpath:db/migration` with `baseline-on-migrate=true` and baseline version `1`.
- `schema.sql` runs in `prod` and `local` as an idempotent safety net so `feedback_tb` exists even when the database has no `flyway_schema_history`.

For a database that already has a Hibernate-generated schema:

1. Take a backup.
2. Start once with `prod` active: Flyway records the existing schema as baseline version 1 and skips `V1__baseline.sql`.
3. Verify with `SELECT * FROM flyway_schema_history;` that version 1 is marked `Baseline`.
4. Drop the obsolete plaintext `cpassword` column if it still exists: `ALTER TABLE users_tb DROP COLUMN cpassword;`
5. Confirm every entity column exists. Only baseline a complete schema: on a partial schema Flyway skips `V1__baseline.sql` and `ddl-auto=validate` fails startup. Repair or recreate the database, then re-baseline rather than adding a migration that pretends the tables already exist.

For an empty database, `V1__baseline.sql` creates the schema and Flyway marks it as a normal migration.

## Required application.properties values

- `jwt.secret` (at least 256 bits)
- `spring.datasource.username`
- `spring.datasource.password`
- `spring.datasource.url` (defaults to local MySQL)
- `brevo.api.key`, `app.mail.from` (required to send email; `resend.api.key` is optional fallback)
- `app.admin.bootstrap.email`, `app.admin.bootstrap.password` (optional, `prod` only, first admin only)

Seed demo/admin accounts are only created when the `local` profile is active. In `prod`, the bootstrap admin is created only when both admin values are set and the email does not already exist.
