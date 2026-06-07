import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import {
  Users, BookOpen, ClipboardCheck, GraduationCap, ArrowUpRight,
  Calendar, FileText, UserPlus, Clock, AlertTriangle, AlertCircle,
  Info, CheckCircle2, ChevronRight
} from "lucide-react";
import {
  Area, AreaChart, CartesianGrid, ResponsiveContainer, Tooltip,
  XAxis, YAxis, Cell, Pie, PieChart, Bar, BarChart
} from "recharts";
import { StatCard } from "@/components/StatCard";
import {
  activities, departmentDistribution, enrollmentTrend,
  todaysClasses, pipelineStages, alerts
} from "@/lib/mock-data";

export const Route = createFileRoute("/")({
  head: () => ({ meta: [{ title: "Dashboard — Scholaris" }] }),
  component: DashboardPage,
});

const COLORS = ["var(--chart-1)", "var(--chart-2)", "var(--chart-3)", "var(--chart-4)", "var(--chart-5)"];

function DashboardPage() {
  return (
    <div className="space-y-6">
      {/* Stats */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <StatCard index={0} label="Active Students" value="1,284" delta={4.2} icon={Users} accent="from-primary to-primary-glow" />
        <StatCard index={1} label="Open Courses" value={87} delta={2.1} icon={BookOpen} accent="from-chart-2 to-chart-3" />
        <StatCard index={2} label="New Enrollments" value={128} delta={12.6} icon={ClipboardCheck} accent="from-chart-4 to-chart-1" />
        <StatCard index={3} label="Graduation Rate" value="96.4%" delta={-0.4} icon={GraduationCap} accent="from-chart-3 to-chart-5" />
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2"
        >
          <div className="flex items-start justify-between">
            <div>
              <h2 className="font-display text-lg font-semibold">Enrollment trend</h2>
              <p className="text-sm text-muted-foreground">New vs returning students this year</p>
            </div>
            <button className="inline-flex items-center gap-1 rounded-full bg-secondary px-3 py-1.5 text-xs font-medium transition-colors hover:bg-accent">
              This year <ArrowUpRight className="h-3 w-3" />
            </button>
          </div>
          <div className="mt-5 h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={enrollmentTrend} margin={{ left: -10, right: 8, top: 8, bottom: 0 }}>
                <defs>
                  <linearGradient id="gNew" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-1)" stopOpacity={0.45} />
                    <stop offset="100%" stopColor="var(--chart-1)" stopOpacity={0} />
                  </linearGradient>
                  <linearGradient id="gRet" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="var(--chart-2)" stopOpacity={0.35} />
                    <stop offset="100%" stopColor="var(--chart-2)" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="month" stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <YAxis stroke="var(--muted-foreground)" fontSize={12} tickLine={false} axisLine={false} />
                <Tooltip
                  contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }}
                />
                <Area type="monotone" dataKey="returning" stroke="var(--chart-2)" strokeWidth={2} fill="url(#gRet)" />
                <Area type="monotone" dataKey="new" stroke="var(--chart-1)" strokeWidth={2.5} fill="url(#gNew)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.18 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft"
        >
          <h2 className="font-display text-lg font-semibold">By department</h2>
          <p className="text-sm text-muted-foreground">Active student distribution</p>
          <div className="mt-2 h-52">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={departmentDistribution} dataKey="value" innerRadius={48} outerRadius={78} paddingAngle={3} stroke="none">
                  {departmentDistribution.map((_, i) => (
                    <Cell key={i} fill={COLORS[i % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={{ background: "var(--popover)", border: "1px solid var(--border)", borderRadius: 12, fontSize: 12 }} />
              </PieChart>
            </ResponsiveContainer>
          </div>
          <div className="mt-3 grid grid-cols-1 gap-1.5">
            {departmentDistribution.map((d, i) => (
              <div key={d.name} className="flex items-center justify-between text-xs">
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: COLORS[i] }} />
                  <span className="text-muted-foreground">{d.name}</span>
                </div>
                <span className="font-medium">{d.value}</span>
              </div>
            ))}
          </div>
        </motion.div>
      </div>

      {/* Activity + Quick actions */}
      <div className="grid grid-cols-1 gap-4 lg:grid-cols-3">
        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.22 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft lg:col-span-2"
        >
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-semibold">Recent activity</h2>
            <button className="text-xs font-medium text-primary hover:underline">View all</button>
          </div>
          <ul className="mt-4 divide-y divide-border">
            {activities.map((a, i) => (
              <motion.li
                key={a.id}
                initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.25 + i * 0.05 }}
                className="group flex items-center gap-3 py-3 transition-colors hover:bg-accent/40 rounded-lg px-2 -mx-2"
              >
                <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">
                  {a.initials}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm">{a.message}</p>
                  <p className="text-xs text-muted-foreground">{a.time}</p>
                </div>
                <ArrowUpRight className="h-4 w-4 -translate-x-2 text-muted-foreground opacity-0 transition-all group-hover:translate-x-0 group-hover:opacity-100" />
              </motion.li>
            ))}
          </ul>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.28 }}
          className="rounded-2xl border border-border bg-gradient-primary p-5 text-primary-foreground shadow-elegant"
        >
          <h2 className="font-display text-lg font-semibold">Quick actions</h2>
          <p className="text-sm text-primary-foreground/80">Common tasks for today</p>
          <div className="mt-4 grid grid-cols-2 gap-2">
            {[
              { label: "Add Student", icon: UserPlus },
              { label: "Schedule", icon: Calendar },
              { label: "New Course", icon: BookOpen },
              { label: "Report", icon: FileText },
            ].map((q, i) => (
              <motion.button
                key={q.label}
                whileHover={{ y: -2 }} whileTap={{ scale: 0.97 }}
                initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.3 + i * 0.05 }}
                className="flex flex-col items-start gap-2 rounded-xl bg-white/10 p-3 text-left backdrop-blur transition-colors hover:bg-white/20"
              >
                <q.icon className="h-5 w-5" />
                <span className="text-sm font-medium">{q.label}</span>
              </motion.button>
            ))}
          </div>
        </motion.div>
      </div>
    </div>
  );
}
