import { describe, expect, test } from "bun:test";

import { getSectionCapacityStatus, validateSectionAssignment } from "./sections-rules";

describe("section assignment rules", () => {
  test("marks sections by capacity", () => {
    expect(getSectionCapacityStatus({ enrolled: 12, capacity: 30, adviser: "Ana Reyes" })).toBe("Open");
    expect(getSectionCapacityStatus({ enrolled: 28, capacity: 30, adviser: "Ana Reyes" })).toBe("Near Capacity");
    expect(getSectionCapacityStatus({ enrolled: 30, capacity: 30, adviser: "Ana Reyes" })).toBe("Full");
    expect(getSectionCapacityStatus({ enrolled: 5, capacity: 30, adviser: "" })).toBe("Needs Adviser");
  });

  test("rejects over-capacity learner assignment", () => {
    const result = validateSectionAssignment({
      sectionId: "sec-1",
      learnerId: "learner-1",
      capacity: 30,
      enrolled: 30,
      existingAssignments: [],
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("SECTION_FULL");
  });

  test("rejects duplicate active learner assignment", () => {
    const result = validateSectionAssignment({
      sectionId: "sec-1",
      learnerId: "learner-1",
      capacity: 30,
      enrolled: 10,
      existingAssignments: [{ learnerId: "learner-1", sectionId: "sec-2", status: "active" }],
    });

    expect(result.ok).toBe(false);
    expect(result.reason).toBe("DUPLICATE_ACTIVE_ASSIGNMENT");
  });
});
