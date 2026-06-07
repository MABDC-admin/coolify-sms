ALTER TABLE students
  ADD COLUMN IF NOT EXISTS lrn TEXT,
  ADD COLUMN IF NOT EXISTS birth_date DATE,
  ADD COLUMN IF NOT EXISTS age INTEGER,
  ADD COLUMN IF NOT EXISTS gender TEXT,
  ADD COLUMN IF NOT EXISTS mother_contact TEXT,
  ADD COLUMN IF NOT EXISTS mother_maiden_name TEXT,
  ADD COLUMN IF NOT EXISTS father_contact TEXT,
  ADD COLUMN IF NOT EXISTS father_name TEXT,
  ADD COLUMN IF NOT EXISTS philippine_address TEXT,
  ADD COLUMN IF NOT EXISTS uae_address TEXT,
  ADD COLUMN IF NOT EXISTS previous_school TEXT,
  ADD COLUMN IF NOT EXISTS source_file TEXT,
  ADD COLUMN IF NOT EXISTS imported_at TIMESTAMPTZ;

CREATE UNIQUE INDEX IF NOT EXISTS idx_students_lrn_unique
  ON students(lrn)
  WHERE lrn IS NOT NULL AND lrn <> '';

CREATE INDEX IF NOT EXISTS idx_students_year_grade
  ON students(academic_year_id, grade);

CREATE INDEX IF NOT EXISTS idx_students_source_file
  ON students(source_file);
