import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  advanceEnrollmentApplication,
  archiveRegistrarSection,
  assignLearnerToSection,
  createAcademicYearRecord,
  createRegistrarSection,
  createEnrollmentApplication,
  getAcademicLevelsData,
  getAcademicYearsData,
  getDashboardData,
  getEnrollmentApplications,
  getSectionsAssignmentData,
  getStudentsData,
  moveLearnerToSection,
  removeLearnerFromSection,
  setActiveAcademicYearRecord,
  updateAcademicYearRecord,
  updateRegistrarSection,
} from "@/lib/sms-data.server";

const registrationSchema = z.object({
  learnerFirstName: z.string().min(1),
  learnerLastName: z.string().min(1),
  dateOfBirth: z.string().min(1),
  gender: z.string().min(1),
  grade: z.string().min(1),
  academicYear: z.string().min(1),
  previousSchool: z.string().optional(),
  guardianName: z.string().min(1),
  guardianEmail: z.string().email(),
  guardianPhone: z.string().min(6),
  emiratesId: z.string().optional(),
  nationality: z.string().optional(),
  address: z.string().optional(),
  feePlan: z.string().min(1),
  documents: z.array(z.string()).default([]),
  notes: z.string().optional(),
});

const sectionSchema = z.object({
  name: z.string().min(1),
  academicLevel: z.string().min(1),
  cluster: z.enum(["Preschool", "Elementary", "Junior High", "Senior High"]),
  adviser: z.string().min(1),
  room: z.string().min(1),
  schedule: z.string().min(1),
  capacity: z.number().int().min(1).max(60),
});

const learnerAssignmentSchema = z.object({
  sectionId: z.string().min(1),
  learnerName: z.string().min(1),
  learnerId: z.string().optional(),
  gender: z.enum(["Male", "Female"]),
});

const academicYearSchema = z.object({
  startYear: z.number().int().min(2000).max(2200),
  notes: z.string().optional(),
});

const academicYearUpdateSchema = z.object({
  id: z.string().min(1),
  enrollmentStatus: z.enum(["open", "paused", "closed"]).optional(),
  status: z.enum(["setup", "active", "closed", "archived"]).optional(),
  notes: z.string().optional(),
});

export const getDashboardOverview = createServerFn({ method: "GET" }).handler(async () => {
  return getDashboardData();
});

export const getStudents = createServerFn({ method: "GET" }).handler(async () => {
  return getStudentsData();
});

export const getAcademicLevels = createServerFn({ method: "GET" }).handler(async () => {
  return getAcademicLevelsData();
});

export const getApplications = createServerFn({ method: "GET" }).handler(async () => {
  return getEnrollmentApplications();
});

export const getSectionAssignments = createServerFn({ method: "GET" }).handler(async () => {
  return getSectionsAssignmentData();
});

export const getAcademicYears = createServerFn({ method: "GET" }).handler(async () => {
  return getAcademicYearsData();
});

export const advanceApplication = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    return advanceEnrollmentApplication(data.id);
  });

export const createRegistration = createServerFn({ method: "POST" })
  .inputValidator(registrationSchema)
  .handler(async ({ data }) => {
    return createEnrollmentApplication(data);
  });

export const createSection = createServerFn({ method: "POST" })
  .inputValidator(sectionSchema)
  .handler(async ({ data }) => {
    return createRegistrarSection(data);
  });

export const updateSection = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1), section: sectionSchema }))
  .handler(async ({ data }) => {
    return updateRegistrarSection(data.id, data.section);
  });

export const archiveSection = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    return archiveRegistrarSection(data.id);
  });

export const assignLearner = createServerFn({ method: "POST" })
  .inputValidator(learnerAssignmentSchema)
  .handler(async ({ data }) => {
    return assignLearnerToSection(data);
  });

export const moveLearner = createServerFn({ method: "POST" })
  .inputValidator(z.object({ assignmentId: z.string().min(1), toSectionId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return moveLearnerToSection(data);
  });

export const removeLearnerAssignment = createServerFn({ method: "POST" })
  .inputValidator(z.object({ assignmentId: z.string().min(1) }))
  .handler(async ({ data }) => {
    return removeLearnerFromSection(data.assignmentId);
  });

export const createAcademicYear = createServerFn({ method: "POST" })
  .inputValidator(academicYearSchema)
  .handler(async ({ data }) => {
    return createAcademicYearRecord(data);
  });

export const setActiveAcademicYear = createServerFn({ method: "POST" })
  .inputValidator(z.object({ id: z.string().min(1) }))
  .handler(async ({ data }) => {
    return setActiveAcademicYearRecord(data.id);
  });

export const updateAcademicYear = createServerFn({ method: "POST" })
  .inputValidator(academicYearUpdateSchema)
  .handler(async ({ data }) => {
    return updateAcademicYearRecord(data);
  });
