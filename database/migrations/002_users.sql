-- Migration: 002_users.sql
-- Adds the users table for production authentication.
-- Replaces the demo localStorage-based auth system.

CREATE TABLE IF NOT EXISTS users (
  id            UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
  email         VARCHAR(255)  NOT NULL,
  name          VARCHAR(255)  NOT NULL,
  role          VARCHAR(50)   NOT NULL CHECK (
                  role IN (
                    'Admin',
                    'Academic Director',
                    'Registrar',
                    'Teacher',
                    'Finance',
                    'Student'
                  )
                ),
  password_hash TEXT          NOT NULL,
  is_active     BOOLEAN       NOT NULL DEFAULT true,
  created_at    TIMESTAMPTZ   NOT NULL DEFAULT now(),
  updated_at    TIMESTAMPTZ   NOT NULL DEFAULT now()
);

-- Unique email index (case-insensitive)
CREATE UNIQUE INDEX IF NOT EXISTS users_email_unique_idx
  ON users (LOWER(email));

-- General lookup index
CREATE INDEX IF NOT EXISTS users_email_idx
  ON users (email);

-- Auto-update updated_at on row changes
CREATE OR REPLACE FUNCTION trigger_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS users_set_updated_at ON users;
CREATE TRIGGER users_set_updated_at
  BEFORE UPDATE ON users
  FOR EACH ROW
  EXECUTE FUNCTION trigger_set_updated_at();
