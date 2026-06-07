export type Student = {
  id: string;
  name: string;
  grade: string;
  email: string;
  status: "Active" | "On Leave" | "Pending" | "Graduated";
  gpa: number;
  enrolled: string;
  avatar: string;
};

export const students: Student[] = [
  { id: "STU-2041", name: "Amelia Carter", grade: "Grade 11", email: "amelia.c@scholaris.edu", status: "Active", gpa: 3.92, enrolled: "Sep 2022", avatar: "AC" },
  { id: "STU-2042", name: "Noah Bennett", grade: "Grade 10", email: "noah.b@scholaris.edu", status: "Active", gpa: 3.74, enrolled: "Sep 2023", avatar: "NB" },
  { id: "STU-2043", name: "Sofia Ramirez", grade: "Grade 12", email: "sofia.r@scholaris.edu", status: "Pending", gpa: 3.85, enrolled: "Sep 2021", avatar: "SR" },
  { id: "STU-2044", name: "Liam Okafor", grade: "Grade 9", email: "liam.o@scholaris.edu", status: "Active", gpa: 3.61, enrolled: "Sep 2024", avatar: "LO" },
  { id: "STU-2045", name: "Mia Tanaka", grade: "Grade 11", email: "mia.t@scholaris.edu", status: "On Leave", gpa: 3.45, enrolled: "Sep 2022", avatar: "MT" },
  { id: "STU-2046", name: "Ethan Walsh", grade: "Grade 10", email: "ethan.w@scholaris.edu", status: "Active", gpa: 3.88, enrolled: "Sep 2023", avatar: "EW" },
  { id: "STU-2047", name: "Zara Hassan", grade: "Grade 12", email: "zara.h@scholaris.edu", status: "Active", gpa: 4.0, enrolled: "Sep 2021", avatar: "ZH" },
  { id: "STU-2048", name: "Lucas Kim", grade: "Grade 9", email: "lucas.k@scholaris.edu", status: "Pending", gpa: 3.32, enrolled: "Sep 2024", avatar: "LK" },
];

export type Course = {
  code: string;
  title: string;
  instructor: string;
  room: string;
  schedule: string;
  capacity: number;
  enrolled: number;
  department: "Mathematics" | "Science" | "Humanities" | "Arts" | "Languages";
};

export const courses: Course[] = [
  { code: "MATH-301", title: "Advanced Calculus", instructor: "Dr. Elena Voss", room: "B-204", schedule: "Mon/Wed 9:00", capacity: 28, enrolled: 26, department: "Mathematics" },
  { code: "PHYS-210", title: "Quantum Foundations", instructor: "Prof. Marcus Reid", room: "S-110", schedule: "Tue/Thu 10:30", capacity: 24, enrolled: 22, department: "Science" },
  { code: "ENGL-220", title: "Modern Literature", instructor: "Ms. Priya Nair", room: "H-301", schedule: "Mon/Wed/Fri 11:00", capacity: 30, enrolled: 28, department: "Humanities" },
  { code: "HIST-150", title: "World History II", instructor: "Mr. Daniel Cho", room: "H-205", schedule: "Tue/Thu 13:00", capacity: 32, enrolled: 30, department: "Humanities" },
  { code: "CHEM-201", title: "Organic Chemistry", instructor: "Dr. Aisha Bello", room: "S-220", schedule: "Mon/Wed 14:00", capacity: 26, enrolled: 19, department: "Science" },
  { code: "ART-110", title: "Studio Painting", instructor: "Ms. Clara Yu", room: "A-101", schedule: "Fri 9:00", capacity: 18, enrolled: 18, department: "Arts" },
  { code: "SPAN-202", title: "Spanish Intermediate", instructor: "Sr. Javier Ortiz", room: "L-115", schedule: "Mon/Wed/Fri 10:00", capacity: 22, enrolled: 17, department: "Languages" },
];

export const enrollmentTrend = [
  { month: "Jan", new: 42, returning: 318 },
  { month: "Feb", new: 38, returning: 326 },
  { month: "Mar", new: 51, returning: 334 },
  { month: "Apr", new: 47, returning: 341 },
  { month: "May", new: 63, returning: 352 },
  { month: "Jun", new: 58, returning: 360 },
  { month: "Jul", new: 71, returning: 372 },
  { month: "Aug", new: 94, returning: 388 },
  { month: "Sep", new: 128, returning: 410 },
];

export const departmentDistribution = [
  { name: "Mathematics", value: 312 },
  { name: "Science", value: 287 },
  { name: "Humanities", value: 254 },
  { name: "Languages", value: 188 },
  { name: "Arts", value: 142 },
];

export type Activity = {
  id: string;
  type: "enrollment" | "transfer" | "grade" | "request";
  message: string;
  time: string;
  initials: string;
};

export const activities: Activity[] = [
  { id: "a1", type: "enrollment", message: "Liam Okafor enrolled in PHYS-210", time: "2m ago", initials: "LO" },
  { id: "a2", type: "request", message: "Sofia Ramirez submitted transcript request", time: "18m ago", initials: "SR" },
  { id: "a3", type: "transfer", message: "Mia Tanaka transferred to Section B", time: "1h ago", initials: "MT" },
  { id: "a4", type: "grade", message: "Q2 grades posted for MATH-301", time: "3h ago", initials: "EV" },
  { id: "a5", type: "enrollment", message: "12 new applications received today", time: "5h ago", initials: "+12" },
];

export type ClassSlot = {
  time: string;
  course: string;
  room: string;
  instructor: string;
  status: "upcoming" | "in-progress" | "completed";
};

export const todaysClasses: ClassSlot[] = [
  { time: "08:00 – 09:30", course: "MATH-301", room: "B-204", instructor: "Dr. Elena Voss", status: "completed" },
  { time: "09:30 – 11:00", course: "PHYS-210", room: "S-110", instructor: "Prof. Marcus Reid", status: "in-progress" },
  { time: "11:00 – 12:30", course: "ENGL-220", room: "H-301", instructor: "Ms. Priya Nair", status: "upcoming" },
  { time: "13:00 – 14:30", course: "HIST-150", room: "H-205", instructor: "Mr. Daniel Cho", status: "upcoming" },
  { time: "14:00 – 15:30", course: "CHEM-201", room: "S-220", instructor: "Dr. Aisha Bello", status: "upcoming" },
];

export type PipelineStage = {
  stage: string;
  count: number;
  color: string;
};

export const pipelineStages: PipelineStage[] = [
  { stage: "New", count: 42, color: "var(--chart-1)" },
  { stage: "Review", count: 18, color: "var(--chart-2)" },
  { stage: "Interview", count: 9, color: "var(--chart-3)" },
  { stage: "Decision", count: 5, color: "var(--chart-4)" },
];

export type AlertItem = {
  id: string;
  title: string;
  message: string;
  severity: "warning" | "critical" | "info";
};

export const alerts: AlertItem[] = [
  { id: "al1", title: "Course at capacity", message: "ART-110 is now full (18/18)", severity: "warning" },
  { id: "al2", title: "Transcript pending", message: "3 transcript requests awaiting approval", severity: "info" },
  { id: "al3", title: "Low enrollment", message: "CHEM-201 only has 19 of 26 seats filled", severity: "warning" },
  { id: "al4", title: "Grade deadline", message: "Q2 grades due in 2 days", severity: "critical" },
];
