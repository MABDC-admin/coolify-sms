export type SectionCapacityStatus = "Open" | "Near Capacity" | "Full" | "Needs Adviser";

export type AssignmentValidationInput = {
  sectionId: string;
  learnerId: string;
  capacity: number;
  enrolled: number;
  existingAssignments: Array<{ learnerId: string; sectionId: string; status: "active" | "moved" | "archived" }>;
};

export type AssignmentValidationResult =
  | { ok: true }
  | { ok: false; reason: "SECTION_FULL" | "DUPLICATE_ACTIVE_ASSIGNMENT" };

export function getSectionCapacityStatus({
  enrolled,
  capacity,
  adviser,
}: {
  enrolled: number;
  capacity: number;
  adviser?: string | null;
}): SectionCapacityStatus {
  if (!adviser || adviser.trim().length === 0 || adviser === "Unassigned") return "Needs Adviser";
  if (enrolled >= capacity) return "Full";
  if (capacity > 0 && enrolled / capacity >= 0.9) return "Near Capacity";
  return "Open";
}

export function validateSectionAssignment(input: AssignmentValidationInput): AssignmentValidationResult {
  const duplicate = input.existingAssignments.some(
    (assignment) => assignment.learnerId === input.learnerId && assignment.status === "active",
  );
  if (duplicate) return { ok: false, reason: "DUPLICATE_ACTIVE_ASSIGNMENT" };
  if (input.enrolled >= input.capacity) return { ok: false, reason: "SECTION_FULL" };
  return { ok: true };
}
