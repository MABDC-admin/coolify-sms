DO $$
BEGIN
  IF to_regclass('public.academic_levels') IS NULL AND to_regclass('public.courses') IS NOT NULL THEN
    ALTER TABLE courses RENAME TO academic_levels;
  END IF;
END $$;

DO $$
BEGIN
  IF EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'class_slots'
      AND column_name = 'course'
  ) AND NOT EXISTS (
    SELECT 1
    FROM information_schema.columns
    WHERE table_schema = 'public'
      AND table_name = 'class_slots'
      AND column_name = 'academic_level'
  ) THEN
    ALTER TABLE class_slots RENAME COLUMN course TO academic_level;
  END IF;
END $$;
