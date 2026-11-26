# Database migrations

Flyway is disabled by default so local development can keep using Hibernate `ddl-auto=update`.

## Production (`prod` profile)

- `spring.jpa.hibernate.ddl-auto=validate` prevents Hibernate from changing the schema.
- Flyway runs `classpath:db/migration` with `baseline-on-migrate=true` and baseline version `1`.

For a database that already has a Hibernate-generated schema:

1. Take a backup.
2. Start once with `prod` active: Flyway records the existing schema as baseline version 1 and skips `V1__baseline.sql`.
3. Verify with `SELECT * FROM flyway_schema_history;` that version 1 is marked `Baseline`.
4. Drop the obsolete plaintext `cpassword` column if it still exists: `ALTER TABLE users_tb DROP COLUMN cpassword;`
5. Confirm every entity column exists. Only baseline a complete schema: on a partial schema Flyway skips `V1__baseline.sql` and `ddl-auto=validate` fails startup. Repair or recreate the database, then re-baseline rather than adding a migration that pretends the tables already exist.

For an empty database, `V1__baseline.sql` creates the schema and Flyway marks it as a normal migration.

## Required environment variables

- `JWT_SECRET` (at least 256 bits)
- `DB_USERNAME`
- `DB_PASSWORD`
- `DB_URL` (optional; defaults to local MySQL)
- `MAIL_USERNAME`, `MAIL_PASSWORD`, `MAIL_FROM` (required to send email)
- `ADMIN_BOOTSTRAP_EMAIL`, `ADMIN_BOOTSTRAP_PASSWORD` (optional, `prod` only, first admin only)

Seed demo/admin accounts are only created when the `dev` profile is active. In `prod`, the bootstrap admin is created only when both admin variables are set and the email does not already exist.
