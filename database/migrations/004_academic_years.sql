CREATE TABLE IF NOT EXISTS academic_years (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL UNIQUE,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  status TEXT NOT NULL CHECK (status IN ('setup', 'active', 'closed', 'archived')) DEFAULT 'setup',
  enrollment_status TEXT NOT NULL CHECK (enrollment_status IN ('open', 'paused', 'closed')) DEFAULT 'paused',
  is_active BOOLEAN NOT NULL DEFAULT false,
  notes TEXT NOT NULL DEFAULT '',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  CHECK (end_date > start_date)
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_academic_years_single_active
  ON academic_years (is_active)
  WHERE is_active = true;

CREATE TABLE IF NOT EXISTS academic_terms (
  id TEXT PRIMARY KEY,
  academic_year_id TEXT NOT NULL REFERENCES academic_years(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  term_type TEXT NOT NULL CHECK (term_type IN ('quarter', 'semester', 'term')) DEFAULT 'quarter',
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  sort_order INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL CHECK (status IN ('upcoming', 'active', 'closed')) DEFAULT 'upcoming',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE (academic_year_id, name),
  CHECK (end_date > start_date)
);

INSERT INTO academic_years (id, name, start_date, end_date, status, enrollment_status, is_active, notes)
VALUES
  ('AY-2025-2026', '2025-2026', '2025-08-25', '2026-06-30', 'closed', 'closed', false, 'Historical year seeded for learner profile continuity.'),
  ('AY-2026-2027', '2026-2027', '2026-08-24', '2027-06-30', 'active', 'open', true, 'Current active registrar intake year.'),
  ('AY-2027-2028', '2027-2028', '2027-08-24', '2028-06-30', 'setup', 'paused', false, 'Prepared for next-year rollover planning.')
ON CONFLICT (id) DO UPDATE
SET name = EXCLUDED.name,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    status = EXCLUDED.status,
    enrollment_status = EXCLUDED.enrollment_status,
    is_active = EXCLUDED.is_active,
    notes = EXCLUDED.notes,
    updated_at = now();

INSERT INTO academic_terms (id, academic_year_id, name, term_type, start_date, end_date, sort_order, status)
VALUES
  ('AY-2026-2027-Q1', 'AY-2026-2027', 'Quarter 1', 'quarter', '2026-08-24', '2026-10-24', 1, 'upcoming'),
  ('AY-2026-2027-Q2', 'AY-2026-2027', 'Quarter 2', 'quarter', '2026-10-26', '2026-12-18', 2, 'upcoming'),
  ('AY-2026-2027-Q3', 'AY-2026-2027', 'Quarter 3', 'quarter', '2027-01-04', '2027-03-12', 3, 'upcoming'),
  ('AY-2026-2027-Q4', 'AY-2026-2027', 'Quarter 4', 'quarter', '2027-03-15', '2027-06-30', 4, 'upcoming')
ON CONFLICT (id) DO UPDATE
SET academic_year_id = EXCLUDED.academic_year_id,
    name = EXCLUDED.name,
    term_type = EXCLUDED.term_type,
    start_date = EXCLUDED.start_date,
    end_date = EXCLUDED.end_date,
    sort_order = EXCLUDED.sort_order,
    status = EXCLUDED.status,
    updated_at = now();

ALTER TABLE enrollment_applications
  ADD COLUMN IF NOT EXISTS academic_year_id TEXT REFERENCES academic_years(id);

UPDATE enrollment_applications
SET academic_year_id = 'AY-2026-2027'
WHERE academic_year_id IS NULL;

ALTER TABLE enrollment_applications
  ALTER COLUMN academic_year_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_enrollment_applications_academic_year
  ON enrollment_applications(academic_year_id);

ALTER TABLE students
  ADD COLUMN IF NOT EXISTS academic_year_id TEXT REFERENCES academic_years(id);

UPDATE students
SET academic_year_id = 'AY-2026-2027'
WHERE academic_year_id IS NULL;

CREATE INDEX IF NOT EXISTS idx_students_academic_year
  ON students(academic_year_id);

ALTER TABLE sections
  ADD COLUMN IF NOT EXISTS academic_year_id TEXT REFERENCES academic_years(id);

UPDATE sections
SET academic_year_id = 'AY-2026-2027'
WHERE academic_year_id IS NULL;

ALTER TABLE sections
  ALTER COLUMN academic_year_id SET NOT NULL;

CREATE INDEX IF NOT EXISTS idx_sections_academic_year
  ON sections(academic_year_id);

ALTER TABLE section_assignments
  ADD COLUMN IF NOT EXISTS academic_year_id TEXT REFERENCES academic_years(id);

UPDATE section_assignments AS assignment
SET academic_year_id = section.academic_year_id
FROM sections AS section
WHERE assignment.section_id = section.id
  AND assignment.academic_year_id IS NULL;

ALTER TABLE section_assignments
  ALTER COLUMN academic_year_id SET NOT NULL;

DROP INDEX IF EXISTS idx_section_assignments_active_learner;

CREATE UNIQUE INDEX IF NOT EXISTS idx_section_assignments_active_learner_year
  ON section_assignments(academic_year_id, learner_id)
  WHERE status = 'active' AND archived_at IS NULL;
