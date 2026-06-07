export type AcademicYearStatus = "setup" | "active" | "closed" | "archived";
export type AcademicYearEnrollmentStatus = "open" | "paused" | "closed";

export type AcademicYearRecord = {
  id: string;
  name: string;
  startDate: string;
  endDate: string;
  status: AcademicYearStatus;
  enrollmentStatus: AcademicYearEnrollmentStatus;
  isActive: boolean;
};

export function getActiveAcademicYear(years: AcademicYearRecord[]) {
  const activeYears = years.filter((year) => year.isActive || year.status === "active");
  const uniqueActiveIds = new Set(activeYears.map((year) => year.id));
  if (uniqueActiveIds.size > 1) {
    throw new Error("Only one academic year can be active.");
  }
  return activeYears[0] ?? null;
}

export function normalizeAcademicYear({ startYear }: { startYear: number }) {
  const endYear = startYear + 1;
  return {
    name: `${startYear}-${endYear}`,
    startDate: `${startYear}-08-24`,
    endDate: `${endYear}-06-30`,
  };
}

export function canAcceptRegistration(year: Pick<AcademicYearRecord, "status" | "enrollmentStatus" | "isActive">) {
  return year.enrollmentStatus === "open" && (year.isActive || year.status === "active" || year.status === "setup");
}

export function validateAcademicYearTransition(from: AcademicYearStatus, to: AcademicYearStatus): { ok: true } | { ok: false; reason: string } {
  if (from === "closed" && to === "active") {
    return { ok: false, reason: "Closed academic years are historical records and cannot be reopened as active." };
  }
  if (from === "archived" && to !== "archived") {
    return { ok: false, reason: "Archived academic years cannot be reopened." };
  }
  return { ok: true };
}
