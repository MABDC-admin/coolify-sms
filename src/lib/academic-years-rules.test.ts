import { describe, expect, test } from "bun:test";

import {
  canAcceptRegistration,
  getActiveAcademicYear,
  normalizeAcademicYear,
  validateAcademicYearTransition,
  type AcademicYearRecord,
} from "./academic-years-rules";

const years: AcademicYearRecord[] = [
  {
    id: "AY-2026-2027",
    name: "2026-2027",
    startDate: "2026-08-24",
    endDate: "2027-06-30",
    status: "active",
    enrollmentStatus: "open",
    isActive: true,
  },
  {
    id: "AY-2025-2026",
    name: "2025-2026",
    startDate: "2025-08-25",
    endDate: "2026-06-30",
    status: "closed",
    enrollmentStatus: "closed",
    isActive: false,
  },
];

describe("academic year rules", () => {
  test("finds the single active academic year", () => {
    expect(getActiveAcademicYear(years)?.name).toBe("2026-2027");
    expect(() => getActiveAcademicYear([...years, { ...years[0], id: "AY-DUP" }])).toThrow("Only one academic year can be active.");
  });

  test("normalizes academic year labels from start year", () => {
    expect(normalizeAcademicYear({ startYear: 2027 })).toEqual({
      name: "2027-2028",
      startDate: "2027-08-24",
      endDate: "2028-06-30",
    });
  });

  test("accepts registration only for active or enrolling years", () => {
    expect(canAcceptRegistration(years[0])).toBe(true);
    expect(canAcceptRegistration(years[1])).toBe(false);
    expect(canAcceptRegistration({ ...years[0], isActive: false, status: "setup", enrollmentStatus: "open" })).toBe(true);
  });

  test("blocks reopening closed years directly into active", () => {
    expect(validateAcademicYearTransition("setup", "active")).toEqual({ ok: true });
    expect(validateAcademicYearTransition("closed", "active")).toEqual({
      ok: false,
      reason: "Closed academic years are historical records and cannot be reopened as active.",
    });
  });
});
