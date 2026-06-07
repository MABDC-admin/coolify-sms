export type LearnerCsvRow = {
  LEVEL?: string;
  LRN?: string;
  "STUDENT NAME"?: string;
  "BIRTH DATE"?: string;
  AGE?: string;
  GENDER?: string;
  "MOTHER CONTACT #"?: string;
  "MOTHERS MAIDEN NAME"?: string;
  "FATHER CONTACT #"?: string;
  FATHER?: string;
  "PHIL. ADDRESS"?: string;
  " UAE ADDRESS"?: string;
  "PREVIOUS SCHOOL "?: string;
};

export type ImportedLearner = {
  id: string;
  name: string;
  grade: string;
  email: string;
  status: "Active";
  gpa: number;
  enrolled: string;
  avatar: string;
  academicYearId: string;
  lrn: string | null;
  birthDate: string | null;
  age: number | null;
  gender: string | null;
  motherContact: string;
  motherMaidenName: string;
  fatherContact: string;
  fatherName: string;
  philippineAddress: string;
  uaeAddress: string;
  previousSchool: string;
  sourceFile: string;
};

const gradeMap: Record<string, string> = {
  L1: "KG1",
  L2: "KG2",
};

const monthMap: Record<string, string> = {
  jan: "01",
  feb: "02",
  mar: "03",
  apr: "04",
  may: "05",
  jun: "06",
  jul: "07",
  aug: "08",
  sep: "09",
  oct: "10",
  nov: "11",
  dec: "12",
};

export function parseCsv(content: string): Record<string, string>[] {
  const rows: string[][] = [];
  let field = "";
  let row: string[] = [];
  let inQuotes = false;

  for (let index = 0; index < content.length; index += 1) {
    const char = content[index];
    const next = content[index + 1];

    if (char === '"') {
      if (inQuotes && next === '"') {
        field += '"';
        index += 1;
      } else {
        inQuotes = !inQuotes;
      }
      continue;
    }

    if (char === "," && !inQuotes) {
      row.push(field);
      field = "";
      continue;
    }

    if ((char === "\n" || char === "\r") && !inQuotes) {
      if (char === "\r" && next === "\n") index += 1;
      row.push(field);
      field = "";
      if (row.some((value) => value.trim() !== "")) rows.push(row);
      row = [];
      continue;
    }

    field += char;
  }

  row.push(field);
  if (row.some((value) => value.trim() !== "")) rows.push(row);
  if (rows.length === 0) return [];

  const headers = rows[0].map((header, index) => (index === 0 ? header.replace(/^\uFEFF/, "") : header).trimEnd());
  return rows.slice(1).map((values) =>
    Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""])),
  );
}

export function normalizeGradeLevel(value: string) {
  const code = value.trim().toUpperCase().replace(/\s+/g, "");
  if (gradeMap[code]) return gradeMap[code];

  const match = code.match(/^G(\d{1,2})$/);
  if (!match) throw new Error(`Unsupported grade level: ${value}`);

  const grade = Number(match[1]);
  if (grade < 1 || grade > 12) throw new Error(`Unsupported grade level: ${value}`);
  return `Grade ${grade}`;
}

export function parseBirthDate(value: string) {
  const clean = value.trim();
  if (!clean) return null;

  const slashMatch = clean.match(/^(\d{1,2})\/(\d{1,2})\/(\d{4})$/);
  if (slashMatch) {
    const month = slashMatch[1].padStart(2, "0");
    const day = slashMatch[2].padStart(2, "0");
    return `${slashMatch[3]}-${month}-${day}`;
  }

  const match = clean.match(/^(\d{1,2})-([A-Za-z]{3})-(\d{2,4})$/);
  if (!match) throw new Error(`Unsupported birth date: ${value}`);

  const day = match[1].padStart(2, "0");
  const month = monthMap[match[2].toLowerCase()];
  if (!month) throw new Error(`Unsupported birth month: ${value}`);

  const rawYear = Number(match[3]);
  const year = rawYear < 100 ? 2000 + rawYear : rawYear;
  return `${year}-${month}-${day}`;
}

export function normalizeLearnerRow(row: LearnerCsvRow, index: number, academicYearId = "AY-2025-2026", sourceFile = "STUDENTS IN 2025-2026.csv"): ImportedLearner {
  const lrn = normalizeLrn(row.LRN ?? "");
  const id = lrn ? `LRN-${lrn}` : `IMP-2025-2026-${String(index + 1).padStart(4, "0")}`;
  const name = normalizeName(row["STUDENT NAME"] ?? `Imported Learner ${index + 1}`);
  const grade = normalizeGradeLevel(row.LEVEL ?? "");

  return {
    id,
    name,
    grade,
    email: `${id.toLowerCase()}@imported.scholaris.local`,
    status: "Active",
    gpa: 0,
    enrolled: "2025-2026",
    avatar: initialsFor(name),
    academicYearId,
    lrn,
    birthDate: parseBirthDate(row["BIRTH DATE"] ?? ""),
    age: normalizeAge(row.AGE ?? ""),
    gender: normalizeGender(row.GENDER ?? ""),
    motherContact: clean(row["MOTHER CONTACT #"] ?? ""),
    motherMaidenName: normalizeName(row["MOTHERS MAIDEN NAME"] ?? ""),
    fatherContact: clean(row["FATHER CONTACT #"] ?? ""),
    fatherName: normalizeName(row.FATHER ?? ""),
    philippineAddress: clean(row["PHIL. ADDRESS"] ?? ""),
    uaeAddress: clean(row[" UAE ADDRESS"] ?? ""),
    previousSchool: clean(row["PREVIOUS SCHOOL "] ?? ""),
    sourceFile,
  };
}

export function summarizeImportedLearners(learners: ImportedLearner[]) {
  const byGrade = new Map<string, number>();
  for (const learner of learners) byGrade.set(learner.grade, (byGrade.get(learner.grade) ?? 0) + 1);
  return [...byGrade.entries()]
    .sort(([a], [b]) => academicLevelSort(a) - academicLevelSort(b))
    .map(([grade, count]) => ({ grade, count }));
}

function normalizeLrn(value: string) {
  const cleanValue = value.trim();
  return /^\d{6,}$/.test(cleanValue) ? cleanValue : null;
}

function normalizeAge(value: string) {
  const age = Number(value.trim());
  return Number.isFinite(age) && age >= 0 ? age : null;
}

function normalizeGender(value: string) {
  const cleanValue = clean(value).toLowerCase();
  if (cleanValue === "female") return "Female";
  if (cleanValue === "male") return "Male";
  return clean(value) || null;
}

function normalizeName(value: string) {
  const cleanValue = clean(value);
  if (!cleanValue) return "";

  const [last, ...rest] = cleanValue.split(",");
  const ordered = rest.length > 0 ? `${rest.join(",").trim()} ${last.trim()}` : cleanValue;
  return titleCase(ordered);
}

function titleCase(value: string) {
  return value
    .toLocaleLowerCase("en")
    .split(" ")
    .map((word) => word.split("-").map(capitalizeToken).join("-"))
    .join(" ");
}

function capitalizeToken(value: string) {
  return value.replace(/^(\P{L}*)(\p{L})(.*)$/u, (_match, prefix: string, first: string, rest: string) => (
    `${prefix}${first.toLocaleUpperCase("en")}${rest}`
  ));
}

function clean(value: string) {
  return value.trim().replace(/\s+/g, " ");
}

function initialsFor(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  return parts.slice(0, 2).map((part) => part[0]?.toUpperCase()).join("") || "NA";
}

function academicLevelSort(value: string) {
  if (value === "KG1") return 1;
  if (value === "KG2") return 2;
  const match = value.match(/^Grade (\d{1,2})$/);
  return match ? Number(match[1]) + 2 : 999;
}
