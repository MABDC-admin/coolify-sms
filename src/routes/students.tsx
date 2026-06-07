import { createFileRoute, Link } from "@tanstack/react-router";
import { useQuery } from "@tanstack/react-query";
import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Database,
  FileClock,
  Filter,
  GraduationCap,
  Mail,
  MoreHorizontal,
  Plus,
  Search,
  UserCheck,
  Users,
} from "lucide-react";
import { useEffect, useMemo, useState } from "react";

import type { Student } from "@/lib/mock-data";
import { cn } from "@/lib/utils";
import { getAcademicYears, getStudents } from "@/lib/api/sms.functions";

export const Route = createFileRoute("/students")({
  head: () => ({ meta: [{ title: "Student Masterlist - Scholaris" }] }),
  component: StudentsPage,
});

const statusStyles: Record<Student["status"], string> = {
  Active: "bg-[#dcfce7] text-[#166534]",
  Pending: "bg-[#fff7df] text-[#92400e]",
  "On Leave": "bg-[#eef2f7] text-[#475467]",
  Graduated: "bg-[#e0e7ff] text-[#3730a3]",
};

const tabs = ["All", "Active", "Pending", "On Leave", "Graduated"] as const;

function StudentsPage() {
  const [query, setQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"All" | Student["status"]>("All");
  const [selectedYearId, setSelectedYearId] = useState("");
  const [gradeFilter, setGradeFilter] = useState("All");
  const [selected, setSelected] = useState<Student | null>(null);
  const { data: students = [], isLoading } = useQuery({
    queryKey: ["students", "masterlist"],
    queryFn: () => getStudents(),
  });
  const { data: academicYearsData } = useQuery({
    queryKey: ["academic-years", "student-masterlist"],
    queryFn: () => getAcademicYears(),
  });

  const academicYears = academicYearsData?.years ?? [];
  const activeYearId = academicYearsData?.activeYear?.id ?? academicYears[0]?.id ?? "";
  const effectiveYearId = selectedYearId || activeYearId || "all";

  useEffect(() => {
    if (!selectedYearId && activeYearId) setSelectedYearId(activeYearId);
  }, [activeYearId, selectedYearId]);

  const yearById = useMemo(() => new Map(academicYears.map((year) => [year.id, year.name])), [academicYears]);
  const yearOptions = useMemo(() => {
    if (academicYears.length > 0) {
      return academicYears.map((year) => ({
        id: year.id,
        name: year.name,
        count: students.filter((student) => student.academicYearId === year.id).length,
        isActive: year.isActive,
      }));
    }

    return Array.from(new Map(students.map((student) => [student.academicYearId ?? "unassigned", student.academicYearId?.replace(/^AY-/, "") ?? "Unassigned"])).entries())
      .map(([id, name]) => ({ id, name, count: students.filter((student) => (student.academicYearId ?? "unassigned") === id).length, isActive: false }));
  }, [academicYears, students]);

  const yearScopedStudents = useMemo(() => {
    if (effectiveYearId === "all") return students;
    return students.filter((student) => student.academicYearId === effectiveYearId);
  }, [students, effectiveYearId]);

  const gradeOptions = useMemo(() => {
    return Array.from(new Set(yearScopedStudents.map((student) => student.grade).filter(Boolean)))
      .sort((a, b) => gradeSortValue(a) - gradeSortValue(b));
  }, [yearScopedStudents]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return yearScopedStudents.filter((student) => {
      const matchesStatus = statusFilter === "All" || student.status === statusFilter;
      const matchesGrade = gradeFilter === "All" || student.grade === gradeFilter;
      const matchesQuery = !needle || [student.name, student.id, student.email, student.grade, student.lrn ?? ""]
        .some((value) => value.toLowerCase().includes(needle));
      return matchesStatus && matchesGrade && matchesQuery;
    });
  }, [gradeFilter, query, statusFilter, yearScopedStudents]);

  const currentYearCount = students.filter((student) => student.academicYearId === activeYearId).length;
  const historicalCount = students.filter((student) => student.academicYearId && student.academicYearId !== activeYearId).length;
  const importedCount = yearScopedStudents.filter((student) => student.sourceFile).length;
  const selectedYearLabel = effectiveYearId === "all" ? "All school years" : yearById.get(effectiveYearId) ?? effectiveYearId.replace(/^AY-/, "");

  return (
    <div className="-mx-4 min-h-[calc(100vh-4rem)] bg-[#f4f7fb] px-3 pb-8 pt-4 sm:-mx-6 sm:px-5 lg:-mx-8 lg:px-6">
      <div className="mx-auto max-w-[1500px] space-y-5">
        <section className="rounded-3xl border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.45)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-[10px] font-bold uppercase tracking-[0.18em] text-[#b45309]">Registrar Masterlist</p>
              <h2 className="mt-1 font-display text-2xl font-semibold text-[#101827]">Student Masterlist</h2>
              <p className="mt-1 max-w-2xl text-sm text-[#667085]">
                Defaults to the active school year. Use the school year filter when reviewing historical CSV imports.
              </p>
            </div>
            <motion.div
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.97 }}
              className="inline-flex items-center gap-1.5 rounded-2xl bg-[#101827] px-4 py-2.5 text-sm font-semibold text-[#f6c65b] shadow-[0_18px_40px_-26px_rgba(16,24,39,0.85)]"
            >
              <Link to="/registration" className="inline-flex items-center gap-1.5">
                <Plus className="h-4 w-4" /> New student
              </Link>
            </motion.div>
          </div>

          <div className="mt-5 grid gap-3 md:grid-cols-4">
            <SummaryCard icon={CalendarDays} label="Selected Year" value={selectedYearLabel} sub={`${filtered.length} shown`} />
            <SummaryCard icon={UserCheck} label="Current Active Year" value={String(currentYearCount)} sub={yearById.get(activeYearId) ?? activeYearId.replace(/^AY-/, "")} />
            <SummaryCard icon={FileClock} label="Historical Records" value={String(historicalCount)} sub="Previous school years" />
            <SummaryCard icon={Database} label="CSV Imports In View" value={String(importedCount)} sub="Imported learner rows" />
          </div>
        </section>

        <section className="rounded-3xl border border-[#d9e2ef] bg-white p-4 shadow-[0_18px_55px_-46px_rgba(15,23,42,0.45)]">
          <div className="grid gap-3 xl:grid-cols-[minmax(15rem,1.3fr)_minmax(11rem,0.75fr)_minmax(11rem,0.75fr)_auto]">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search by name, LRN, ID, email, or grade"
                className="h-11 w-full rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] pl-10 pr-3 text-sm outline-none focus:border-[#b88b20] focus:ring-4 focus:ring-[#d8b45f]/20"
              />
            </div>

            <label className="relative">
              <span className="sr-only">School year</span>
              <select
                value={effectiveYearId}
                onChange={(event) => {
                  setSelectedYearId(event.target.value);
                  setGradeFilter("All");
                  setSelected(null);
                }}
                className="h-11 w-full rounded-2xl border border-[#d9e2ef] bg-[#fffdf8] px-3 text-sm font-semibold text-[#101827] outline-none focus:border-[#b88b20] focus:ring-4 focus:ring-[#d8b45f]/20"
              >
                <option value="all">All school years ({students.length})</option>
                {yearOptions.map((year) => (
                  <option key={year.id} value={year.id}>
                    {year.name}{year.isActive ? " - active" : ""} ({year.count})
                  </option>
                ))}
              </select>
            </label>

            <label className="relative">
              <span className="sr-only">Grade level</span>
              <select
                value={gradeFilter}
                onChange={(event) => setGradeFilter(event.target.value)}
                className="h-11 w-full rounded-2xl border border-[#d9e2ef] bg-[#fffdf8] px-3 text-sm font-semibold text-[#101827] outline-none focus:border-[#b88b20] focus:ring-4 focus:ring-[#d8b45f]/20"
              >
                <option value="All">All grade levels ({yearScopedStudents.length})</option>
                {gradeOptions.map((grade) => (
                  <option key={grade} value={grade}>
                    {grade} ({yearScopedStudents.filter((student) => student.grade === grade).length})
                  </option>
                ))}
              </select>
            </label>

            <div className="inline-flex items-center gap-2 rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] px-3 text-sm font-semibold text-[#475467]">
              <Filter className="h-4 w-4" />
              {filtered.length} records
            </div>
          </div>

          <div className="mt-4 flex flex-wrap gap-1 rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] p-1">
            {tabs.map((tab) => (
              <button
                key={tab}
                onClick={() => setStatusFilter(tab)}
                className={cn(
                  "relative rounded-xl px-3 py-2 text-xs font-semibold transition-colors",
                  statusFilter === tab ? "text-[#f6c65b]" : "text-[#667085] hover:text-[#101827]",
                )}
              >
                {statusFilter === tab && (
                  <motion.span layoutId="student-tab" className="absolute inset-0 -z-0 rounded-xl bg-[#101827]" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
                )}
                <span className="relative z-10">{tab}</span>
              </button>
            ))}
          </div>
        </section>

        <section className="overflow-hidden rounded-3xl border border-[#d9e2ef] bg-white shadow-[0_18px_55px_-46px_rgba(15,23,42,0.45)]">
          <div className="overflow-x-auto">
            <table className="w-full min-w-[980px] text-sm">
              <thead>
                <tr className="border-b border-[#d9e2ef] bg-[#101827] text-left text-xs font-semibold uppercase tracking-[0.16em] text-[#f6c65b]">
                  <th className="px-5 py-3">Student</th>
                  <th className="px-5 py-3">LRN / ID</th>
                  <th className="px-5 py-3">School Year</th>
                  <th className="px-5 py-3">Grade</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3">Record Type</th>
                  <th className="px-5 py-3 text-right">GPA</th>
                  <th className="px-5 py-3 w-10"></th>
                </tr>
              </thead>
              <tbody>
                <AnimatePresence initial={false}>
                  {filtered.map((student, index) => (
                    <motion.tr
                      key={student.id}
                      layout
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ delay: Math.min(index * 0.012, 0.24) }}
                      onClick={() => setSelected(student)}
                      className="cursor-pointer border-b border-[#d9e2ef] transition-colors hover:bg-[#fff8e7]"
                    >
                      <td className="px-5 py-3">
                        <div className="flex items-center gap-3">
                          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#eef6f4] font-display text-sm font-semibold text-[#0f766e] ring-1 ring-[#d9e2ef]">
                            {student.avatar}
                          </div>
                          <div className="min-w-0">
                            <div className="truncate font-semibold text-[#101827]">{student.name}</div>
                            <div className="truncate text-xs text-[#667085]">{student.email}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-5 py-3 text-[#475467]">
                        <div className="font-semibold text-[#101827]">{student.lrn || "No LRN"}</div>
                        <div className="text-xs">{student.id}</div>
                      </td>
                      <td className="px-5 py-3 font-semibold text-[#101827]">{yearById.get(student.academicYearId ?? "") ?? student.academicYearId?.replace(/^AY-/, "") ?? "Unassigned"}</td>
                      <td className="px-5 py-3 text-[#475467]">{student.grade}</td>
                      <td className="px-5 py-3"><StatusPill status={student.status} /></td>
                      <td className="px-5 py-3">
                        <span className={cn(
                          "inline-flex rounded-full px-2.5 py-1 text-xs font-semibold",
                          student.sourceFile ? "bg-[#fff7df] text-[#92400e]" : "bg-[#e0f2fe] text-[#075985]",
                        )}>
                          {student.sourceFile ? "Historical CSV" : "Current Record"}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-right font-semibold text-[#101827]">{student.gpa > 0 ? student.gpa.toFixed(2) : "Pending"}</td>
                      <td className="px-5 py-3 text-[#667085]"><MoreHorizontal className="h-4 w-4" /></td>
                    </motion.tr>
                  ))}
                </AnimatePresence>
              </tbody>
            </table>
          </div>

          {isLoading && (
            <div className="p-10 text-center text-sm text-[#667085]">Loading masterlist...</div>
          )}
          {!isLoading && filtered.length === 0 && (
            <div className="p-10 text-center text-sm text-[#667085]">No students match the selected year, grade, status, or search.</div>
          )}
        </section>
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-white p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-[#101827] font-display text-lg font-semibold text-[#f6c65b] shadow-[0_18px_40px_-28px_rgba(16,24,39,0.9)]">
                  {selected.avatar}
                </div>
                <div className="min-w-0">
                  <h3 className="break-words font-display text-xl font-semibold text-[#101827]">{selected.name}</h3>
                  <p className="text-sm text-[#667085]">{selected.id} - {selected.grade}</p>
                </div>
              </div>

              <div className="mt-6 grid grid-cols-2 gap-3">
                <Detail label="School Year" value={yearById.get(selected.academicYearId ?? "") ?? selected.academicYearId?.replace(/^AY-/, "") ?? "Unassigned"} />
                <Detail label="Status" value={selected.status} />
                <Detail label="LRN" value={selected.lrn || "No LRN"} />
                <Detail label="GPA" value={selected.gpa > 0 ? selected.gpa.toFixed(2) : "Pending"} />
                <Detail label="Record Type" value={selected.sourceFile ? "Historical CSV" : "Current Record"} />
                <Detail label="Source" value={selected.sourceFile ?? selected.enrolled} />
              </div>

              <div className="mt-6 rounded-2xl border border-[#d9e2ef] bg-[#fffdf8] p-4 text-sm leading-6 text-[#475467]">
                This masterlist record belongs to {yearById.get(selected.academicYearId ?? "") ?? selected.academicYearId?.replace(/^AY-/, "") ?? "an unassigned year"}.
                {selected.sourceFile ? " It was imported from the CSV and should be reviewed before treating it as a current-year enrollment." : " It is part of the active operational student set."}
              </div>

              <div className="mt-6 flex gap-2">
                <Link to="/registrar/learner-profile" className="flex-1 rounded-2xl bg-[#101827] py-2.5 text-center text-sm font-semibold text-[#f6c65b] shadow-[0_18px_40px_-28px_rgba(16,24,39,0.9)]">
                  Open learner profile
                </Link>
                <button className="rounded-2xl border border-[#d9e2ef] bg-white px-3 py-2.5 text-sm hover:bg-[#f8fafc]"><Mail className="h-4 w-4" /></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}

function SummaryCard({ icon: Icon, label, value, sub }: { icon: typeof Users; label: string; value: string; sub: string }) {
  return (
    <div className="rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#667085]">{label}</div>
          <div className="mt-1 font-display text-xl font-semibold text-[#101827]">{value}</div>
          <div className="mt-1 text-xs font-medium text-[#667085]">{sub}</div>
        </div>
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-[#101827] ring-1 ring-[#d9e2ef]">
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </div>
  );
}

function StatusPill({ status }: { status: Student["status"] }) {
  return (
    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", statusStyles[status])}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {status}
    </span>
  );
}

function Detail({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] p-3">
      <div className="text-[10px] font-bold uppercase tracking-[0.16em] text-[#667085]">{label}</div>
      <div className="mt-1 break-words text-sm font-semibold text-[#101827]">{value}</div>
    </div>
  );
}

function gradeSortValue(grade: string) {
  if (grade === "KG1") return 1;
  if (grade === "KG2") return 2;
  const match = grade.match(/\d+/);
  return match ? Number(match[0]) + 10 : 999;
}
