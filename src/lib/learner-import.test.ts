import { describe, expect, test } from "bun:test";

import { normalizeGradeLevel, normalizeLearnerRow, parseBirthDate, parseCsv, summarizeImportedLearners } from "@/lib/learner-import";

describe("learner CSV import mapping", () => {
  test("parses quoted CSV names and trailing headers", () => {
    const rows = parseCsv('LEVEL,LRN,STUDENT NAME, UAE ADDRESS,PREVIOUS SCHOOL ,\nG7,123,"DOE, JANE A.","Flat 1, Abu Dhabi",Old School,\n');

    expect(rows).toHaveLength(1);
    expect(rows[0]["STUDENT NAME"]).toBe("DOE, JANE A.");
    expect(rows[0][" UAE ADDRESS"]).toBe("Flat 1, Abu Dhabi");
  });

  test("strips UTF-8 BOM from the first header", () => {
    const rows = parseCsv('\uFEFFLEVEL,LRN,STUDENT NAME\nG1,123,"DOE, JANE"\n');

    expect(rows[0].LEVEL).toBe("G1");
  });

  test("normalizes preschool and grade level shorthand", () => {
    expect(normalizeGradeLevel("L1")).toBe("KG1");
    expect(normalizeGradeLevel("L2")).toBe("KG2");
    expect(normalizeGradeLevel("G7 ")).toBe("Grade 7");
    expect(normalizeGradeLevel("g12")).toBe("Grade 12");
  });

  test("maps imported learner records into student schema fields", () => {
    const learner = normalizeLearnerRow({
      LEVEL: "G7 ",
      LRN: "136596180031",
      "STUDENT NAME": "TOMENIO, LIAM ANDRIE D. ",
      "BIRTH DATE": "16-Aug-13",
      AGE: "11",
      GENDER: "MALE",
      "MOTHER CONTACT #": "052 498 7581",
      "MOTHERS MAIDEN NAME": "DARYN JOY AMANTE DINO",
      "FATHER CONTACT #": "",
      FATHER: "LYLE MICHAEL NIEVERAS TOMENIO",
      "PHIL. ADDRESS": "DECA 4 BANKAL LAPU-LAPU CITY CEBU PHILIPPINES",
      " UAE ADDRESS": "AL ZAHIYAH STREET ABU DHABI",
      "PREVIOUS SCHOOL ": "NEWLAND CENTER FOR EDUCATION",
    }, 3);

    expect(learner.id).toBe("LRN-136596180031");
    expect(learner.name).toBe("Liam Andrie D. Tomenio");
    expect(learner.grade).toBe("Grade 7");
    expect(learner.birthDate).toBe("2013-08-16");
    expect(learner.gender).toBe("Male");
    expect(learner.academicYearId).toBe("AY-2025-2026");
  });

  test("keeps accented learner names readable when title-casing", () => {
    const learner = normalizeLearnerRow({ LEVEL: "G1", LRN: "411103240051", "STUDENT NAME": "CAÑAS, ACE NIÑO DEANIEL P." }, 0);

    expect(learner.name).toBe("Ace Niño Deaniel P. Cañas");
  });

  test("generates stable IDs for learners without valid numeric LRN", () => {
    const learner = normalizeLearnerRow({ LEVEL: "L1", LRN: "SIT IN", "STUDENT NAME": "STA. CRUZ, DAHLIA THERESE S. " }, 1);

    expect(learner.id).toBe("IMP-2025-2026-0002");
    expect(learner.lrn).toBeNull();
    expect(learner.grade).toBe("KG1");
  });

  test("summarizes learners by sorted academic level", () => {
    const learners = [
      normalizeLearnerRow({ LEVEL: "G2", "STUDENT NAME": "Two" }, 0),
      normalizeLearnerRow({ LEVEL: "L1", "STUDENT NAME": "Kg" }, 1),
      normalizeLearnerRow({ LEVEL: "G2", "STUDENT NAME": "Two B" }, 2),
    ];

    expect(summarizeImportedLearners(learners)).toEqual([
      { grade: "KG1", count: 1 },
      { grade: "Grade 2", count: 2 },
    ]);
  });

  test("parses CSV date values into ISO dates", () => {
    expect(parseBirthDate("14-Jun-12")).toBe("2012-06-14");
    expect(parseBirthDate("9/21/2014")).toBe("2014-09-21");
    expect(parseBirthDate("")).toBeNull();
  });
});
