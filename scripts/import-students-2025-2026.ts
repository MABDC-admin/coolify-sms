import { readFileSync } from "node:fs";
import { basename, resolve } from "node:path";
import { Client } from "pg";

import { normalizeLearnerRow, parseCsv, summarizeImportedLearners, type LearnerCsvRow } from "../src/lib/learner-import";

const databaseUrl = process.env.DATABASE_URL;
const csvPath = process.argv[2];
const academicYearId = process.argv[3] ?? "AY-2025-2026";

if (!databaseUrl) throw new Error("DATABASE_URL is required to import students");
if (!csvPath) throw new Error("CSV path is required. Usage: bun scripts/import-students-2025-2026.ts <csv-path> [academic-year-id]");

const absolutePath = resolve(csvPath);
const sourceFile = basename(absolutePath);
const rows = parseCsv(readFileSync(absolutePath, "utf8")) as LearnerCsvRow[];
const learners = rows.map((row, index) => normalizeLearnerRow(row, index, academicYearId, sourceFile));
const client = new Client({ connectionString: databaseUrl });

await client.connect();
try {
  await client.query("BEGIN");

  const year = await client.query("SELECT id FROM academic_years WHERE id = $1", [academicYearId]);
  if (year.rowCount === 0) throw new Error(`Academic year does not exist: ${academicYearId}`);

  for (const learner of learners) {
    await client.query(
      `
        INSERT INTO students (
          id, name, grade, email, status, gpa, enrolled, avatar, academic_year_id,
          lrn, birth_date, age, gender, mother_contact, mother_maiden_name,
          father_contact, father_name, philippine_address, uae_address,
          previous_school, source_file, imported_at
        )
        VALUES (
          $1, $2, $3, $4, $5, $6, $7, $8, $9,
          $10, $11, $12, $13, $14, $15,
          $16, $17, $18, $19,
          $20, $21, now()
        )
        ON CONFLICT (id) DO UPDATE SET
          name = EXCLUDED.name,
          grade = EXCLUDED.grade,
          email = EXCLUDED.email,
          status = EXCLUDED.status,
          gpa = EXCLUDED.gpa,
          enrolled = EXCLUDED.enrolled,
          avatar = EXCLUDED.avatar,
          academic_year_id = EXCLUDED.academic_year_id,
          lrn = EXCLUDED.lrn,
          birth_date = EXCLUDED.birth_date,
          age = EXCLUDED.age,
          gender = EXCLUDED.gender,
          mother_contact = EXCLUDED.mother_contact,
          mother_maiden_name = EXCLUDED.mother_maiden_name,
          father_contact = EXCLUDED.father_contact,
          father_name = EXCLUDED.father_name,
          philippine_address = EXCLUDED.philippine_address,
          uae_address = EXCLUDED.uae_address,
          previous_school = EXCLUDED.previous_school,
          source_file = EXCLUDED.source_file,
          imported_at = now(),
          updated_at = now()
      `,
      [
        learner.id,
        learner.name,
        learner.grade,
        learner.email,
        learner.status,
        learner.gpa,
        learner.enrolled,
        learner.avatar,
        learner.academicYearId,
        learner.lrn,
        learner.birthDate,
        learner.age,
        learner.gender,
        learner.motherContact,
        learner.motherMaidenName,
        learner.fatherContact,
        learner.fatherName,
        learner.philippineAddress,
        learner.uaeAddress,
        learner.previousSchool,
        learner.sourceFile,
      ],
    );
  }

  await client.query("COMMIT");
} catch (error) {
  await client.query("ROLLBACK");
  throw error;
} finally {
  await client.end();
}

console.log(JSON.stringify({
  sourceFile,
  academicYearId,
  imported: learners.length,
  byGrade: summarizeImportedLearners(learners),
}, null, 2));
