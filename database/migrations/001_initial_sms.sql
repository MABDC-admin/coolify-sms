CREATE EXTENSION IF NOT EXISTS pgcrypto;

CREATE TABLE IF NOT EXISTS grade_levels (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL UNIQUE,
  stage TEXT NOT NULL CHECK (stage IN ('Preschool', 'Elementary', 'Junior High', 'Senior High')),
  sort_order INTEGER NOT NULL UNIQUE,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS students (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT NOT NULL REFERENCES grade_levels(name),
  email TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL CHECK (status IN ('Active', 'On Leave', 'Pending', 'Graduated')),
  gpa NUMERIC(3,2) NOT NULL DEFAULT 0,
  enrolled TEXT NOT NULL,
  avatar TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS academic_levels (
  code TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  instructor TEXT NOT NULL,
  room TEXT NOT NULL,
  schedule TEXT NOT NULL,
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  enrolled INTEGER NOT NULL DEFAULT 0 CHECK (enrolled >= 0),
  department TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollment_applications (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  grade TEXT NOT NULL REFERENCES grade_levels(name),
  submitted TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('New', 'Review', 'Interview', 'Decision')),
  initials TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS activities (
  id TEXT PRIMARY KEY,
  type TEXT NOT NULL,
  message TEXT NOT NULL,
  time_label TEXT NOT NULL,
  initials TEXT NOT NULL,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS class_slots (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  time_label TEXT NOT NULL,
  academic_level TEXT NOT NULL,
  room TEXT NOT NULL,
  instructor TEXT NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'in-progress', 'completed')),
  sort_order INTEGER NOT NULL DEFAULT 0
);

CREATE TABLE IF NOT EXISTS alerts (
  id TEXT PRIMARY KEY,
  title TEXT NOT NULL,
  message TEXT NOT NULL,
  severity TEXT NOT NULL CHECK (severity IN ('warning', 'critical', 'info')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS enrollment_trends (
  month TEXT PRIMARY KEY,
  new_count INTEGER NOT NULL DEFAULT 0,
  returning_count INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS department_distribution (
  name TEXT PRIMARY KEY,
  value INTEGER NOT NULL DEFAULT 0,
  sort_order INTEGER NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS fee_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  item TEXT NOT NULL,
  tax_treatment TEXT NOT NULL CHECK (tax_treatment IN ('ZERO_RATED', 'STANDARD_5', 'EXEMPT', 'OUT_OF_SCOPE')),
  base_amount NUMERIC(12,2) NOT NULL,
  vat_amount NUMERIC(12,2) GENERATED ALWAYS AS (
    CASE WHEN tax_treatment = 'STANDARD_5' THEN round(base_amount * 0.05, 2) ELSE 0 END
  ) STORED,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_students_grade ON students(grade);
CREATE INDEX IF NOT EXISTS idx_students_status ON students(status);
CREATE INDEX IF NOT EXISTS idx_enrollment_applications_status ON enrollment_applications(status);
CREATE INDEX IF NOT EXISTS idx_activities_created_at ON activities(created_at DESC);
