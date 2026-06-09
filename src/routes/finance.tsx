import { createFileRoute } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer } from "recharts";

export const Route = createFileRoute("/finance")({
  head: () => ({ meta: [{ title: "Finance Dashboard — Scholaris" }] }),
  component: FinanceDashboard,
});

function FinanceDashboard() {
  const collected = 845000;
  const outstanding = 125000;
  const payrollTotal = 750000;
  
  const employees = [
    { name: "John Doe", role: "Head Teacher", amount: "$85,000" },
    { name: "Jane Smith", role: "Science Teacher", amount: "$65,000" },
    { name: "Michael Johnson", role: "Math Teacher", amount: "$62,000" },
    { name: "Emily Davis", role: "Admin Staff", amount: "$45,000" },
    { name: "Robert Wilson", role: "Librarian", amount: "$40,000" },
  ];

  const monthlyData = [
    { name: 'Sep', income: 85, progress: 45, returned: 25 },
    { name: 'Oct', income: 95, progress: 55, returned: 35 },
    { name: 'Nov', income: 75, progress: 40, returned: 20 },
    { name: 'Dec', income: 88, progress: 50, returned: 30 },
    { name: 'Jan', income: 92, progress: 48, returned: 28 },
    { name: 'Feb', income: 78, progress: 42, returned: 22 },
    { name: 'Mar', income: 98, progress: 58, returned: 38 },
    { name: 'Apr', income: 82, progress: 45, returned: 25 },
    { name: 'May', income: 90, progress: 52, returned: 32 },
  ];

  return (
    <div className="space-y-6">
      {/* Top Row - 3 Cards */}
      <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0 }} className="col-span-1 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-2 flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f5e3]">
              <span className="text-[#5b8c51]">💰</span>
            </div>
            <p className="text-sm text-muted-foreground">Collected</p>
          </div>
          <p className="mb-4 font-display text-4xl font-bold">${collected.toLocaleString()}</p>
          <div className="flex justify-between text-sm">
            <span className="text-muted-foreground">Collected - <span className="font-semibold text-foreground">${(collected * 0.8).toLocaleString()}</span></span>
            <span className="text-muted-foreground">Expected - <span className="font-semibold text-foreground">${(collected * 1.5).toLocaleString()}</span></span>
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="col-span-1 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <p className="mb-2 text-sm text-muted-foreground">Outstanding Balance</p>
          <p className="mb-4 font-display text-4xl font-bold">${outstanding.toLocaleString()}</p>
          <p className="text-sm text-muted-foreground">Overdue - <span className="font-semibold text-foreground">${(outstanding * 0.3).toLocaleString()}</span></p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="col-span-1 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-2 flex items-center justify-between">
            <p className="text-sm text-muted-foreground">Finance Status</p>
            <span className="text-2xl font-bold text-[#5b8c51]">7</span>
          </div>
          <p className="mb-1 text-xs text-muted-foreground">Pending Approvals</p>
          <div className="mb-3 flex items-center gap-2">
            <p className="font-display text-3xl font-bold">$148,000</p>
            <span className="text-xl text-[#5b8c51]">✓</span>
          </div>
          <p className="text-sm text-muted-foreground">Quarterly - <span className="font-semibold text-foreground">$12,200</span></p>
        </motion.div>
      </div>

      {/* Middle Row - 2 Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Monthly Income vs Expenses</h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f5e3]">
              <span className="text-[#5b8c51]">📊</span>
            </div>
          </div>
          <div className="mb-4 flex items-center gap-4">
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-[#5b8c51]"></div><span className="text-xs text-muted-foreground">Income</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-[#8bb87d]"></div><span className="text-xs text-muted-foreground">In Progress</span></div>
            <div className="flex items-center gap-2"><div className="h-3 w-3 rounded-full bg-[#c5deb8]"></div><span className="text-xs text-muted-foreground">Returned</span></div>
          </div>
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={monthlyData} barGap={2}>
              <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" vertical={false} />
              <XAxis dataKey="name" tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} />
              <YAxis tick={{ fontSize: 10, fill: '#9ca3af' }} axisLine={false} tickLine={false} domain={[0, 100]} ticks={[0, 50, 90, 100]} tickFormatter={(v) => `${v}%`} />
              <Bar dataKey="income" fill="#5B8C51" radius={[2, 2, 0, 0]} barSize={12} />
              <Bar dataKey="progress" fill="#8BB87D" radius={[2, 2, 0, 0]} barSize={12} />
              <Bar dataKey="returned" fill="#C5DEB8" radius={[2, 2, 0, 0]} barSize={12} />
            </BarChart>
          </ResponsiveContainer>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }} className="rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Revenue Breakdown</h3>
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#e8f5e3]">
              <span className="text-[#5b8c51]">💵</span>
            </div>
          </div>
          <div className="mb-4 flex items-center justify-between border-b border-border pb-4">
            <div>
              <p className="mb-1 text-xs text-muted-foreground">Total Revenue</p>
              <p className="font-display text-3xl font-bold">${collected.toLocaleString()}</p>
            </div>
            <div className="text-right">
              <p className="mb-1 text-xs text-muted-foreground">Collection Rate</p>
              <div className="inline-flex items-center justify-center rounded-full bg-green-50 px-3 py-1">
                <p className="text-lg font-bold text-[#5b8c51]">{(collected + outstanding > 0 ? (collected / (collected + outstanding) * 100).toFixed(1) : 0)}%</p>
              </div>
            </div>
          </div>
          <div className="mt-2 grid grid-cols-3 gap-4">
            <div className="rounded-xl bg-accent p-3"><p className="mb-1 text-xs text-muted-foreground">Tuition</p><p className="text-lg font-bold">${(collected * 0.7).toLocaleString(undefined, {maximumFractionDigits: 0})}</p></div>
            <div className="rounded-xl bg-accent p-3"><p className="mb-1 text-xs text-muted-foreground">Fees</p><p className="text-lg font-bold">${(collected * 0.1).toLocaleString(undefined, {maximumFractionDigits: 0})}</p></div>
            <div className="rounded-xl bg-accent p-3"><p className="mb-1 text-xs text-muted-foreground">Other</p><p className="text-lg font-bold">${(collected * 0.2).toLocaleString(undefined, {maximumFractionDigits: 0})}</p></div>
          </div>
        </motion.div>
      </div>

      {/* Bottom Row - 3 Cards */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.25 }} className="lg:col-span-4 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-2 flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8f5e3]">
                <span className="text-xs text-[#5b8c51]">👥</span>
              </div>
              <p className="text-sm text-muted-foreground">Payroll & Salaries</p>
            </div>
          </div>
          <p className="mb-2 text-xs text-muted-foreground">Total payroll</p>
          <div className="mb-4 flex items-baseline gap-4">
            <p className="font-display text-2xl font-bold">${payrollTotal.toLocaleString()}</p>
          </div>
          
          <div className="mb-2 mt-6 flex items-center gap-2">
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-[#e8f5e3]">
              <span className="text-xs text-[#5b8c51]">💳</span>
            </div>
            <p className="text-sm text-muted-foreground">Monthly Avg</p>
          </div>
          <p className="font-display text-3xl font-bold">${(payrollTotal / 12).toLocaleString(undefined, {maximumFractionDigits: 0})}</p>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }} className="lg:col-span-5 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-4 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Employees</h3>
            <div className="flex items-center gap-2 text-muted-foreground"><span>‹</span><span>›</span></div>
          </div>
          <div className="space-y-2">
            {employees.length > 0 ? employees.map((emp, index) => (
              <div key={index} className="flex items-center gap-3 rounded-xl p-2 transition-colors hover:bg-accent">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-[#e8f5e3]">
                  <span className="text-lg text-[#5b8c51]">👤</span>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium">{emp.name}</p>
                  <p className="text-xs text-muted-foreground">{emp.role}</p>
                </div>
                {emp.amount && <p className="text-sm font-semibold">{emp.amount}</p>}
              </div>
            )) : (
              <div className="py-8 text-center">
                <p className="text-sm text-muted-foreground">No active employees found.</p>
              </div>
            )}
          </div>
        </motion.div>

        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.35 }} className="lg:col-span-3 rounded-2xl border border-border bg-card p-5 shadow-soft">
          <div className="mb-2 flex items-center justify-between">
            <h3 className="text-lg font-semibold">Finance & HR</h3>
            <div className="flex h-6 w-6 items-center justify-center rounded-lg bg-[#e8f5e3]">
              <span className="text-xs text-[#5b8c51]">📈</span>
            </div>
          </div>
          <p className="mb-4 font-display text-3xl font-bold text-[#5b8c51]">${(payrollTotal > 0 ? payrollTotal * 1.5 : 1125000).toLocaleString()}</p>
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#5b8c51]"></div>
              <div><p className="text-xs text-foreground">Annual Budget</p><p className="text-xs text-muted-foreground">Approved</p></div>
            </div>
            <div className="flex items-center gap-2">
              <div className="h-2 w-2 rounded-full bg-[#c5deb8]"></div>
              <div><p className="text-xs text-foreground">Quarterly Report</p><p className="text-xs text-muted-foreground">Due: Mar 31</p></div>
            </div>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
