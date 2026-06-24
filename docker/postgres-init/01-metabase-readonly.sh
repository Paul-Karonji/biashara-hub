#!/bin/bash
# =============================================================================
# Postgres Initialisation Script — runs ONCE on first container start
# Creates a read-only user for Metabase analytics so it cannot mutate
# application data even if the Metabase account is compromised.
# =============================================================================
set -e

# The METABASE_RO_PASSWORD env var is injected by docker-compose
RO_USER="metabase_ro"
RO_PASS="${METABASE_RO_PASSWORD:-metabase_readonly_change_me}"
APP_DB="ke_ecommerce"

psql -v ON_ERROR_STOP=1 --username "$POSTGRES_USER" --dbname "$APP_DB" <<-EOSQL
  -- 1. Create the read-only role if it doesn't exist
  DO \$\$
  BEGIN
    IF NOT EXISTS (SELECT FROM pg_catalog.pg_roles WHERE rolname = '${RO_USER}') THEN
      CREATE ROLE ${RO_USER} WITH LOGIN PASSWORD '${RO_PASS}' NOINHERIT;
    END IF;
  END
  \$\$;

  -- 2. Grant CONNECT on the application database
  GRANT CONNECT ON DATABASE ${APP_DB} TO ${RO_USER};

  -- 3. Grant USAGE on the public schema
  GRANT USAGE ON SCHEMA public TO ${RO_USER};

  -- 4. Grant SELECT on all existing tables
  GRANT SELECT ON ALL TABLES IN SCHEMA public TO ${RO_USER};

  -- 5. Auto-grant SELECT on future tables as well
  ALTER DEFAULT PRIVILEGES IN SCHEMA public
    GRANT SELECT ON TABLES TO ${RO_USER};

  -- 6. Do NOT grant INSERT, UPDATE, DELETE, or TRUNCATE
EOSQL

echo "[Init] Read-only user '${RO_USER}' created and granted SELECT on all tables in '${APP_DB}'."
