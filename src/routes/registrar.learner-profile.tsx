import { createFileRoute } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertTriangle,
  BookOpen,
  CalendarDays,
  ClipboardList,
  FileBadge,
  FileCheck2,
  GraduationCap,
  History,
  Mail,
  MessageSquare,
  Search,
  ShieldCheck,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { cn } from "@/lib/utils";
import type { Student } from "@/lib/mock-data";
import { getAcademicYears, getStudents } from "@/lib/api/sms.functions";

export const Route = createFileRoute("/registrar/learner-profile")({
  head: () => ({ meta: [{ title: "Learner Profile - Scholaris" }] }),
  component: LearnerProfilePage,
});

type ProfileTab =
  | "overview"
  | "personal"
  | "family"
  | "enrollment"
  | "academic"
  | "documents"
  | "attendance"
  | "notes"
  | "requests"
  | "movement"
  | "logs";

type LearnerProfile = {
  id: string;
  academicYearId: string;
  lrn: string;
  studentNumber: string;
  name: string;
  initials: string;
  status: "Active" | "Officially Enrolled" | "Pending" | "Temporarily Enrolled" | "On Leave" | "Graduated";
  academicLevel: string;
  section: string;
  adviser: string;
  strand: string;
  schoolYear: string;
  studentType: string;
  gender: string;
  birthdate: string;
  age: number;
  nationality: string;
  address: string;
  city: string;
  country: string;
  email: string;
  phone: string;
  father: string;
  mother: string;
  guardian: string;
  guardianPhone: string;
  guardianEmail: string;
  emergencyContact: string;
  previousSchool: string;
  previousSchoolAddress: string;
  medicalNotes: string;
  attendanceRate: number;
  documentCompletion: number;
  gpa: string;
  flags: string[];
  enrollmentHistory: Array<{ year: string; level: string; section: string; status: string; adviser: string }>;
  academicRecords: Array<{ year: string; level: string; average: string; standing: string; remarks: string }>;
  documents: Array<{ name: string; status: "Verified" | "Submitted" | "Missing" | "Rejected"; updated: string }>;
  requests: Array<{ type: string; status: string; date: string }>;
  movements: Array<{ type: string; date: string; reason: string }>;
  logs: Array<{ actor: string; action: string; time: string }>;
};

const learners: LearnerProfile[] = [
  {
    id: "STU-24091",
    academicYearId: "AY-2026-2027",
    lrn: "136582090114",
    studentNumber: "2026-00091",
    name: "Maria Santos",
    initials: "MS",
    status: "Temporarily Enrolled",
    academicLevel: "Grade 7",
    section: "St. Matthew",
    adviser: "Laila Khan",
    strand: "N/A",
    schoolYear: "2026-2027",
    studentType: "New",
    gender: "Female",
    birthdate: "2013-04-18",
    age: 13,
    nationality: "Filipino",
    address: "Al Nahda 2, Dubai",
    city: "Dubai",
    country: "UAE",
    email: "maria.santos@example.com",
    phone: "+971 50 112 4509",
    father: "Ramon Santos",
    mother: "Elena Santos",
    guardian: "Elena Santos",
    guardianPhone: "+971 55 811 2033",
    guardianEmail: "elena.santos@example.com",
    emergencyContact: "Ramon Santos - +971 52 445 7712",
    previousSchool: "Mabuhay Learning Center",
    previousSchoolAddress: "Sharjah, UAE",
    medicalNotes: "Mild peanut allergy. Emergency contact verified.",
    attendanceRate: 97,
    documentCompletion: 72,
    gpa: "3.78",
    flags: ["Report Card / Form 138 missing", "Temporary enrollment"],
    enrollmentHistory: [
      { year: "2026-2027", level: "Grade 7", section: "St. Matthew", status: "Temporarily Enrolled", adviser: "Laila Khan" },
      { year: "2025-2026", level: "Grade 6", section: "External", status: "Completed", adviser: "Previous school" },
    ],
    academicRecords: [
      { year: "2025-2026", level: "Grade 6", average: "91.4", standing: "Promoted", remarks: "Eligible for junior high placement" },
      { year: "2024-2025", level: "Grade 5", average: "90.1", standing: "Promoted", remarks: "Complete records" },
    ],
    documents: [
      { name: "Birth Certificate", status: "Submitted", updated: "Today, 09:20" },
      { name: "Report Card / Form 138", status: "Missing", updated: "-" },
      { name: "ID Photo", status: "Verified", updated: "Jun 6, 10:12" },
      { name: "Medical Record", status: "Submitted", updated: "Jun 7, 08:40" },
    ],
    requests: [
      { type: "Certificate of Enrollment", status: "Pending review", date: "Jun 7, 2026" },
      { type: "Document resubmission", status: "Sent to guardian", date: "Jun 6, 2026" },
    ],
    movements: [
      { type: "New Enrollee", date: "Jun 7, 2026", reason: "Manual registrar registration" },
      { type: "Temporarily Enrolled", date: "Jun 7, 2026", reason: "Allowed pending Form 138" },
    ],
    logs: [
      { actor: "Ana Reyes", action: "Opened learner profile", time: "Today, 11:08" },
      { actor: "Ana Reyes", action: "Requested report card resubmission", time: "Today, 10:52" },
      { actor: "System", action: "Generated temporary enrollment flag", time: "Today, 09:24" },
    ],
  },
  {
    id: "STU-2047",
    academicYearId: "AY-2026-2027",
    lrn: "110984752301",
    studentNumber: "2023-00427",
    name: "Zara Hassan",
    initials: "ZH",
    status: "Officially Enrolled",
    academicLevel: "Grade 12",
    section: "STEM 12-A",
    adviser: "Omar Farouk",
    strand: "STEM",
    schoolYear: "2026-2027",
    studentType: "Old",
    gender: "Female",
    birthdate: "2008-09-11",
    age: 17,
    nationality: "Emirati",
    address: "Jumeirah Village Circle",
    city: "Dubai",
    country: "UAE",
    email: "zara.hassan@example.com",
    phone: "+971 56 221 7740",
    father: "Nabil Hassan",
    mother: "Amina Hassan",
    guardian: "Amina Hassan",
    guardianPhone: "+971 50 900 7711",
    guardianEmail: "amina.hassan@example.com",
    emergencyContact: "Nabil Hassan - +971 55 332 1900",
    previousSchool: "Scholaris",
    previousSchoolAddress: "Dubai, UAE",
    medicalNotes: "No active medical alerts.",
    attendanceRate: 99,
    documentCompletion: 100,
    gpa: "4.00",
    flags: ["Graduation candidate"],
    enrollmentHistory: [
      { year: "2026-2027", level: "Grade 12", section: "STEM 12-A", status: "Officially Enrolled", adviser: "Omar Farouk" },
      { year: "2025-2026", level: "Grade 11", section: "STEM 11-A", status: "Completed", adviser: "Priya Nair" },
    ],
    academicRecords: [
      { year: "2025-2026", level: "Grade 11", average: "96.8", standing: "Promoted", remarks: "With high honors" },
      { year: "2024-2025", level: "Grade 10", average: "95.2", standing: "Completed", remarks: "Junior high completer" },
    ],
    documents: [
      { name: "Birth Certificate", status: "Verified", updated: "Apr 21, 2024" },
      { name: "Form 137", status: "Verified", updated: "May 13, 2025" },
      { name: "ID Photo", status: "Verified", updated: "Jun 1, 2026" },
      { name: "Graduation Clearance", status: "Submitted", updated: "Jun 6, 2026" },
    ],
    requests: [
      { type: "Good Moral Certificate", status: "Ready for release", date: "Jun 5, 2026" },
      { type: "Graduation Certificate", status: "Draft", date: "Jun 7, 2026" },
    ],
    movements: [
      { type: "Continuing Student", date: "Jun 2, 2026", reason: "Re-enrolled for Grade 12" },
      { type: "Promoted", date: "May 28, 2026", reason: "Passed Grade 11" },
    ],
    logs: [
      { actor: "System", action: "Marked as graduation candidate", time: "Today, 08:00" },
      { actor: "Ana Reyes", action: "Verified clearance document", time: "Yesterday, 15:44" },
    ],
  },
  {
    id: "STU-24077",
    academicYearId: "AY-2026-2027",
    lrn: "128843019742",
    studentNumber: "2026-00077",
    name: "Kenji Reyes",
    initials: "KR",
    status: "Pending",
    academicLevel: "Grade 10",
    section: "Unassigned",
    adviser: "Unassigned",
    strand: "N/A",
    schoolYear: "2026-2027",
    studentType: "Transferee",
    gender: "Male",
    birthdate: "2010-01-22",
    age: 16,
    nationality: "Filipino",
    address: "Muhaisnah, Dubai",
    city: "Dubai",
    country: "UAE",
    email: "kenji.reyes@example.com",
    phone: "+971 52 118 2021",
    father: "Miguel Reyes",
    mother: "Lina Reyes",
    guardian: "Miguel Reyes",
    guardianPhone: "+971 52 118 2021",
    guardianEmail: "miguel.reyes@example.com",
    emergencyContact: "Lina Reyes - +971 54 119 8842",
    previousSchool: "Northern Gulf Academy",
    previousSchoolAddress: "Abu Dhabi, UAE",
    medicalNotes: "Needs updated medical record.",
    attendanceRate: 0,
    documentCompletion: 45,
    gpa: "Pending",
    flags: ["Transfer credentials rejected", "No section assigned"],
    enrollmentHistory: [
      { year: "2026-2027", level: "Grade 10", section: "Unassigned", status: "Pending", adviser: "Unassigned" },
      { year: "2025-2026", level: "Grade 9", section: "External", status: "Completed", adviser: "Previous school" },
    ],
    academicRecords: [
      { year: "2025-2026", level: "Grade 9", average: "88.7", standing: "For validation", remarks: "Transfer record pending registrar review" },
    ],
    documents: [
      { name: "Transfer Credentials", status: "Rejected", updated: "Jun 6, 2026" },
      { name: "Form 138", status: "Submitted", updated: "Jun 7, 2026" },
      { name: "Good Moral Certificate", status: "Missing", updated: "-" },
    ],
    requests: [
      { type: "Transfer validation", status: "Pending review", date: "Jun 7, 2026" },
    ],
    movements: [
      { type: "Transferee In", date: "Jun 7, 2026", reason: "Incoming transfer application" },
    ],
    logs: [
      { actor: "Ana Reyes", action: "Rejected transfer credential scan", time: "Jun 6, 14:30" },
      { actor: "System", action: "Created transferee profile", time: "Jun 6, 14:02" },
    ],
  },
];

const tabs: { id: ProfileTab; label: string; icon: LucideIcon }[] = [
  { id: "overview", label: "Overview", icon: UserRound },
  { id: "personal", label: "Personal Info", icon: FileBadge },
  { id: "family", label: "Family Info", icon: UsersRound },
  { id: "enrollment", label: "Enrollment History", icon: ClipboardList },
  { id: "academic", label: "Academic Records", icon: BookOpen },
  { id: "documents", label: "Documents", icon: FileCheck2 },
  { id: "attendance", label: "Attendance Summary", icon: CalendarDays },
  { id: "notes", label: "Discipline / Notes", icon: MessageSquare },
  { id: "requests", label: "Requests", icon: Mail },
  { id: "movement", label: "Movement History", icon: History },
  { id: "logs", label: "System Logs", icon: ShieldCheck },
];

const documentStyles = {
  Verified: "bg-success/15 text-success-foreground",
  Submitted: "bg-warning/15 text-warning-foreground",
  Missing: "bg-muted text-muted-foreground",
  Rejected: "bg-destructive/10 text-destructive",
  "Officially Enrolled": "bg-[#dcfce7] text-[#166534]",
  "Temporarily Enrolled": "bg-[#fff7df] text-[#92400e]",
  Pending: "bg-[#fee2e2] text-[#991b1b]",
  Active: "bg-[#dcfce7] text-[#166534]",
  "On Leave": "bg-[#eef2f7] text-[#475467]",
  Graduated: "bg-[#e0e7ff] text-[#3730a3]",
};

function LearnerProfilePage() {
  const [query, setQuery] = useState("");
  const [activeTab, setActiveTab] = useState<ProfileTab>("overview");
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [selectedYearId, setSelectedYearId] = useState("all");
  const { data: studentRows = [], isLoading } = useQuery({
    queryKey: ["students", "learner-profile"],
    queryFn: () => getStudents(),
  });
  const { data: academicYearsData } = useQuery({
    queryKey: ["academic-years", "learner-profile"],
    queryFn: () => getAcademicYears(),
  });

  const profiles = useMemo(() => {
    const mapped = studentRows.map(toLearnerProfile);
    return mapped.length > 0 ? mapped : learners;
  }, [studentRows]);
  const schoolYearOptions = useMemo(() => {
    const years = academicYearsData?.years ?? [];
    if (years.length > 0) {
      return years.map((year) => ({
        id: year.id,
        name: year.name,
        count: profiles.filter((profile) => profile.academicYearId === year.id).length,
      }));
    }

    return Array.from(new Map(profiles.map((profile) => [profile.academicYearId, profile.schoolYear])).entries())
      .map(([id, name]) => ({ id, name, count: profiles.filter((profile) => profile.academicYearId === id).length }));
  }, [academicYearsData?.years, profiles]);
  const yearScopedProfiles = useMemo(() => (
    selectedYearId === "all" ? profiles : profiles.filter((learner) => learner.academicYearId === selectedYearId)
  ), [profiles, selectedYearId]);
  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return yearScopedProfiles;
    return yearScopedProfiles.filter((learner) =>
      [learner.name, learner.lrn, learner.studentNumber, learner.academicLevel, learner.section]
        .some((value) => value.toLowerCase().includes(needle)),
    );
  }, [query, yearScopedProfiles]);
  const selected = filtered.find((learner) => learner.id === selectedId) ?? filtered[0] ?? yearScopedProfiles[0] ?? profiles[0] ?? learners[0];

  return (
    <div className="-mx-4 min-h-[calc(100vh-4rem)] bg-[#f4f7fb] px-3 pb-8 pt-3 sm:-mx-6 sm:px-5 lg:-mx-8 lg:px-6">
      <div className="mx-auto max-w-[1500px]">
        <div className="grid items-start gap-4 xl:grid-cols-[19rem_minmax(0,1fr)]">
          <aside className="sticky top-20 rounded-2xl border border-[#d9e2ef] bg-white p-3 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between gap-3">
              <div>
                <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#b45309]">Registry</p>
                <h2 className="font-display text-lg font-semibold text-[#101827]">Learners</h2>
              </div>
              <span className="rounded-full bg-[#eef2f7] px-2.5 py-1 text-xs font-semibold text-[#475467]">{filtered.length}</span>
            </div>
            <label className="mt-4 block">
              <span className="mb-1.5 flex items-center gap-1.5 text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">
                <CalendarDays className="h-3.5 w-3.5" />
                School Year
              </span>
              <select
                value={selectedYearId}
                onChange={(event) => {
                  setSelectedYearId(event.target.value);
                  setSelectedId(null);
                  setActiveTab("overview");
                }}
                className="h-11 w-full rounded-2xl border border-[#d9e2ef] bg-[#fffdf8] px-3 text-sm font-semibold text-[#101827] outline-none focus:border-[#b88b20] focus:ring-4 focus:ring-[#d8b45f]/20"
              >
                <option value="all">All school years ({profiles.length})</option>
                {schoolYearOptions.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name} ({year.count})
                  </option>
                ))}
              </select>
            </label>
            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search learner"
                className="h-11 w-full rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] pl-10 pr-3 text-sm outline-none focus:border-[#b88b20] focus:ring-4 focus:ring-[#d8b45f]/20"
              />
            </div>

            <div className="mt-4 max-h-[calc(100vh-13rem)] space-y-2 overflow-y-auto pr-1">
              {isLoading && (
                <div className="rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] p-4 text-sm text-[#667085]">Loading learners...</div>
              )}
              {filtered.map((learner) => (
                <button
                  key={learner.id}
                  type="button"
                  onClick={() => {
                    setSelectedId(learner.id);
                    setActiveTab("overview");
                  }}
                  className={cn(
                    "w-full rounded-xl border p-3 text-left transition-all",
                    selected.id === learner.id ? "border-[#d8b45f]/70 bg-[#fff8e7] shadow-[0_10px_30px_-24px_rgba(120,90,19,0.8)]" : "border-[#d9e2ef] bg-white hover:bg-[#f8fafc]",
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div className={cn(
                      "flex h-10 w-10 shrink-0 items-center justify-center rounded-xl font-display text-sm font-semibold",
                      selected.id === learner.id ? "bg-[#101827] text-[#f6c65b]" : "bg-[#eef6f4] text-[#0f766e]",
                    )}>
                      {learner.initials}
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-[#101827]">{learner.name}</div>
                      <div className="mt-0.5 truncate text-xs text-[#667085]">{learner.academicLevel} - {learner.section}</div>
                    </div>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-2">
                    <span className="truncate text-xs text-[#667085]">{learner.studentNumber}</span>
                    <StatusPill value={learner.status} />
                  </div>
                </button>
              ))}
            </div>
          </aside>

          <main className="min-w-0 space-y-4">
            <section className="overflow-hidden rounded-2xl border border-[#d9e2ef] bg-white shadow-[0_18px_55px_-46px_rgba(15,23,42,0.45)]">
              <div className="grid gap-5 border-b border-[#d9e2ef] bg-[linear-gradient(135deg,#ffffff_0%,#f7fafc_55%,#fff8e7_100%)] p-5 lg:grid-cols-[minmax(0,1fr)_20rem]">
                <div className="flex min-w-0 flex-col gap-4 sm:flex-row sm:items-center">
                  <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-[#101827] font-display text-2xl font-semibold text-[#f6c65b] shadow-[0_18px_40px_-28px_rgba(16,24,39,0.9)]">
                    {selected.initials}
                  </div>
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <StatusPill value={selected.status} />
                      <span className="rounded-full bg-[#eef2f7] px-2.5 py-1 text-xs font-semibold text-[#475467]">{selected.studentType}</span>
                      <span className="rounded-full bg-[#eef2f7] px-2.5 py-1 text-xs font-semibold text-[#475467]">{selected.schoolYear}</span>
                    </div>
                    <h2 className="mt-2 break-words font-display text-3xl font-semibold tracking-tight text-[#101827]">{selected.name}</h2>
                    <div className="mt-2 grid gap-x-6 gap-y-1 text-sm text-[#667085] sm:grid-cols-2 xl:grid-cols-3">
                      <span>LRN {selected.lrn}</span>
                      <span>{selected.studentNumber}</span>
                      <span>{selected.academicLevel} - {selected.section}</span>
                      <span>{selected.adviser}</span>
                      <span>{selected.address}</span>
                      <span>{selected.guardianPhone}</span>
                    </div>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <Metric label="Docs" value={`${selected.documentCompletion}%`} percent={selected.documentCompletion} />
                  <Metric label="Attend." value={`${selected.attendanceRate}%`} percent={selected.attendanceRate} />
                  <Metric label="GPA" value={selected.gpa} />
                </div>
              </div>

              {selected.flags.length > 0 && (
                <div className="flex flex-wrap gap-2 bg-[#fffdf8] px-5 py-3">
                  {selected.flags.map((flag) => (
                    <span key={flag} className="inline-flex items-center gap-1 rounded-full border border-[#d8b45f]/35 bg-[#fff7df] px-3 py-1.5 text-xs font-semibold text-[#785a13]">
                      <AlertTriangle className="h-3.5 w-3.5" />
                      {flag}
                    </span>
                  ))}
                </div>
              )}
            </section>

            <section className="rounded-2xl border border-[#d9e2ef] bg-white shadow-[0_18px_55px_-46px_rgba(15,23,42,0.45)]">
              <div className="border-b border-[#d9e2ef] p-2">
                <div className="flex gap-1 overflow-x-auto">
                  {tabs.map((tab) => {
                    const Icon = tab.icon;
                    return (
                      <button
                        key={tab.id}
                        type="button"
                        onClick={() => setActiveTab(tab.id)}
                        className={cn(
                          "inline-flex shrink-0 items-center gap-2 rounded-2xl px-3 py-2 text-xs font-semibold transition-colors",
                          activeTab === tab.id ? "bg-[#101827] text-[#f6c65b]" : "text-[#667085] hover:bg-[#f8fafc] hover:text-[#101827]",
                        )}
                      >
                        <Icon className="h-4 w-4" />
                        {tab.label}
                      </button>
                    );
                  })}
                </div>
              </div>
              <div className="p-5">
                <AnimatePresence mode="wait">
                  <motion.div
                    key={`${selected.id}-${activeTab}`}
                    initial={{ opacity: 0, y: 6 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, y: -6 }}
                  >
                    <TabPanel learner={selected} tab={activeTab} />
                  </motion.div>
                </AnimatePresence>
              </div>
            </section>
          </main>
        </div>
      </div>
    </div>
  );
}

function toLearnerProfile(student: Student): LearnerProfile {
  const academicYear = student.academicYearId?.replace(/^AY-/, "") || student.enrolled || "Current";
  const guardian = student.motherMaidenName || student.fatherName || "Not recorded";
  const guardianPhone = student.motherContact || student.fatherContact || "Not recorded";
  const address = student.uaeAddress || student.philippineAddress || "Not recorded";
  const isImported = Boolean(student.sourceFile);

  return {
    id: student.id,
    academicYearId: student.academicYearId || "AY-2026-2027",
    lrn: student.lrn || "No LRN",
    studentNumber: student.id,
    name: student.name,
    initials: student.avatar,
    status: student.status,
    academicLevel: student.grade,
    section: "Unassigned",
    adviser: "To assign",
    strand: "N/A",
    schoolYear: academicYear,
    studentType: isImported ? "Historical Import" : "Continuing",
    gender: student.gender || "Not recorded",
    birthdate: student.birthDate || "Not recorded",
    age: student.age ?? 0,
    nationality: "Not recorded",
    address,
    city: student.uaeAddress ? "UAE" : "Not recorded",
    country: student.uaeAddress ? "UAE" : "Not recorded",
    email: student.email,
    phone: guardianPhone,
    father: student.fatherName || "Not recorded",
    mother: student.motherMaidenName || "Not recorded",
    guardian,
    guardianPhone,
    guardianEmail: "Not recorded",
    emergencyContact: guardianPhone,
    previousSchool: student.previousSchool || "Not recorded",
    previousSchoolAddress: student.philippineAddress || "Not recorded",
    medicalNotes: isImported
      ? `Imported from ${student.sourceFile}. Registrar review required before issuing updated credentials.`
      : "No active medical notes.",
    attendanceRate: isImported ? 0 : 97,
    documentCompletion: isImported ? 45 : 72,
    gpa: student.gpa > 0 ? student.gpa.toFixed(2) : "Pending",
    flags: [
      ...(isImported ? ["Imported historical record"] : []),
      ...(student.lrn ? [] : ["LRN missing or invalid"]),
      ...(student.status === "Pending" ? ["Pending enrollment review"] : []),
      ...(student.grade && student.academicYearId ? [] : ["Academic level review needed"]),
    ],
    enrollmentHistory: [
      {
        year: academicYear,
        level: student.grade,
        section: "Unassigned",
        status: student.status,
        adviser: "To assign",
      },
    ],
    academicRecords: [
      {
        year: academicYear,
        level: student.grade,
        average: student.gpa > 0 ? student.gpa.toFixed(2) : "Pending",
        standing: student.status,
        remarks: isImported ? "Imported from CSV for registrar validation" : "Active system record",
      },
    ],
    documents: [
      { name: "LRN", status: student.lrn ? "Submitted" : "Missing", updated: student.lrn ? "Imported" : "-" },
      { name: "Birth Date", status: student.birthDate ? "Submitted" : "Missing", updated: student.birthDate || "-" },
      { name: "Previous School", status: student.previousSchool ? "Submitted" : "Missing", updated: student.previousSchool ? "Imported" : "-" },
    ],
    requests: [],
    movements: [
      {
        type: isImported ? "CSV Import" : "System Record",
        date: academicYear,
        reason: isImported ? `Imported from ${student.sourceFile}` : "Existing learner record",
      },
    ],
    logs: [
      {
        actor: "System",
        action: isImported ? "Imported learner profile" : "Loaded learner profile",
        time: "Current dataset",
      },
    ],
  };
}

function Metric({ label, value, percent }: { label: string; value: string; percent?: number }) {
  return (
    <div className="rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] p-3 text-center">
      <div className="text-[10px] font-semibold uppercase tracking-[0.16em] text-[#667085]">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold text-[#101827]">{value}</div>
      {typeof percent === "number" && (
        <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-[#e4e7ec]">
          <div className="h-full rounded-full bg-[#f6c65b]" style={{ width: `${percent}%` }} />
        </div>
      )}
    </div>
  );
}

function TabPanel({ learner, tab }: { learner: LearnerProfile; tab: ProfileTab }) {
  if (tab === "overview") {
    return (
      <div className="space-y-4">
        <SectionTitle icon={UserRound} title="Learner Overview" />
        <div className="grid gap-4 xl:grid-cols-2">
          <InfoGroup title="Placement">
            <Info label="Status" value={learner.status} />
            <Info label="Academic Level" value={learner.academicLevel} />
            <Info label="Section" value={learner.section} />
            <Info label="Adviser" value={learner.adviser} />
            <Info label="Student Type" value={learner.studentType} />
            <Info label="School Year" value={learner.schoolYear} />
          </InfoGroup>
          <InfoGroup title="Contacts">
            <Info label="Guardian" value={learner.guardian} />
            <Info label="Guardian Phone" value={learner.guardianPhone} />
            <Info label="Guardian Email" value={learner.guardianEmail} />
            <Info label="Address" value={`${learner.city}, ${learner.country}`} />
          </InfoGroup>
        </div>
      </div>
    );
  }

  if (tab === "personal") {
    return (
      <div className="space-y-4">
        <SectionTitle icon={FileBadge} title="Personal Information" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Gender" value={learner.gender} />
          <Info label="Birthdate" value={learner.birthdate} />
          <Info label="Age" value={learner.age > 0 ? String(learner.age) : "Not recorded"} />
          <Info label="Nationality" value={learner.nationality} />
          <Info label="Address" value={learner.address} />
          <Info label="City / Country" value={`${learner.city}, ${learner.country}`} />
          <Info label="Email" value={learner.email} />
          <Info label="Phone" value={learner.phone} />
        </div>
      </div>
    );
  }

  if (tab === "family") {
    return (
      <div className="space-y-4">
        <SectionTitle icon={UsersRound} title="Family and Emergency Contact" />
        <div className="grid gap-3 sm:grid-cols-2">
          <Info label="Father" value={learner.father} />
          <Info label="Mother" value={learner.mother} />
          <Info label="Guardian" value={learner.guardian} />
          <Info label="Guardian Phone" value={learner.guardianPhone} />
          <Info label="Guardian Email" value={learner.guardianEmail} />
          <Info label="Emergency Contact" value={learner.emergencyContact} />
        </div>
      </div>
    );
  }

  if (tab === "enrollment") return <RecordList icon={ClipboardList} title="Enrollment History" rows={learner.enrollmentHistory.map((row) => [row.year, row.level, row.section, row.status, row.adviser])} headers={["Year", "Level", "Section", "Status", "Adviser"]} />;
  if (tab === "academic") return <RecordList icon={BookOpen} title="Academic Records" rows={learner.academicRecords.map((row) => [row.year, row.level, row.average, row.standing, row.remarks])} headers={["Year", "Level", "Average", "Standing", "Remarks"]} />;
  if (tab === "documents") return <RecordList icon={FileCheck2} title="Documents" rows={learner.documents.map((row) => [row.name, row.status, row.updated])} headers={["Document", "Status", "Updated"]} statusColumn={1} />;
  if (tab === "requests") return <RecordList icon={Mail} title="Requests" rows={learner.requests.map((row) => [row.type, row.status, row.date])} headers={["Request", "Status", "Date"]} />;
  if (tab === "movement") return <RecordList icon={History} title="Movement History" rows={learner.movements.map((row) => [row.type, row.date, row.reason])} headers={["Movement", "Date", "Reason"]} />;
  if (tab === "logs") return <RecordList icon={ShieldCheck} title="System Logs" rows={learner.logs.map((row) => [row.actor, row.action, row.time])} headers={["Actor", "Action", "Time"]} />;

  if (tab === "attendance") {
    return (
      <div className="space-y-4">
        <SectionTitle icon={CalendarDays} title="Attendance Summary" />
        <div className="grid gap-3 sm:grid-cols-3">
          <Info label="Attendance Rate" value={`${learner.attendanceRate}%`} />
          <Info label="Late Entries" value={learner.attendanceRate > 0 ? "2" : "0"} />
          <Info label="Excused Absences" value={learner.attendanceRate > 0 ? "1" : "0"} />
        </div>
        <ProgressBar value={learner.attendanceRate} />
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <SectionTitle icon={MessageSquare} title="Discipline / Notes" />
      <div className="rounded-2xl border border-[#1f2937]/10 bg-[#fffdf8] p-4 text-sm leading-6 text-[#475467]">
        {learner.medicalNotes}
      </div>
      <div className="rounded-2xl border border-[#1f2937]/10 bg-[#fff7df] p-4 text-sm leading-6 text-[#785a13]">
        Registrar note: profile reviewed for {learner.schoolYear}. No disciplinary hold is currently attached.
      </div>
    </div>
  );
}

function RecordList({ icon, title, headers, rows, statusColumn }: { icon: LucideIcon; title: string; headers: string[]; rows: string[][]; statusColumn?: number }) {
  return (
    <div className="space-y-4">
      <SectionTitle icon={icon} title={title} />
      <div className="overflow-hidden rounded-[1.2rem] border border-[#1f2937]/10 bg-[#fffdf8] shadow-inner">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-[#1f2937]/10 bg-[#101827] text-left text-xs uppercase tracking-[0.16em] text-[#f6c65b]">
              {headers.map((header) => <th key={header} className="px-4 py-3 font-semibold">{header}</th>)}
            </tr>
          </thead>
          <tbody>
            {rows.map((row, index) => (
              <tr key={`${row.join("-")}-${index}`} className="border-b border-[#1f2937]/10 transition-colors hover:bg-[#fff7df]/70 last:border-0">
                {row.map((cell, cellIndex) => (
                  <td key={`${cell}-${cellIndex}`} className="px-4 py-3 align-top">
                    {statusColumn === cellIndex ? <StatusPill value={cell} /> : <span className={cellIndex === 0 ? "font-semibold text-[#172033]" : "text-[#667085]"}>{cell}</span>}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function StatusPill({ value, contrast = false }: { value: string; contrast?: boolean }) {
  const style = value in documentStyles ? documentStyles[value as keyof typeof documentStyles] : "bg-secondary text-secondary-foreground";
  return (
    <span
      className={cn(
        "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
        contrast ? "border border-white/15 bg-white/10 text-white" : style,
      )}
    >
      {value}
    </span>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-[#eef2f7] text-[#344054]">
        <Icon className="h-4.5 w-4.5" />
      </div>
      <h3 className="font-display text-lg font-semibold text-[#101827]">{title}</h3>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d9e2ef] bg-white p-3">
      <div className="text-[11px] font-semibold uppercase tracking-[0.14em] text-[#667085]">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold text-[#101827]">{value}</div>
    </div>
  );
}

function InfoGroup({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div className="rounded-3xl border border-[#d9e2ef] bg-[#f8fafc] p-4">
      <h4 className="font-display text-base font-semibold text-[#101827]">{title}</h4>
      <div className="mt-3 grid gap-3 sm:grid-cols-2">{children}</div>
    </div>
  );
}

function ProgressBar({ value }: { value: number }) {
  return (
    <div className="overflow-hidden rounded-full bg-[#e5e7eb] p-1">
      <div className="h-3 rounded-full bg-[linear-gradient(90deg,#0f766e,#f6c65b)]" style={{ width: `${value}%` }} />
    </div>
  );
}
