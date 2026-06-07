INSERT INTO sections (id, name, academic_level, cluster, adviser, room, schedule, capacity, academic_year_id) VALUES
  ('SEC-JH-7-MAT', 'St. Matthew', 'Grade 7', 'Junior High', 'Laila Khan', 'JH-204', 'Mon-Fri · 7:30 AM', 32, 'AY-2026-2027'),
  ('SEC-E-4-RIZ', 'Rizal', 'Grade 4', 'Elementary', 'Mina Alvarez', 'E-118', 'Mon-Fri · 8:00 AM', 30, 'AY-2026-2027'),
  ('SEC-SH-12-STEM', 'STEM 12-A', 'Grade 12', 'Senior High', 'Omar Farouk', 'SH-301', 'Mon-Fri · 7:45 AM', 28, 'AY-2026-2027'),
  ('SEC-JH-10-PEN', 'Grade 10 Holding', 'Grade 10', 'Junior High', 'Unassigned', 'To assign', 'Pending timetable', 30, 'AY-2026-2027')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  academic_level = EXCLUDED.academic_level,
  cluster = EXCLUDED.cluster,
  adviser = EXCLUDED.adviser,
  room = EXCLUDED.room,
  schedule = EXCLUDED.schedule,
  capacity = EXCLUDED.capacity,
  academic_year_id = EXCLUDED.academic_year_id,
  archived_at = NULL,
  updated_at = now();

INSERT INTO section_assignments (id, section_id, learner_id, learner_name, gender, status, academic_year_id) VALUES
  ('ASN-001', 'SEC-JH-7-MAT', 'STU-24091', 'Maria Santos', 'Female', 'active', 'AY-2026-2027'),
  ('ASN-002', 'SEC-JH-7-MAT', 'STU-24092', 'Ava Lim', 'Female', 'active', 'AY-2026-2027'),
  ('ASN-003', 'SEC-JH-7-MAT', 'STU-24093', 'Yousef Ali', 'Male', 'active', 'AY-2026-2027'),
  ('ASN-004', 'SEC-JH-7-MAT', 'STU-24094', 'Rafael Cruz', 'Male', 'active', 'AY-2026-2027'),
  ('ASN-005', 'SEC-JH-7-MAT', 'STU-24095', 'Noura Saeed', 'Female', 'active', 'AY-2026-2027'),
  ('ASN-006', 'SEC-E-4-RIZ', 'STU-24101', 'Ali Hassan', 'Male', 'active', 'AY-2026-2027'),
  ('ASN-007', 'SEC-E-4-RIZ', 'STU-24102', 'Sofia Reyes', 'Female', 'active', 'AY-2026-2027'),
  ('ASN-008', 'SEC-E-4-RIZ', 'STU-24103', 'Lucas Tan', 'Male', 'active', 'AY-2026-2027'),
  ('ASN-009', 'SEC-E-4-RIZ', 'STU-24104', 'Hana Kim', 'Female', 'active', 'AY-2026-2027'),
  ('ASN-010', 'SEC-E-4-RIZ', 'STU-24105', 'Miguel Dela Cruz', 'Male', 'active', 'AY-2026-2027'),
  ('ASN-011', 'SEC-SH-12-STEM', 'STU-2047', 'Zara Hassan', 'Female', 'active', 'AY-2026-2027'),
  ('ASN-012', 'SEC-SH-12-STEM', 'STU-24111', 'Priya Menon', 'Female', 'active', 'AY-2026-2027'),
  ('ASN-013', 'SEC-SH-12-STEM', 'STU-24112', 'Ethan Ramos', 'Male', 'active', 'AY-2026-2027'),
  ('ASN-014', 'SEC-SH-12-STEM', 'STU-24113', 'Salma Nasser', 'Female', 'active', 'AY-2026-2027'),
  ('ASN-015', 'SEC-SH-12-STEM', 'STU-24114', 'Noah Reyes', 'Male', 'active', 'AY-2026-2027'),
  ('ASN-016', 'SEC-JH-10-PEN', 'STU-24077', 'Kenji Reyes', 'Male', 'active', 'AY-2026-2027'),
  ('ASN-017', 'SEC-JH-10-PEN', 'STU-24121', 'Amir Patel', 'Male', 'active', 'AY-2026-2027'),
  ('ASN-018', 'SEC-JH-10-PEN', 'STU-24122', 'Fatima Noor', 'Female', 'active', 'AY-2026-2027'),
  ('ASN-019', 'SEC-JH-10-PEN', 'STU-24123', 'Daniel Garcia', 'Male', 'active', 'AY-2026-2027')
ON CONFLICT (id) DO UPDATE SET
  section_id = EXCLUDED.section_id,
  learner_id = EXCLUDED.learner_id,
  learner_name = EXCLUDED.learner_name,
  gender = EXCLUDED.gender,
  status = EXCLUDED.status,
  academic_year_id = EXCLUDED.academic_year_id,
  archived_at = NULL;
