import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BookOpen, Users, MapPin, Clock, Plus } from "lucide-react";
import { courses } from "@/lib/mock-data";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/courses")({
  head: () => ({ meta: [{ title: "Courses — Scholaris" }] }),
  component: CoursesPage,
});

const deptColor: Record<string, string> = {
  Mathematics: "from-chart-1 to-primary-glow",
  Science: "from-chart-2 to-chart-3",
  Humanities: "from-chart-4 to-chart-1",
  Languages: "from-chart-3 to-chart-5",
  Arts: "from-chart-5 to-chart-4",
};

function CoursesPage() {
  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          {["All departments", "Mathematics", "Science", "Humanities", "Languages", "Arts"].map((d, i) => (
            <button key={d}
              className={cn("rounded-full border px-3 py-1.5 text-xs font-medium transition-all",
                i === 0 ? "border-transparent bg-gradient-primary text-primary-foreground shadow-elegant" : "border-border bg-card text-muted-foreground hover:text-foreground hover:bg-accent")}>
              {d}
            </button>
          ))}
        </div>
        <motion.button whileHover={{ y: -1 }} whileTap={{ scale: 0.97 }}
          className="inline-flex items-center gap-1.5 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground shadow-elegant">
          <Plus className="h-4 w-4" /> Create course
        </motion.button>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-3">
        {courses.map((c, i) => {
          const pct = Math.round((c.enrolled / c.capacity) * 100);
          const full = pct >= 100;
          return (
            <motion.div
              key={c.code}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -4 }}
              className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-elegant"
            >
              <div className={cn("absolute -right-12 -top-12 h-36 w-36 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity group-hover:opacity-25", deptColor[c.department])} />
              <div className="flex items-start justify-between">
                <div>
                  <div className="text-xs font-semibold uppercase tracking-wider text-muted-foreground">{c.code}</div>
                  <h3 className="mt-1 font-display text-lg font-semibold tracking-tight">{c.title}</h3>
                </div>
                <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground", deptColor[c.department])}>
                  <BookOpen className="h-5 w-5" />
                </div>
              </div>

              <div className="mt-4 grid grid-cols-2 gap-3 text-xs text-muted-foreground">
                <div className="flex items-center gap-1.5"><Users className="h-3.5 w-3.5" /> {c.instructor}</div>
                <div className="flex items-center gap-1.5"><MapPin className="h-3.5 w-3.5" /> {c.room}</div>
                <div className="flex items-center gap-1.5 col-span-2"><Clock className="h-3.5 w-3.5" /> {c.schedule}</div>
              </div>

              <div className="mt-5">
                <div className="mb-1.5 flex items-center justify-between text-xs">
                  <span className="text-muted-foreground">Enrollment</span>
                  <span className={cn("font-medium", full && "text-destructive")}>{c.enrolled}/{c.capacity}</span>
                </div>
                <div className="h-1.5 overflow-hidden rounded-full bg-muted">
                  <motion.div
                    initial={{ width: 0 }} animate={{ width: `${Math.min(pct, 100)}%` }}
                    transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 + i * 0.03 }}
                    className={cn("h-full rounded-full", full ? "bg-destructive" : "bg-gradient-primary")}
                  />
                </div>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
