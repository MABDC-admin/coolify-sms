import {
  activities,
  academicLevels,
  alerts,
  departmentDistribution,
  enrollmentTrend,
  todaysClasses,
  students,
  type AcademicLevel,
  type AlertItem,
  type ClassSlot,
  type PipelineStage,
  type Student,
} from "@/lib/mock-data";
import { hasDatabase, query, queryOne } from "@/lib/db.server";
import {
  canAcceptRegistration,
  getActiveAcademicYear,
  normalizeAcademicYear,
  validateAcademicYearTransition,
  type AcademicYearEnrollmentStatus,
  type AcademicYearRecord,
  type AcademicYearStatus,
} from "@/lib/academic-years-rules";
import { getSectionCapacityStatus, validateSectionAssignment, type SectionCapacityStatus } from "@/lib/sections-rules";

export type EnrollmentApplication = {
  id: string;
  name: string;
  grade: string;
  submitted: string;
  status: "New" | "Review" | "Interview" | "Decision";
  initials: string;
};

export type RegistrationPayload = {
  learnerFirstName: string;
  learnerLastName: string;
  dateOfBirth: string;
  gender: string;
  grade: string;
  academicYear: string;
  previousSchool?: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  emiratesId?: string;
  nationality?: string;
  address?: string;
  feePlan: string;
  documents: string[];
  notes?: string;
};

export type FeeItem = {
  item: string;
  tax: "Zero-rated" | "5% VAT" | "Exempt" | "Out of scope";
  tag: "zero" | "vat" | "exempt" | "out";
  base: string;
  vat: string;
};

export type SectionAssignment = {
  id: string;
  sectionId: string;
  learnerId: string;
  learnerName: string;
  gender: "Male" | "Female";
  status: "active" | "moved" | "archived";
};

export type RegistrarSection = {
  id: string;
  name: string;
  academicLevel: string;
  cluster: "Preschool" | "Elementary" | "Junior High" | "Senior High";
  adviser: string;
  room: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  male: number;
  female: number;
  status: SectionCapacityStatus;
  conflicts: string[];
  learners: string[];
  assignments: SectionAssignment[];
};

export type SectionFormPayload = {
  name: string;
  academicLevel: string;
  cluster: RegistrarSection["cluster"];
  adviser: string;
  room: string;
  schedule: string;
  capacity: number;
};

export type LearnerAssignmentPayload = {
  sectionId: string;
  learnerName: string;
  gender: "Male" | "Female";
  learnerId?: string;
};

export type MoveLearnerPayload = {
  assignmentId: string;
  toSectionId: string;
};

export type SectionsAssignmentData = {
  sections: RegistrarSection[];
  unassignedLearners: Array<{ name: string; level: string; type: string; issue: string; gender: "Male" | "Female" }>;
  classSlots: Array<{ time: string; monday: string; tuesday: string; room: string; adviser: string }>;
  gradeBands: Array<{ label: string; range: string; sections: number; learners: number; fill: number }>;
  history: Array<{ action: string; learnerName: string; reason: string; createdAt: string }>;
};

export type AcademicTerm = {
  id: string;
  academicYearId: string;
  name: string;
  termType: "quarter" | "semester" | "term";
  startDate: string;
  endDate: string;
  sortOrder: number;
  status: "upcoming" | "active" | "closed";
};

export type AcademicYearsData = {
  years: AcademicYearRecord[];
  activeYear: AcademicYearRecord | null;
  terms: AcademicTerm[];
};

export type AcademicYearFormPayload = {
  startYear: number;
  notes?: string;
};

export type AcademicYearUpdatePayload = {
  id: string;
  enrollmentStatus?: AcademicYearEnrollmentStatus;
  status?: AcademicYearStatus;
  notes?: string;
};

const fallbackApplications: EnrollmentApplication[] = [
  { id: "APP-901", name: "Olivia Hart", grade: "Grade 9", submitted: "2d ago", status: "New", initials: "OH" },
  { id: "APP-902", name: "Kai Nakamura", grade: "Grade 10", submitted: "3d ago", status: "New", initials: "KN" },
  { id: "APP-903", name: "Maya Patel", grade: "Grade 11", submitted: "5d ago", status: "Review", initials: "MP" },
  { id: "APP-904", name: "Theo Laurent", grade: "Grade 9", submitted: "6d ago", status: "Review", initials: "TL" },
  { id: "APP-905", name: "Iris Chen", grade: "Grade 12", submitted: "1w ago", status: "Interview", initials: "IC" },
  { id: "APP-906", name: "Daniel Rossi", grade: "Grade 10", submitted: "1w ago", status: "Interview", initials: "DR" },
  { id: "APP-907", name: "Hana Schmidt", grade: "Grade 11", submitted: "2w ago", status: "Decision", initials: "HS" },
];

const fallbackSectionsBase: Array<Omit<RegistrarSection, "enrolled" | "male" | "female" | "status" | "conflicts" | "learners" | "assignments">> = [
  { id: "SEC-JH-7-MAT", name: "St. Matthew", academicLevel: "Grade 7", cluster: "Junior High", adviser: "Laila Khan", room: "JH-204", schedule: "Mon-Fri · 7:30 AM", capacity: 32 },
  { id: "SEC-E-4-RIZ", name: "Rizal", academicLevel: "Grade 4", cluster: "Elementary", adviser: "Mina Alvarez", room: "E-118", schedule: "Mon-Fri · 8:00 AM", capacity: 30 },
  { id: "SEC-SH-12-STEM", name: "STEM 12-A", academicLevel: "Grade 12", cluster: "Senior High", adviser: "Omar Farouk", room: "SH-301", schedule: "Mon-Fri · 7:45 AM", capacity: 28 },
  { id: "SEC-JH-10-PEN", name: "Grade 10 Holding", academicLevel: "Grade 10", cluster: "Junior High", adviser: "Unassigned", room: "To assign", schedule: "Pending timetable", capacity: 30 },
];

let fallbackSections = [...fallbackSectionsBase];

let fallbackSectionAssignments: SectionAssignment[] = [
  { id: "ASN-001", sectionId: "SEC-JH-7-MAT", learnerId: "STU-24091", learnerName: "Maria Santos", gender: "Female", status: "active" },
  { id: "ASN-002", sectionId: "SEC-JH-7-MAT", learnerId: "STU-24092", learnerName: "Ava Lim", gender: "Female", status: "active" },
  { id: "ASN-003", sectionId: "SEC-JH-7-MAT", learnerId: "STU-24093", learnerName: "Yousef Ali", gender: "Male", status: "active" },
  { id: "ASN-004", sectionId: "SEC-JH-7-MAT", learnerId: "STU-24094", learnerName: "Rafael Cruz", gender: "Male", status: "active" },
  { id: "ASN-005", sectionId: "SEC-JH-7-MAT", learnerId: "STU-24095", learnerName: "Noura Saeed", gender: "Female", status: "active" },
  { id: "ASN-006", sectionId: "SEC-E-4-RIZ", learnerId: "STU-24101", learnerName: "Ali Hassan", gender: "Male", status: "active" },
  { id: "ASN-007", sectionId: "SEC-E-4-RIZ", learnerId: "STU-24102", learnerName: "Sofia Reyes", gender: "Female", status: "active" },
  { id: "ASN-008", sectionId: "SEC-E-4-RIZ", learnerId: "STU-24103", learnerName: "Lucas Tan", gender: "Male", status: "active" },
  { id: "ASN-009", sectionId: "SEC-E-4-RIZ", learnerId: "STU-24104", learnerName: "Hana Kim", gender: "Female", status: "active" },
  { id: "ASN-010", sectionId: "SEC-E-4-RIZ", learnerId: "STU-24105", learnerName: "Miguel Dela Cruz", gender: "Male", status: "active" },
  { id: "ASN-011", sectionId: "SEC-SH-12-STEM", learnerId: "STU-2047", learnerName: "Zara Hassan", gender: "Female", status: "active" },
  { id: "ASN-012", sectionId: "SEC-SH-12-STEM", learnerId: "STU-24111", learnerName: "Priya Menon", gender: "Female", status: "active" },
  { id: "ASN-013", sectionId: "SEC-SH-12-STEM", learnerId: "STU-24112", learnerName: "Ethan Ramos", gender: "Male", status: "active" },
  { id: "ASN-014", sectionId: "SEC-SH-12-STEM", learnerId: "STU-24113", learnerName: "Salma Nasser", gender: "Female", status: "active" },
  { id: "ASN-015", sectionId: "SEC-SH-12-STEM", learnerId: "STU-24114", learnerName: "Noah Reyes", gender: "Male", status: "active" },
  { id: "ASN-016", sectionId: "SEC-JH-10-PEN", learnerId: "STU-24077", learnerName: "Kenji Reyes", gender: "Male", status: "active" },
  { id: "ASN-017", sectionId: "SEC-JH-10-PEN", learnerId: "STU-24121", learnerName: "Amir Patel", gender: "Male", status: "active" },
  { id: "ASN-018", sectionId: "SEC-JH-10-PEN", learnerId: "STU-24122", learnerName: "Fatima Noor", gender: "Female", status: "active" },
  { id: "ASN-019", sectionId: "SEC-JH-10-PEN", learnerId: "STU-24123", learnerName: "Daniel Garcia", gender: "Male", status: "active" },
];

const fallbackUnassignedLearners = [
  { name: "Leah Bautista", level: "Grade 7", type: "New", issue: "Needs section match", gender: "Female" as const },
  { name: "Rami Haddad", level: "Grade 4", type: "Returnee", issue: "Guardian confirmation", gender: "Male" as const },
  { name: "Aya Nakamura", level: "KG2", type: "New", issue: "Capacity check", gender: "Female" as const },
];

let fallbackAcademicYears: AcademicYearRecord[] = [
  { id: "AY-2025-2026", name: "2025-2026", startDate: "2025-08-25", endDate: "2026-06-30", status: "closed", enrollmentStatus: "closed", isActive: false },
  { id: "AY-2026-2027", name: "2026-2027", startDate: "2026-08-24", endDate: "2027-06-30", status: "active", enrollmentStatus: "open", isActive: true },
  { id: "AY-2027-2028", name: "2027-2028", startDate: "2027-08-24", endDate: "2028-06-30", status: "setup", enrollmentStatus: "paused", isActive: false },
];

let fallbackAcademicTerms: AcademicTerm[] = [
  { id: "AY-2026-2027-Q1", academicYearId: "AY-2026-2027", name: "Quarter 1", termType: "quarter", startDate: "2026-08-24", endDate: "2026-10-24", sortOrder: 1, status: "upcoming" },
  { id: "AY-2026-2027-Q2", academicYearId: "AY-2026-2027", name: "Quarter 2", termType: "quarter", startDate: "2026-10-26", endDate: "2026-12-18", sortOrder: 2, status: "upcoming" },
  { id: "AY-2026-2027-Q3", academicYearId: "AY-2026-2027", name: "Quarter 3", termType: "quarter", startDate: "2027-01-04", endDate: "2027-03-12", sortOrder: 3, status: "upcoming" },
  { id: "AY-2026-2027-Q4", academicYearId: "AY-2026-2027", name: "Quarter 4", termType: "quarter", startDate: "2027-03-15", endDate: "2027-06-30", sortOrder: 4, status: "upcoming" },
];

export async function getAcademicYearsData(): Promise<AcademicYearsData> {
  if (!hasDatabase()) {
    return {
      years: [...fallbackAcademicYears].sort((a, b) => b.name.localeCompare(a.name)),
      activeYear: getActiveAcademicYear(fallbackAcademicYears),
      terms: fallbackAcademicTerms,
    };
  }

  const years = await query<AcademicYearRecord>(`
    SELECT id,
           name,
           start_date::text AS "startDate",
           end_date::text AS "endDate",
           status,
           enrollment_status AS "enrollmentStatus",
           is_active AS "isActive"
    FROM academic_years
    ORDER BY start_date DESC
  `);

  const terms = await query<AcademicTerm>(`
    SELECT id,
           academic_year_id AS "academicYearId",
           name,
           term_type AS "termType",
           start_date::text AS "startDate",
           end_date::text AS "endDate",
           sort_order AS "sortOrder",
           status
    FROM academic_terms
    ORDER BY academic_year_id DESC, sort_order
  `);

  return { years, activeYear: getActiveAcademicYear(years), terms };
}

export async function createAcademicYearRecord(payload: AcademicYearFormPayload): Promise<AcademicYearRecord> {
  const normalized = normalizeAcademicYear({ startYear: payload.startYear });
  const record: AcademicYearRecord = {
    id: `AY-${normalized.name}`,
    name: normalized.name,
    startDate: normalized.startDate,
    endDate: normalized.endDate,
    status: "setup",
    enrollmentStatus: "paused",
    isActive: false,
  };

  if (!hasDatabase()) {
    if (!fallbackAcademicYears.some((year) => year.id === record.id)) fallbackAcademicYears.unshift(record);
    return record;
  }

  const saved = await queryOne<AcademicYearRecord>(
    `
      INSERT INTO academic_years (id, name, start_date, end_date, status, enrollment_status, is_active, notes)
      VALUES ($1, $2, $3, $4, 'setup', 'paused', false, $5)
      ON CONFLICT (id) DO UPDATE
      SET notes = EXCLUDED.notes,
          updated_at = now()
      RETURNING id, name, start_date::text AS "startDate", end_date::text AS "endDate", status, enrollment_status AS "enrollmentStatus", is_active AS "isActive"
    `,
    [record.id, record.name, record.startDate, record.endDate, payload.notes ?? ""],
  );

  return saved ?? record;
}

export async function setActiveAcademicYearRecord(id: string): Promise<AcademicYearRecord | null> {
  if (!hasDatabase()) {
    fallbackAcademicYears = fallbackAcademicYears.map((year) => ({
      ...year,
      isActive: year.id === id,
      status: year.id === id ? "active" : year.status === "active" ? "setup" : year.status,
      enrollmentStatus: year.id === id ? "open" : year.enrollmentStatus,
    }));
    return fallbackAcademicYears.find((year) => year.id === id) ?? null;
  }

  const current = await queryOne<{ status: AcademicYearStatus }>("SELECT status FROM academic_years WHERE id = $1", [id]);
  if (!current) return null;
  const transition = validateAcademicYearTransition(current.status, "active");
  if (!transition.ok) throw new Error(transition.reason);

  await query("UPDATE academic_years SET is_active = false, status = CASE WHEN status = 'active' THEN 'setup' ELSE status END, updated_at = now() WHERE is_active = true");

  return queryOne<AcademicYearRecord>(
    `
      UPDATE academic_years
      SET is_active = true,
          status = 'active',
          enrollment_status = 'open',
          updated_at = now()
      WHERE id = $1
      RETURNING id, name, start_date::text AS "startDate", end_date::text AS "endDate", status, enrollment_status AS "enrollmentStatus", is_active AS "isActive"
    `,
    [id],
  );
}

export async function updateAcademicYearRecord(payload: AcademicYearUpdatePayload): Promise<AcademicYearRecord | null> {
  if (!hasDatabase()) {
    fallbackAcademicYears = fallbackAcademicYears.map((year) => year.id === payload.id ? {
      ...year,
      status: payload.status ?? year.status,
      enrollmentStatus: payload.enrollmentStatus ?? year.enrollmentStatus,
    } : year);
    return fallbackAcademicYears.find((year) => year.id === payload.id) ?? null;
  }

  return queryOne<AcademicYearRecord>(
    `
      UPDATE academic_years
      SET status = COALESCE($2, status),
          enrollment_status = COALESCE($3, enrollment_status),
          notes = COALESCE($4, notes),
          updated_at = now()
      WHERE id = $1
      RETURNING id, name, start_date::text AS "startDate", end_date::text AS "endDate", status, enrollment_status AS "enrollmentStatus", is_active AS "isActive"
    `,
    [payload.id, payload.status ?? null, payload.enrollmentStatus ?? null, payload.notes ?? null],
  );
}

export async function getStudentsData(): Promise<Student[]> {
  if (!hasDatabase()) return students;

  return query<Student>(`
    SELECT id,
           name,
           grade,
           email,
           status,
           gpa::float AS gpa,
           enrolled,
           avatar,
           academic_year_id AS "academicYearId",
           lrn,
           birth_date::text AS "birthDate",
           age,
           gender,
           mother_contact AS "motherContact",
           mother_maiden_name AS "motherMaidenName",
           father_contact AS "fatherContact",
           father_name AS "fatherName",
           philippine_address AS "philippineAddress",
           uae_address AS "uaeAddress",
           previous_school AS "previousSchool",
           source_file AS "sourceFile"
    FROM students
    ORDER BY academic_year_id DESC NULLS LAST, grade, name
  `);
}

export async function getAcademicLevelsData(): Promise<AcademicLevel[]> {
  if (!hasDatabase()) return academicLevels;

  return query<AcademicLevel>(`
    SELECT code, title, instructor, room, schedule, capacity, enrolled, department
    FROM academic_levels
    ORDER BY code
  `);
}

export async function getEnrollmentApplications(): Promise<EnrollmentApplication[]> {
  if (!hasDatabase()) return fallbackApplications;

  return query<EnrollmentApplication>(`
    SELECT id, name, grade, submitted, status, initials
    FROM enrollment_applications
    ORDER BY created_at, id
  `);
}

export async function advanceEnrollmentApplication(id: string): Promise<EnrollmentApplication | null> {
  const order: EnrollmentApplication["status"][] = ["New", "Review", "Interview", "Decision"];

  if (!hasDatabase()) {
    const current = fallbackApplications.find((app) => app.id === id);
    if (!current) return null;
    const next = order[Math.min(order.indexOf(current.status) + 1, order.length - 1)];
    return { ...current, status: next };
  }

  return queryOne<EnrollmentApplication>(
    `
      UPDATE enrollment_applications
      SET status = CASE status
        WHEN 'New' THEN 'Review'
        WHEN 'Review' THEN 'Interview'
        WHEN 'Interview' THEN 'Decision'
        ELSE 'Decision'
      END,
      updated_at = now()
      WHERE id = $1
      RETURNING id, name, grade, submitted, status, initials
    `,
    [id],
  );
}

export async function createEnrollmentApplication(payload: RegistrationPayload): Promise<EnrollmentApplication> {
  const fullName = `${payload.learnerFirstName.trim()} ${payload.learnerLastName.trim()}`.trim();
  const academicYear = await findAcademicYearForRegistration(payload.academicYear);
  const application: EnrollmentApplication = {
    id: `APP-${Date.now().toString().slice(-6)}`,
    name: fullName,
    grade: payload.grade,
    submitted: "Just now",
    status: "New",
    initials: initialsFor(fullName),
  };

  if (!academicYear || !canAcceptRegistration(academicYear)) {
    throw new Error("Selected academic year is not accepting registrations.");
  }

  if (!hasDatabase()) {
    fallbackApplications.unshift(application);
    return application;
  }

  const saved = await queryOne<EnrollmentApplication>(
    `
      INSERT INTO enrollment_applications (id, name, grade, submitted, status, initials, academic_year_id)
      VALUES ($1, $2, $3, 'Just now', 'New', $4, $5)
      RETURNING id, name, grade, submitted, status, initials
    `,
    [application.id, application.name, application.grade, application.initials, academicYear.id],
  );

  return saved ?? application;
}

export async function getSectionsAssignmentData(): Promise<SectionsAssignmentData> {
  const activeYear = await getCurrentAcademicYearRecord();
  const sectionRows = hasDatabase()
    ? await query<{
        id: string;
        name: string;
        academicLevel: string;
        cluster: RegistrarSection["cluster"];
        adviser: string;
        room: string;
        schedule: string;
        capacity: number;
      }>(`
        SELECT id, name, academic_level AS "academicLevel", cluster, adviser, room, schedule, capacity
        FROM sections
        WHERE archived_at IS NULL
          AND academic_year_id = $1
        ORDER BY academic_level, name
      `, [activeYear?.id ?? "AY-2026-2027"])
    : fallbackSections;

  const assignmentRows = hasDatabase()
    ? await query<SectionAssignment>(`
        SELECT id, section_id AS "sectionId", learner_id AS "learnerId", learner_name AS "learnerName", gender, status
        FROM section_assignments
        WHERE archived_at IS NULL
          AND academic_year_id = $1
        ORDER BY assigned_at, learner_name
      `, [activeYear?.id ?? "AY-2026-2027"])
    : fallbackSectionAssignments;

  const historyRows = hasDatabase()
    ? await query<{ action: string; learnerName: string; reason: string; createdAt: string }>(`
        SELECT action, COALESCE(learner_name, '') AS "learnerName", reason, to_char(created_at, 'Mon DD, HH24:MI') AS "createdAt"
        FROM section_history
        ORDER BY created_at DESC
        LIMIT 8
      `)
    : [];

  const sections = buildRegistrarSections(sectionRows, assignmentRows);

  return {
    sections,
    unassignedLearners: fallbackUnassignedLearners.filter(
      (learner) => !assignmentRows.some((assignment) => assignment.learnerName === learner.name && assignment.status === "active"),
    ),
    classSlots: buildClassSlots(sections),
    gradeBands: buildGradeBands(sections),
    history: historyRows,
  };
}

export async function createRegistrarSection(payload: SectionFormPayload): Promise<RegistrarSection> {
  const id = `SEC-${Date.now().toString(36).toUpperCase()}`;
  const activeYear = await getCurrentAcademicYearRecord();

  if (!hasDatabase()) {
    fallbackSections = [...fallbackSections, { ...payload, id }];
    return buildRegistrarSections(fallbackSections, fallbackSectionAssignments).find((section) => section.id === id)!;
  }

  const row = await queryOne<{
    id: string;
    name: string;
    academicLevel: string;
    cluster: RegistrarSection["cluster"];
    adviser: string;
    room: string;
    schedule: string;
    capacity: number;
  }>(
    `
      INSERT INTO sections (id, name, academic_level, cluster, adviser, room, schedule, capacity, academic_year_id)
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)
      RETURNING id, name, academic_level AS "academicLevel", cluster, adviser, room, schedule, capacity
    `,
    [id, payload.name, payload.academicLevel, payload.cluster, payload.adviser, payload.room, payload.schedule, payload.capacity, activeYear?.id ?? "AY-2026-2027"],
  );

  await insertSectionHistory({ action: "created_section", toSectionId: id, reason: `Created ${payload.name}` });
  return buildRegistrarSections([row!], [])[0];
}

export async function updateRegistrarSection(id: string, payload: SectionFormPayload): Promise<RegistrarSection | null> {
  if (!hasDatabase()) {
    fallbackSections = fallbackSections.map((section) => section.id === id ? { ...section, ...payload } : section);
    return buildRegistrarSections(fallbackSections, fallbackSectionAssignments).find((section) => section.id === id) ?? null;
  }

  const row = await queryOne<{
    id: string;
    name: string;
    academicLevel: string;
    cluster: RegistrarSection["cluster"];
    adviser: string;
    room: string;
    schedule: string;
    capacity: number;
  }>(
    `
      UPDATE sections
      SET name = $2, academic_level = $3, cluster = $4, adviser = $5, room = $6, schedule = $7, capacity = $8, updated_at = now()
      WHERE id = $1 AND archived_at IS NULL
      RETURNING id, name, academic_level AS "academicLevel", cluster, adviser, room, schedule, capacity
    `,
    [id, payload.name, payload.academicLevel, payload.cluster, payload.adviser, payload.room, payload.schedule, payload.capacity],
  );

  if (!row) return null;
  await insertSectionHistory({ action: "updated_section", toSectionId: id, reason: `Updated ${payload.name}` });
  const assignments = await getAssignmentsForSections([id]);
  return buildRegistrarSections([row], assignments)[0];
}

export async function archiveRegistrarSection(id: string): Promise<{ ok: true }> {
  if (!hasDatabase()) {
    fallbackSections = fallbackSections.filter((section) => section.id !== id);
    fallbackSectionAssignments = fallbackSectionAssignments.map((assignment) =>
      assignment.sectionId === id ? { ...assignment, status: "archived" } : assignment,
    );
    return { ok: true };
  }

  await query(
    "UPDATE sections SET archived_at = now(), updated_at = now() WHERE id = $1 AND archived_at IS NULL",
    [id],
  );
  await query(
    "UPDATE section_assignments SET status = 'archived', archived_at = now() WHERE section_id = $1 AND status = 'active'",
    [id],
  );
  await insertSectionHistory({ action: "archived_section", fromSectionId: id, reason: "Archived section" });
  return { ok: true };
}

export async function assignLearnerToSection(payload: LearnerAssignmentPayload): Promise<SectionAssignment> {
  const section = await findSectionForAssignment(payload.sectionId);
  if (!section) throw new Error("Section not found");

  const activeAssignments = await getActiveAssignments();
  const enrolled = activeAssignments.filter((assignment) => assignment.sectionId === payload.sectionId).length;
  const learnerId = payload.learnerId?.trim() || `TMP-${slugFor(payload.learnerName)}-${Date.now().toString(36)}`;
  const validation = validateSectionAssignment({
    sectionId: payload.sectionId,
    learnerId,
    capacity: section.capacity,
    enrolled,
    existingAssignments: activeAssignments,
  });

  if (!validation.ok) throw new Error(validation.reason);

  const assignment: SectionAssignment = {
    id: `ASN-${Date.now().toString(36).toUpperCase()}`,
    sectionId: payload.sectionId,
    learnerId,
    learnerName: payload.learnerName,
    gender: payload.gender,
    status: "active",
  };

  if (!hasDatabase()) {
    fallbackSectionAssignments = [...fallbackSectionAssignments, assignment];
    return assignment;
  }

  const saved = await queryOne<SectionAssignment>(
    `
      INSERT INTO section_assignments (id, section_id, learner_id, learner_name, gender, status, academic_year_id)
      VALUES ($1, $2, $3, $4, $5, 'active', (SELECT academic_year_id FROM sections WHERE id = $2))
      RETURNING id, section_id AS "sectionId", learner_id AS "learnerId", learner_name AS "learnerName", gender, status
    `,
    [assignment.id, assignment.sectionId, assignment.learnerId, assignment.learnerName, assignment.gender],
  );
  await insertSectionHistory({
    action: "assigned_learner",
    learnerId: assignment.learnerId,
    learnerName: assignment.learnerName,
    toSectionId: assignment.sectionId,
    reason: "Assigned learner to section",
  });
  return saved ?? assignment;
}

export async function moveLearnerToSection(payload: MoveLearnerPayload): Promise<SectionAssignment> {
  const activeAssignments = await getActiveAssignments();
  const current = activeAssignments.find((assignment) => assignment.id === payload.assignmentId);
  if (!current) throw new Error("Assignment not found");

  const target = await findSectionForAssignment(payload.toSectionId);
  if (!target) throw new Error("Target section not found");

  const targetEnrolled = activeAssignments.filter((assignment) => assignment.sectionId === payload.toSectionId).length;
  if (targetEnrolled >= target.capacity) throw new Error("SECTION_FULL");

  const replacement: SectionAssignment = {
    ...current,
    id: `ASN-${Date.now().toString(36).toUpperCase()}`,
    sectionId: payload.toSectionId,
    status: "active",
  };

  if (!hasDatabase()) {
    fallbackSectionAssignments = fallbackSectionAssignments.map((assignment) =>
      assignment.id === payload.assignmentId ? { ...assignment, status: "moved" } : assignment,
    );
    fallbackSectionAssignments = [...fallbackSectionAssignments, replacement];
    return replacement;
  }

  await query("UPDATE section_assignments SET status = 'moved', moved_at = now() WHERE id = $1", [payload.assignmentId]);
  const saved = await queryOne<SectionAssignment>(
    `
      INSERT INTO section_assignments (id, section_id, learner_id, learner_name, gender, status, academic_year_id)
      VALUES ($1, $2, $3, $4, $5, 'active', (SELECT academic_year_id FROM sections WHERE id = $2))
      RETURNING id, section_id AS "sectionId", learner_id AS "learnerId", learner_name AS "learnerName", gender, status
    `,
    [replacement.id, replacement.sectionId, replacement.learnerId, replacement.learnerName, replacement.gender],
  );
  await insertSectionHistory({
    action: "moved_learner",
    learnerId: current.learnerId,
    learnerName: current.learnerName,
    fromSectionId: current.sectionId,
    toSectionId: payload.toSectionId,
    reason: "Moved learner to another section",
  });
  return saved ?? replacement;
}

export async function removeLearnerFromSection(assignmentId: string): Promise<{ ok: true }> {
  const activeAssignments = await getActiveAssignments();
  const current = activeAssignments.find((assignment) => assignment.id === assignmentId);

  if (!hasDatabase()) {
    fallbackSectionAssignments = fallbackSectionAssignments.map((assignment) =>
      assignment.id === assignmentId ? { ...assignment, status: "archived" } : assignment,
    );
    return { ok: true };
  }

  await query("UPDATE section_assignments SET status = 'archived', archived_at = now() WHERE id = $1", [assignmentId]);
  if (current) {
    await insertSectionHistory({
      action: "removed_learner",
      learnerId: current.learnerId,
      learnerName: current.learnerName,
      fromSectionId: current.sectionId,
      reason: "Removed learner from section",
    });
  }
  return { ok: true };
}

export async function getDashboardData() {
  if (!hasDatabase()) {
    return {
      students,
      academicLevels,
      activities,
      departmentDistribution,
      enrollmentTrend,
      todaysClasses,
      pipelineStages: buildPipeline(fallbackApplications),
      alerts,
      feeItems: fallbackFeeItems(),
    };
  }

  const [
    studentRows,
    academicLevelRows,
    activityRows,
    departmentRows,
    trendRows,
    classRows,
    applications,
    alertRows,
    feeRows,
  ] = await Promise.all([
    getStudentsData(),
    getAcademicLevelsData(),
    query<{ id: string; type: string; message: string; time: string; initials: string }>(
      "SELECT id, type, message, time_label AS time, initials FROM activities ORDER BY created_at DESC LIMIT 12",
    ),
    query<{ name: string; value: number }>("SELECT name, value FROM department_distribution ORDER BY sort_order"),
    query<{ month: string; new: number; returning: number }>(
      "SELECT month, new_count AS new, returning_count AS returning FROM enrollment_trends ORDER BY sort_order",
    ),
    query<ClassSlot>("SELECT time_label AS time, academic_level AS \"academicLevel\", room, instructor, status FROM class_slots ORDER BY sort_order"),
    getEnrollmentApplications(),
    query<AlertItem>("SELECT id, title, message, severity FROM alerts ORDER BY created_at DESC"),
    query<{ item: string; tax_treatment: string; base_amount: string; vat_amount: string }>(
      "SELECT item, tax_treatment, base_amount, vat_amount FROM fee_items ORDER BY created_at",
    ),
  ]);

  return {
    students: studentRows,
    academicLevels: academicLevelRows,
    activities: activityRows,
    departmentDistribution: departmentRows,
    enrollmentTrend: trendRows,
    todaysClasses: classRows,
    pipelineStages: buildPipeline(applications),
    alerts: alertRows,
    feeItems: feeRows.map(toFeeItem),
  };
}

function buildPipeline(applications: EnrollmentApplication[]): PipelineStage[] {
  const colors: Record<EnrollmentApplication["status"], string> = {
    New: "var(--chart-1)",
    Review: "var(--chart-2)",
    Interview: "var(--chart-3)",
    Decision: "var(--chart-4)",
  };

  return (["New", "Review", "Interview", "Decision"] as const).map((stage) => ({
    stage,
    count: applications.filter((application) => application.status === stage).length,
    color: colors[stage],
  }));
}

function toFeeItem(row: { item: string; tax_treatment: string; base_amount: string; vat_amount: string }): FeeItem {
  const map: Record<string, Pick<FeeItem, "tax" | "tag">> = {
    ZERO_RATED: { tax: "Zero-rated", tag: "zero" },
    STANDARD_5: { tax: "5% VAT", tag: "vat" },
    EXEMPT: { tax: "Exempt", tag: "exempt" },
    OUT_OF_SCOPE: { tax: "Out of scope", tag: "out" },
  };

  const treatment = map[row.tax_treatment] ?? map.OUT_OF_SCOPE;
  return {
    item: row.item,
    tax: treatment.tax,
    tag: treatment.tag,
    base: formatAed(row.base_amount),
    vat: formatAed(row.vat_amount),
  };
}

function fallbackFeeItems(): FeeItem[] {
  return [
    { item: "Tuition", tax: "Zero-rated", tag: "zero", base: "AED 18,000", vat: "AED 0" },
    { item: "Uniform", tax: "5% VAT", tag: "vat", base: "AED 900", vat: "AED 45" },
    { item: "Transport", tax: "Exempt", tag: "exempt", base: "AED 3,200", vat: "AED 0" },
    { item: "Activity", tax: "5% VAT", tag: "vat", base: "AED 600", vat: "AED 30" },
  ];
}

function formatAed(value: string | number) {
  return `AED ${Number(value).toLocaleString("en-AE", { maximumFractionDigits: 2 })}`;
}

function buildRegistrarSections(
  sectionRows: Array<Omit<RegistrarSection, "enrolled" | "male" | "female" | "status" | "conflicts" | "learners" | "assignments">>,
  assignments: SectionAssignment[],
): RegistrarSection[] {
  return sectionRows.map((section) => {
    const activeAssignments = assignments.filter((assignment) => assignment.sectionId === section.id && assignment.status === "active");
    const enrolled = activeAssignments.length;
    const male = activeAssignments.filter((assignment) => assignment.gender === "Male").length;
    const female = activeAssignments.filter((assignment) => assignment.gender === "Female").length;
    const status = getSectionCapacityStatus({ enrolled, capacity: section.capacity, adviser: section.adviser });
    const conflicts = buildSectionConflicts(section, enrolled, status);

    return {
      ...section,
      enrolled,
      male,
      female,
      status,
      conflicts,
      learners: activeAssignments.map((assignment) => assignment.learnerName),
      assignments: activeAssignments,
    };
  });
}

function buildSectionConflicts(
  section: Omit<RegistrarSection, "enrolled" | "male" | "female" | "status" | "conflicts" | "learners" | "assignments">,
  enrolled: number,
  status: SectionCapacityStatus,
) {
  const conflicts: string[] = [];
  if (status === "Full") conflicts.push("Capacity reached. New assignment requires registrar override.");
  if (status === "Needs Adviser") conflicts.push("Adviser required before final class list release.");
  if (section.room === "To assign" || section.room === "TBA") conflicts.push("Room assignment pending.");
  if (section.schedule.toLowerCase().includes("pending")) conflicts.push("Timetable schedule pending.");
  if (status === "Near Capacity") conflicts.push(`${section.capacity - enrolled} seats remaining before capacity limit.`);
  return conflicts;
}

function buildClassSlots(sections: RegistrarSection[]) {
  return sections.slice(0, 6).map((section, index) => ({
    time: ["07:30", "08:00", "09:15", "10:00", "11:00", "12:30"][index] ?? "13:00",
    monday: `${section.academicLevel} · ${section.name}`,
    tuesday: section.schedule.toLowerCase().includes("pending") ? "Schedule pending" : `${section.academicLevel} · ${section.name}`,
    room: section.room,
    adviser: section.adviser,
  }));
}

function buildGradeBands(sections: RegistrarSection[]) {
  const config = [
    { label: "Preschool", range: "KG1-KG2" },
    { label: "Elementary", range: "Grade 1-6" },
    { label: "Junior High", range: "Grade 7-10" },
    { label: "Senior High", range: "Grade 11-12" },
  ] as const;

  return config.map((band) => {
    const matches = sections.filter((section) => section.cluster === band.label);
    const learners = matches.reduce((sum, section) => sum + section.enrolled, 0);
    const capacity = matches.reduce((sum, section) => sum + section.capacity, 0);
    return {
      ...band,
      sections: matches.length,
      learners,
      fill: capacity > 0 ? Math.round((learners / capacity) * 100) : 0,
    };
  });
}

async function getCurrentAcademicYearRecord() {
  if (!hasDatabase()) return getActiveAcademicYear(fallbackAcademicYears);

  return queryOne<AcademicYearRecord>(`
    SELECT id,
           name,
           start_date::text AS "startDate",
           end_date::text AS "endDate",
           status,
           enrollment_status AS "enrollmentStatus",
           is_active AS "isActive"
    FROM academic_years
    WHERE is_active = true
    LIMIT 1
  `);
}

async function findAcademicYearForRegistration(value: string) {
  const normalized = value.trim();
  if (!hasDatabase()) {
    return fallbackAcademicYears.find((year) => year.id === normalized || year.name === normalized) ?? getActiveAcademicYear(fallbackAcademicYears);
  }

  return queryOne<AcademicYearRecord>(
    `
      SELECT id,
             name,
             start_date::text AS "startDate",
             end_date::text AS "endDate",
             status,
             enrollment_status AS "enrollmentStatus",
             is_active AS "isActive"
      FROM academic_years
      WHERE id = $1 OR name = $1
      LIMIT 1
    `,
    [normalized],
  );
}

async function getAssignmentsForSections(sectionIds: string[]) {
  if (!hasDatabase() || sectionIds.length === 0) {
    return fallbackSectionAssignments.filter((assignment) => sectionIds.includes(assignment.sectionId));
  }

  return query<SectionAssignment>(
    `
      SELECT id, section_id AS "sectionId", learner_id AS "learnerId", learner_name AS "learnerName", gender, status
      FROM section_assignments
      WHERE section_id = ANY($1::text[]) AND archived_at IS NULL
      ORDER BY assigned_at, learner_name
    `,
    [sectionIds],
  );
}

async function getActiveAssignments() {
  if (!hasDatabase()) {
    return fallbackSectionAssignments.filter((assignment) => assignment.status === "active");
  }

  const activeYear = await getCurrentAcademicYearRecord();
  return query<SectionAssignment>(`
    SELECT id, section_id AS "sectionId", learner_id AS "learnerId", learner_name AS "learnerName", gender, status
    FROM section_assignments
    WHERE status = 'active' AND archived_at IS NULL AND academic_year_id = $1
  `, [activeYear?.id ?? "AY-2026-2027"]);
}

async function findSectionForAssignment(sectionId: string) {
  if (!hasDatabase()) return fallbackSections.find((section) => section.id === sectionId) ?? null;

  return queryOne<{
    id: string;
    name: string;
    academicLevel: string;
    cluster: RegistrarSection["cluster"];
    adviser: string;
    room: string;
    schedule: string;
    capacity: number;
  }>(
    `
      SELECT id, name, academic_level AS "academicLevel", cluster, adviser, room, schedule, capacity
      FROM sections
      WHERE id = $1 AND archived_at IS NULL
    `,
    [sectionId],
  );
}

async function insertSectionHistory({
  action,
  learnerId,
  learnerName,
  fromSectionId,
  toSectionId,
  reason,
}: {
  action: "created_section" | "updated_section" | "archived_section" | "assigned_learner" | "moved_learner" | "removed_learner";
  learnerId?: string;
  learnerName?: string;
  fromSectionId?: string;
  toSectionId?: string;
  reason: string;
}) {
  if (!hasDatabase()) return;
  await query(
    `
      INSERT INTO section_history (action, learner_id, learner_name, from_section_id, to_section_id, reason)
      VALUES ($1, $2, $3, $4, $5, $6)
    `,
    [action, learnerId ?? null, learnerName ?? null, fromSectionId ?? null, toSectionId ?? null, reason],
  );
}

function slugFor(value: string) {
  return value.trim().toUpperCase().replace(/[^A-Z0-9]+/g, "-").replace(/^-|-$/g, "") || "LEARNER";
}

function initialsFor(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "NA";
}
