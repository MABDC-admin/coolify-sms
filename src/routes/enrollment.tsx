import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Check, Clock, X, FileText, ArrowRight } from "lucide-react";
import { useState } from "react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/enrollment")({
  head: () => ({ meta: [{ title: "Enrollment — Scholaris" }] }),
  component: EnrollmentPage,
});

type AppStatus = "New" | "Review" | "Interview" | "Decision";
type App = { id: string; name: string; grade: string; submitted: string; status: AppStatus; initials: string };

const initial: App[] = [
  { id: "APP-901", name: "Olivia Hart", grade: "Grade 9", submitted: "2d ago", status: "New", initials: "OH" },
  { id: "APP-902", name: "Kai Nakamura", grade: "Grade 10", submitted: "3d ago", status: "New", initials: "KN" },
  { id: "APP-903", name: "Maya Patel", grade: "Grade 11", submitted: "5d ago", status: "Review", initials: "MP" },
  { id: "APP-904", name: "Theo Laurent", grade: "Grade 9", submitted: "6d ago", status: "Review", initials: "TL" },
  { id: "APP-905", name: "Iris Chen", grade: "Grade 12", submitted: "1w ago", status: "Interview", initials: "IC" },
  { id: "APP-906", name: "Daniel Rossi", grade: "Grade 10", submitted: "1w ago", status: "Interview", initials: "DR" },
  { id: "APP-907", name: "Hana Schmidt", grade: "Grade 11", submitted: "2w ago", status: "Decision", initials: "HS" },
];

const columns: { key: AppStatus; label: string; tint: string }[] = [
  { key: "New", label: "New Applications", tint: "from-chart-1/20 to-transparent" },
  { key: "Review", label: "Under Review", tint: "from-chart-2/20 to-transparent" },
  { key: "Interview", label: "Interview", tint: "from-chart-4/20 to-transparent" },
  { key: "Decision", label: "Decision", tint: "from-chart-3/20 to-transparent" },
];

function EnrollmentPage() {
  const [apps, setApps] = useState(initial);

  const advance = (id: string) => {
    setApps(prev => prev.map(a => {
      if (a.id !== id) return a;
      const order: AppStatus[] = ["New", "Review", "Interview", "Decision"];
      const next = order[Math.min(order.indexOf(a.status) + 1, order.length - 1)];
      return { ...a, status: next };
    }));
  };

  return (
    <div className="space-y-5">
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
        {[
          { label: "Total this term", value: "284", icon: FileText, hint: "+24 this week" },
          { label: "Acceptance rate", value: "62%", icon: Check, hint: "+3% YoY" },
          { label: "Avg. processing", value: "4.2d", icon: Clock, hint: "-0.8d" },
          { label: "Withdrawals", value: "9", icon: X, hint: "stable" },
        ].map((s, i) => (
          <motion.div
            key={s.label}
            initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="rounded-2xl border border-border bg-card p-4 shadow-soft"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs uppercase tracking-wider text-muted-foreground">{s.label}</span>
              <s.icon className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="mt-2 font-display text-2xl font-semibold">{s.value}</div>
            <div className="text-xs text-muted-foreground">{s.hint}</div>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-4">
        {columns.map((col, ci) => {
          const items = apps.filter(a => a.status === col.key);
          return (
            <motion.div
              key={col.key}
              initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: ci * 0.06 }}
              className={cn("rounded-2xl border border-border bg-gradient-to-b p-3 shadow-soft", col.tint)}
            >
              <div className="mb-2 flex items-center justify-between px-2 py-1">
                <h3 className="text-sm font-semibold">{col.label}</h3>
                <span className="rounded-full bg-card px-2 py-0.5 text-xs font-medium">{items.length}</span>
              </div>
              <div className="space-y-2">
                {items.map((a, i) => (
                  <motion.div
                    key={a.id}
                    layout
                    initial={{ opacity: 0, scale: 0.96 }} animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: 0.05 + i * 0.05 }}
                    whileHover={{ y: -2 }}
                    className="group rounded-xl border border-border bg-card p-3 shadow-soft"
                  >
                    <div className="flex items-center gap-2.5">
                      <div className="flex h-8 w-8 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">{a.initials}</div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate text-sm font-medium">{a.name}</div>
                        <div className="text-[11px] text-muted-foreground">{a.id} · {a.grade}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <span className="text-[11px] text-muted-foreground">{a.submitted}</span>
                      {col.key !== "Decision" && (
                        <motion.button whileTap={{ scale: 0.94 }}
                          onClick={() => advance(a.id)}
                          className="inline-flex items-center gap-1 rounded-full bg-secondary px-2.5 py-1 text-[11px] font-medium hover:bg-accent">
                          Advance <ArrowRight className="h-3 w-3" />
                        </motion.button>
                      )}
                    </div>
                  </motion.div>
                ))}
                {items.length === 0 && (
                  <div className="rounded-lg border border-dashed border-border p-6 text-center text-xs text-muted-foreground">
                    Nothing here yet
                  </div>
                )}
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
}
