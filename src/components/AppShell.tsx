import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  Search,
  Bell,
  Settings,
  GraduationCap,
  ChevronRight,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/enrollment", label: "Enrollment", icon: ClipboardList },
  { to: "/reports", label: "Reports", icon: BarChart3 },
] as const;

const titles: Record<string, { title: string; sub: string }> = {
  "/": { title: "Overview", sub: "Welcome back, Registrar Ana" },
  "/students": { title: "Student Records", sub: "Manage every enrolled student" },
  "/courses": { title: "Course Catalog", sub: "Schedules, sections, and capacity" },
  "/enrollment": { title: "Enrollment", sub: "Applications and pipeline" },
  "/reports": { title: "Reports", sub: "Insights across the institution" },
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const meta = titles[pathname] ?? { title: "Scholaris", sub: "" };
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col bg-sidebar text-sidebar-foreground lg:flex">
        <BrandHeader />
        <nav className="flex-1 space-y-1 px-3 py-4">
          {navItems.map((item, i) => (
            <NavLink key={item.to} item={item} active={pathname === item.to} index={i} />
          ))}
        </nav>
        <UserPanel />
      </aside>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              onClick={() => setMobileOpen(false)}
              className="fixed inset-0 z-40 bg-black/50 lg:hidden"
            />
            <motion.aside
              initial={{ x: "-100%" }} animate={{ x: 0 }} exit={{ x: "-100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 220 }}
              className="fixed inset-y-0 left-0 z-50 flex w-64 flex-col bg-sidebar text-sidebar-foreground lg:hidden"
            >
              <BrandHeader />
              <nav className="flex-1 space-y-1 px-3 py-4">
                {navItems.map((item, i) => (
                  <div key={item.to} onClick={() => setMobileOpen(false)}>
                    <NavLink item={item} active={pathname === item.to} index={i} />
                  </div>
                ))}
              </nav>
              <UserPanel />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="lg:pl-64">
        <header className="sticky top-0 z-30 border-b border-border/60 bg-background/70 backdrop-blur-xl">
          <div className="flex h-16 items-center gap-3 px-4 sm:px-6 lg:px-8">
            <button
              className="rounded-md p-2 hover:bg-accent lg:hidden"
              onClick={() => setMobileOpen(true)}
              aria-label="Open menu"
            >
              <div className="space-y-1.5">
                <span className="block h-0.5 w-5 bg-foreground" />
                <span className="block h-0.5 w-5 bg-foreground" />
                <span className="block h-0.5 w-5 bg-foreground" />
              </div>
            </button>

            <div className="hidden flex-1 items-center md:flex">
              <div className="group relative w-full max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground transition-colors group-focus-within:text-primary" />
                <input
                  type="search"
                  placeholder="Search students, courses, requests…"
                  className="w-full rounded-xl border border-input bg-card py-2 pl-9 pr-3 text-sm shadow-soft outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
                <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline">⌘K</kbd>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <IconButton><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" /></IconButton>
              <IconButton><Settings className="h-4 w-4" /></IconButton>
              <div className="ml-2 hidden h-9 items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">AR</div>
                <span className="text-sm font-medium">Ana Reyes</span>
              </div>
            </div>
          </div>

          <div className="flex items-end justify-between gap-4 px-4 pb-5 pt-1 sm:px-6 lg:px-8">
            <div>
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span>Registrar</span>
                <ChevronRight className="h-3 w-3" />
                <span className="text-foreground">{meta.title}</span>
              </div>
              <motion.h1
                key={meta.title}
                initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}
                className="mt-1 font-display text-2xl font-semibold tracking-tight sm:text-3xl"
              >
                {meta.title}
              </motion.h1>
              <p className="text-sm text-muted-foreground">{meta.sub}</p>
            </div>
          </div>
        </header>

        <AnimatePresence mode="wait">
          <motion.main
            key={pathname}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.25, ease: "easeOut" }}
            className="px-4 pb-12 sm:px-6 lg:px-8"
          >
            {children}
          </motion.main>
        </AnimatePresence>
      </div>
    </div>
  );
}

function BrandHeader() {
  return (
    <div className="flex h-16 items-center gap-2.5 border-b border-sidebar-border px-5">
      <motion.div
        initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="flex h-9 w-9 items-center justify-center rounded-xl bg-gradient-primary shadow-elegant"
      >
        <GraduationCap className="h-5 w-5 text-primary-foreground" />
      </motion.div>
      <div>
        <div className="font-display text-base font-semibold tracking-tight">Scholaris</div>
        <div className="-mt-0.5 text-[11px] text-sidebar-foreground/60">Registrar Portal</div>
      </div>
    </div>
  );
}

function NavLink({ item, active, index }: { item: (typeof navItems)[number]; active: boolean; index: number }) {
  const Icon = item.icon;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        to={item.to}
        className={cn(
          "group relative flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors",
          active ? "text-sidebar-primary-foreground" : "text-sidebar-foreground/70 hover:bg-sidebar-accent hover:text-sidebar-accent-foreground"
        )}
      >
        {active && (
          <motion.span
            layoutId="active-pill"
            className="absolute inset-0 -z-0 rounded-lg bg-gradient-primary shadow-elegant"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <Icon className="relative z-10 h-4 w-4" />
        <span className="relative z-10">{item.label}</span>
      </Link>
    </motion.div>
  );
}

function UserPanel() {
  return (
    <div className="border-t border-sidebar-border p-4">
      <div className="rounded-xl bg-sidebar-accent/60 p-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-gradient-primary text-sm font-semibold text-primary-foreground">AR</div>
          <div className="min-w-0">
            <div className="truncate text-sm font-medium">Ana Reyes</div>
            <div className="truncate text-[11px] text-sidebar-foreground/60">Senior Registrar</div>
          </div>
        </div>
      </div>
    </div>
  );
}

function IconButton({ children }: { children: ReactNode }) {
  return (
    <motion.button
      whileHover={{ scale: 1.06 }} whileTap={{ scale: 0.94 }}
      className="relative inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-card text-foreground hover:bg-accent"
    >
      {children}
    </motion.button>
  );
}
