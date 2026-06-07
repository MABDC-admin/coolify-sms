CREATE TABLE IF NOT EXISTS sections (
  id TEXT PRIMARY KEY,
  name TEXT NOT NULL,
  academic_level TEXT NOT NULL REFERENCES grade_levels(name),
  cluster TEXT NOT NULL CHECK (cluster IN ('Preschool', 'Elementary', 'Junior High', 'Senior High')),
  adviser TEXT NOT NULL DEFAULT 'Unassigned',
  room TEXT NOT NULL DEFAULT 'To assign',
  schedule TEXT NOT NULL DEFAULT 'Pending timetable',
  capacity INTEGER NOT NULL CHECK (capacity > 0),
  archived_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS section_assignments (
  id TEXT PRIMARY KEY,
  section_id TEXT NOT NULL REFERENCES sections(id) ON DELETE CASCADE,
  learner_id TEXT NOT NULL,
  learner_name TEXT NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('Male', 'Female')),
  status TEXT NOT NULL CHECK (status IN ('active', 'moved', 'archived')) DEFAULT 'active',
  assigned_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  moved_at TIMESTAMPTZ,
  archived_at TIMESTAMPTZ
);

CREATE UNIQUE INDEX IF NOT EXISTS idx_section_assignments_active_learner
  ON section_assignments(learner_id)
  WHERE status = 'active' AND archived_at IS NULL;

CREATE INDEX IF NOT EXISTS idx_section_assignments_section
  ON section_assignments(section_id);

CREATE TABLE IF NOT EXISTS section_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  learner_id TEXT,
  learner_name TEXT,
  from_section_id TEXT,
  to_section_id TEXT,
  action TEXT NOT NULL CHECK (action IN ('created_section', 'updated_section', 'archived_section', 'assigned_learner', 'moved_learner', 'removed_learner')),
  reason TEXT NOT NULL DEFAULT '',
  actor TEXT NOT NULL DEFAULT 'Registrar',
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_section_history_created_at
  ON section_history(created_at DESC);
