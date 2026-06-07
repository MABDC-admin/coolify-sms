INSERT INTO grade_levels (name, stage, sort_order) VALUES
  ('KG1', 'Preschool', 1),
  ('KG2', 'Preschool', 2),
  ('Grade 1', 'Elementary', 3),
  ('Grade 2', 'Elementary', 4),
  ('Grade 3', 'Elementary', 5),
  ('Grade 4', 'Elementary', 6),
  ('Grade 5', 'Elementary', 7),
  ('Grade 6', 'Elementary', 8),
  ('Grade 7', 'Junior High', 9),
  ('Grade 8', 'Junior High', 10),
  ('Grade 9', 'Junior High', 11),
  ('Grade 10', 'Junior High', 12),
  ('Grade 11', 'Senior High', 13),
  ('Grade 12', 'Senior High', 14)
ON CONFLICT (name) DO UPDATE SET stage = EXCLUDED.stage, sort_order = EXCLUDED.sort_order;

INSERT INTO students (id, name, grade, email, status, gpa, enrolled, avatar) VALUES
  ('STU-2041', 'Amelia Carter', 'Grade 11', 'amelia.c@scholaris.edu', 'Active', 3.92, 'Sep 2022', 'AC'),
  ('STU-2042', 'Noah Bennett', 'Grade 10', 'noah.b@scholaris.edu', 'Active', 3.74, 'Sep 2023', 'NB'),
  ('STU-2043', 'Sofia Ramirez', 'Grade 12', 'sofia.r@scholaris.edu', 'Pending', 3.85, 'Sep 2021', 'SR'),
  ('STU-2044', 'Liam Okafor', 'Grade 9', 'liam.o@scholaris.edu', 'Active', 3.61, 'Sep 2024', 'LO'),
  ('STU-2045', 'Mia Tanaka', 'Grade 11', 'mia.t@scholaris.edu', 'On Leave', 3.45, 'Sep 2022', 'MT'),
  ('STU-2046', 'Ethan Walsh', 'Grade 10', 'ethan.w@scholaris.edu', 'Active', 3.88, 'Sep 2023', 'EW'),
  ('STU-2047', 'Zara Hassan', 'Grade 12', 'zara.h@scholaris.edu', 'Active', 4.00, 'Sep 2021', 'ZH'),
  ('STU-2048', 'Lucas Kim', 'Grade 9', 'lucas.k@scholaris.edu', 'Pending', 3.32, 'Sep 2024', 'LK')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, grade = EXCLUDED.grade, email = EXCLUDED.email, status = EXCLUDED.status,
  gpa = EXCLUDED.gpa, enrolled = EXCLUDED.enrolled, avatar = EXCLUDED.avatar, updated_at = now();

INSERT INTO academic_levels (code, title, instructor, room, schedule, capacity, enrolled, department) VALUES
  ('MATH-301', 'Advanced Calculus', 'Dr. Elena Voss', 'B-204', 'Mon/Wed 9:00', 28, 26, 'Mathematics'),
  ('PHYS-210', 'Quantum Foundations', 'Prof. Marcus Reid', 'S-110', 'Tue/Thu 10:30', 24, 22, 'Science'),
  ('ENGL-220', 'Modern Literature', 'Ms. Priya Nair', 'H-301', 'Mon/Wed/Fri 11:00', 30, 28, 'Humanities'),
  ('HIST-150', 'World History II', 'Mr. Daniel Cho', 'H-205', 'Tue/Thu 13:00', 32, 30, 'Humanities'),
  ('CHEM-201', 'Organic Chemistry', 'Dr. Aisha Bello', 'S-220', 'Mon/Wed 14:00', 26, 19, 'Science'),
  ('ART-110', 'Studio Painting', 'Ms. Clara Yu', 'A-101', 'Fri 9:00', 18, 18, 'Arts'),
  ('SPAN-202', 'Spanish Intermediate', 'Sr. Javier Ortiz', 'L-115', 'Mon/Wed/Fri 10:00', 22, 17, 'Languages')
ON CONFLICT (code) DO UPDATE SET
  title = EXCLUDED.title, instructor = EXCLUDED.instructor, room = EXCLUDED.room, schedule = EXCLUDED.schedule,
  capacity = EXCLUDED.capacity, enrolled = EXCLUDED.enrolled, department = EXCLUDED.department, updated_at = now();

INSERT INTO enrollment_applications (id, name, grade, submitted, status, initials) VALUES
  ('APP-901', 'Olivia Hart', 'Grade 9', '2d ago', 'New', 'OH'),
  ('APP-902', 'Kai Nakamura', 'Grade 10', '3d ago', 'New', 'KN'),
  ('APP-903', 'Maya Patel', 'Grade 11', '5d ago', 'Review', 'MP'),
  ('APP-904', 'Theo Laurent', 'Grade 9', '6d ago', 'Review', 'TL'),
  ('APP-905', 'Iris Chen', 'Grade 12', '1w ago', 'Interview', 'IC'),
  ('APP-906', 'Daniel Rossi', 'Grade 10', '1w ago', 'Interview', 'DR'),
  ('APP-907', 'Hana Schmidt', 'Grade 11', '2w ago', 'Decision', 'HS')
ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name, grade = EXCLUDED.grade, submitted = EXCLUDED.submitted,
  status = EXCLUDED.status, initials = EXCLUDED.initials, updated_at = now();

INSERT INTO activities (id, type, message, time_label, initials) VALUES
  ('a1', 'enrollment', 'Liam Okafor enrolled in PHYS-210', '2m ago', 'LO'),
  ('a2', 'request', 'Sofia Ramirez submitted transcript request', '18m ago', 'SR'),
  ('a3', 'transfer', 'Mia Tanaka transferred to Section B', '1h ago', 'MT'),
  ('a4', 'grade', 'Q2 grades posted for MATH-301', '3h ago', 'EV'),
  ('a5', 'enrollment', '12 new applications received today', '5h ago', '+12')
ON CONFLICT (id) DO UPDATE SET message = EXCLUDED.message, time_label = EXCLUDED.time_label, initials = EXCLUDED.initials;

INSERT INTO class_slots (time_label, academic_level, room, instructor, status, sort_order) VALUES
  ('08:00 - 09:30', 'MATH-301', 'B-204', 'Dr. Elena Voss', 'completed', 1),
  ('09:30 - 11:00', 'PHYS-210', 'S-110', 'Prof. Marcus Reid', 'in-progress', 2),
  ('11:00 - 12:30', 'ENGL-220', 'H-301', 'Ms. Priya Nair', 'upcoming', 3),
  ('13:00 - 14:30', 'HIST-150', 'H-205', 'Mr. Daniel Cho', 'upcoming', 4),
  ('14:00 - 15:30', 'CHEM-201', 'S-220', 'Dr. Aisha Bello', 'upcoming', 5)
ON CONFLICT DO NOTHING;

INSERT INTO alerts (id, title, message, severity) VALUES
  ('al1', 'Academic level at capacity', 'ART-110 is now full (18/18)', 'warning'),
  ('al2', 'Transcript pending', '3 transcript requests awaiting approval', 'info'),
  ('al3', 'Low enrollment', 'CHEM-201 only has 19 of 26 seats filled', 'warning'),
  ('al4', 'Grade deadline', 'Q2 grades due in 2 days', 'critical')
ON CONFLICT (id) DO UPDATE SET title = EXCLUDED.title, message = EXCLUDED.message, severity = EXCLUDED.severity;

INSERT INTO enrollment_trends (month, new_count, returning_count, sort_order) VALUES
  ('Jan', 42, 318, 1), ('Feb', 38, 326, 2), ('Mar', 51, 334, 3),
  ('Apr', 47, 341, 4), ('May', 63, 352, 5), ('Jun', 58, 360, 6),
  ('Jul', 71, 372, 7), ('Aug', 94, 388, 8), ('Sep', 128, 410, 9)
ON CONFLICT (month) DO UPDATE SET new_count = EXCLUDED.new_count, returning_count = EXCLUDED.returning_count, sort_order = EXCLUDED.sort_order;

INSERT INTO department_distribution (name, value, sort_order) VALUES
  ('Mathematics', 312, 1), ('Science', 287, 2), ('Humanities', 254, 3),
  ('Languages', 188, 4), ('Arts', 142, 5)
ON CONFLICT (name) DO UPDATE SET value = EXCLUDED.value, sort_order = EXCLUDED.sort_order;

INSERT INTO fee_items (item, tax_treatment, base_amount) VALUES
  ('Tuition', 'ZERO_RATED', 18000),
  ('Uniform', 'STANDARD_5', 900),
  ('Transport', 'EXEMPT', 3200),
  ('Activity', 'STANDARD_5', 600);
