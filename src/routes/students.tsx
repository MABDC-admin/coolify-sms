import { createFileRoute } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Filter, Plus, Mail, MoreHorizontal } from "lucide-react";
import { useMemo, useState } from "react";
import { students, type Student } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/students")({
  head: () => ({ meta: [{ title: "Students — Scholaris" }] }),
  component: StudentsPage,
});

const statusStyles: Record<Student["status"], string> = {
  Active: "bg-success/15 text-success-foreground",
  Pending: "bg-warning/20 text-warning-foreground",
  "On Leave": "bg-muted text-muted-foreground",
  Graduated: "bg-accent text-accent-foreground",
};

function StudentsPage() {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"All" | Student["status"]>("All");
  const [selected, setSelected] = useState<Student | null>(null);

  const filtered = useMemo(() =>
    students.filter(s =>
      (filter === "All" || s.status === filter) &&
      (s.name.toLowerCase().includes(query.toLowerCase()) || s.id.toLowerCase().includes(query.toLowerCase()))
    ), [query, filter]);

  const tabs = ["All", "Active", "Pending", "On Leave"] as const;

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center gap-3">
        <div className="relative flex-1 min-w-[220px]">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <input
            value={query} onChange={e => setQuery(e.target.value)}
            placeholder="Search by name or ID…"
            className="w-full rounded-xl border border-input bg-card py-2.5 pl-9 pr-3 text-sm shadow-soft outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/30"
          />
        </div>
        <div className="flex items-center gap-1 rounded-xl border border-border bg-card p-1 shadow-soft">
          {tabs.map(t => (
            <button
              key={t} onClick={() => setFilter(t)}
              className={cn(
                "relative rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                filter === t ? "text-primary-foreground" : "text-muted-foreground hover:text-foreground"
              )}
            >
              {filter === t && (
                <motion.span layoutId="student-tab" className="absolute inset-0 -z-0 rounded-lg bg-gradient-primary" transition={{ type: "spring", stiffness: 300, damping: 30 }} />
              )}
              <span className="relative z-10">{t}</span>
            </button>
          ))}
        </div>
        <button className="inline-flex items-center gap-1.5 rounded-xl border border-border bg-card px-3 py-2 text-sm font-medium shadow-soft hover:bg-accent">
          <Filter className="h-4 w-4" /> Filters
        </button>
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
          className="ml-auto inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant">
          <Plus className="h-4 w-4" /> New student
        </motion.button>
      </div>

      <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-border bg-muted/40 text-left text-xs font-medium uppercase tracking-wider text-muted-foreground">
              <th className="px-5 py-3">Student</th>
              <th className="px-5 py-3 hidden md:table-cell">ID</th>
              <th className="px-5 py-3 hidden sm:table-cell">Grade</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3 hidden lg:table-cell">GPA</th>
              <th className="px-5 py-3 hidden xl:table-cell">Enrolled</th>
              <th className="px-5 py-3 w-10"></th>
            </tr>
          </thead>
          <tbody>
            <AnimatePresence initial={false}>
              {filtered.map((s, i) => (
                <motion.tr
                  key={s.id}
                  layout
                  initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                  transition={{ delay: i * 0.025 }}
                  onClick={() => setSelected(s)}
                  className="cursor-pointer border-b border-border/60 transition-colors hover:bg-accent/40"
                >
                  <td className="px-5 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">{s.avatar}</div>
                      <div>
                        <div className="font-medium">{s.name}</div>
                        <div className="text-xs text-muted-foreground">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-5 py-3 hidden md:table-cell text-muted-foreground">{s.id}</td>
                  <td className="px-5 py-3 hidden sm:table-cell">{s.grade}</td>
                  <td className="px-5 py-3">
                    <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium", statusStyles[s.status])}>
                      <span className="h-1.5 w-1.5 rounded-full bg-current" /> {s.status}
                    </span>
                  </td>
                  <td className="px-5 py-3 hidden lg:table-cell font-medium">{s.gpa.toFixed(2)}</td>
                  <td className="px-5 py-3 hidden xl:table-cell text-muted-foreground">{s.enrolled}</td>
                  <td className="px-5 py-3 text-muted-foreground"><MoreHorizontal className="h-4 w-4" /></td>
                </motion.tr>
              ))}
            </AnimatePresence>
          </tbody>
        </table>
        {filtered.length === 0 && (
          <div className="p-10 text-center text-sm text-muted-foreground">No students match your filters.</div>
        )}
      </div>

      <AnimatePresence>
        {selected && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setSelected(null)}
              className="fixed inset-0 z-40 bg-black/40 backdrop-blur-sm" />
            <motion.div
              initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 28, stiffness: 240 }}
              className="fixed inset-y-0 right-0 z-50 w-full max-w-md overflow-y-auto bg-card p-6 shadow-2xl"
            >
              <div className="flex items-center gap-4">
                <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-primary text-lg font-semibold text-primary-foreground shadow-elegant">{selected.avatar}</div>
                <div>
                  <h3 className="font-display text-xl font-semibold">{selected.name}</h3>
                  <p className="text-sm text-muted-foreground">{selected.id} · {selected.grade}</p>
                </div>
              </div>
              <div className="mt-6 grid grid-cols-2 gap-3">
                {[
                  ["Status", selected.status],
                  ["GPA", selected.gpa.toFixed(2)],
                  ["Enrolled", selected.enrolled],
                  ["Email", selected.email],
                ].map(([k, v]) => (
                  <div key={k} className="rounded-xl border border-border bg-secondary/40 p-3">
                    <div className="text-[11px] uppercase tracking-wider text-muted-foreground">{k}</div>
                    <div className="mt-1 text-sm font-medium break-all">{v}</div>
                  </div>
                ))}
              </div>
              <div className="mt-6 space-y-2">
                <h4 className="text-sm font-semibold">Current courses</h4>
                {["MATH-301 · Advanced Calculus", "ENGL-220 · Modern Literature", "CHEM-201 · Organic Chemistry"].map((c, i) => (
                  <motion.div key={c}
                    initial={{ opacity: 0, x: 12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: 0.08 + i * 0.05 }}
                    className="rounded-lg border border-border bg-background p-3 text-sm">
                    {c}
                  </motion.div>
                ))}
              </div>
              <div className="mt-6 flex gap-2">
                <button className="flex-1 rounded-xl bg-gradient-primary py-2.5 text-sm font-medium text-primary-foreground shadow-elegant">View full record</button>
                <button className="rounded-xl border border-border bg-card px-3 py-2.5 text-sm hover:bg-accent"><Mail className="h-4 w-4" /></button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}
