import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { Bar, BarChart, CartesianGrid, ResponsiveContainer, Tooltip, XAxis, YAxis, Line, LineChart } from "recharts";
import { Download, FileText, FileSpreadsheet, FileBarChart, ArrowUpRight } from "lucide-react";
import { departmentDistribution, enrollmentTrend } from "@/lib/mock-data";

export const Route = createFileRoute("/reports")({
  head: () => ({ meta: [{ title: "Reports — Scholaris" }] }),
  component: ReportsPage,
});

const gpaTrend = [
  { term: "F22", gpa: 3.41 },
  { term: "S23", gpa: 3.48 },
  { term: "F23", gpa: 3.52 },
  { term: "S24", gpa: 3.61 },
  { term: "F24", gpa: 3.58 },
  { term: "S25", gpa: 3.67 },
];

const reports = [
  { title: "Term Enrollment Summary", desc: "Detailed counts by program and grade", icon: FileBarChart, size: "PDF · 2.4MB" },
  { title: "Faculty Workload", desc: "Section assignments and hours per instructor", icon: FileSpreadsheet, size: "XLSX · 1.1MB" },
  { title: "Transcript Audit", desc: "End-of-term GPA and credit verification", icon: FileText, size: "PDF · 5.8MB" },
  { title: "Attendance Compliance", desc: "Daily attendance rollup with anomalies", icon: FileSpreadsheet, size: "XLSX · 820KB" },
];

function ReportsPage() {
  return (
    <div className="space-y-5">
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-2">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Average GPA</h2>
              <p className="text-sm text-muted-foreground">Last 6 terms across all programs</p>
            </div>
            <span className="text-2xl font-display font-semibold text-gradient">3.67</span>
          </div>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={gpaTrend} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="term" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis domain={[3.2, 3.8]} stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
                <Line type="monotone" dataKey="gpa" stroke="var(--chart-1)" strokeWidth={3} dot={{ r: 4, fill: "var(--chart-1)" }} activeDot={{ r: 6 }} />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft"
        >
          <h2 className="font-display text-lg font-semibold">Students per department</h2>
          <p className="text-sm text-muted-foreground">Active count this term</p>
          <div className="mt-4 h-60">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={departmentDistribution} margin={{ left: -10, right: 8 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--muted-foreground)" fontSize={11} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
                <Bar dataKey="value" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </motion.div>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
        className="rounded-2xl border border-border bg-card p-5 shadow-soft"
      >
        <div className="flex items-start justify-between">
          <div>
            <h2 className="font-display text-lg font-semibold">Yearly enrollment</h2>
            <p className="text-sm text-muted-foreground">New vs returning by month</p>
          </div>
          <button className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium hover:bg-accent">
            Export <ArrowUpRight className="h-3 w-3" />
          </button>
        </div>
        <div className="mt-4 h-64">
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={enrollmentTrend} margin={{ left: -10, right: 8 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
              <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
              <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} cursor={{ fill: "var(--accent)", opacity: 0.4 }} />
              <Bar dataKey="returning" stackId="a" fill="var(--chart-2)" radius={[0, 0, 0, 0]} />
              <Bar dataKey="new" stackId="a" fill="var(--chart-1)" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
      </motion.div>

      <div>
        <h2 className="mb-3 font-display text-lg font-semibold">Available reports</h2>
        <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
          {reports.map((r, i) => (
            <motion.button
              key={r.title}
              initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              whileHover={{ y: -2 }} whileTap={{ scale: 0.99 }}
              className="group flex items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-shadow hover:shadow-elegant"
            >
              <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <r.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <div className="font-medium">{r.title}</div>
                <div className="text-xs text-muted-foreground">{r.desc}</div>
                <div className="mt-0.5 text-[11px] text-muted-foreground">{r.size}</div>
              </div>
              <Download className="h-4 w-4 text-muted-foreground transition-transform group-hover:-translate-y-0.5 group-hover:text-primary" />
            </motion.button>
          ))}
        </div>
      </div>
    </div>
  );
}
