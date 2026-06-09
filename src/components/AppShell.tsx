import { Link, useRouterState } from "@tanstack/react-router";
import { motion, AnimatePresence } from "framer-motion";
import {
  LayoutDashboard,
  Users,
  BookOpen,
  ClipboardList,
  BarChart3,
  UserPlus,
  FileSearch,
  UserRound,
  FolderCheck,
  Network,
  FileBadge,
  Settings2,
  ClipboardCheck,
  FileText,
  ArrowLeftRight,
  TrendingUp,
  Award,
  Activity,
  Landmark,
  QrCode,
  Upload,
  MessageSquare,
  Search,
  Bell,
  Settings,
  GraduationCap,
  ChevronRight,
  LogIn,
  Wallet,
} from "lucide-react";
import { useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";
import { useDemoUser } from "@/lib/demo-auth";
import { getRegistrarModuleById, getRegistrarModuleByPath, registrarModules, type RegistrarModule } from "@/lib/registrar-modules";

const moduleIcons: Record<string, typeof LayoutDashboard> = {
  dashboard: LayoutDashboard,
  "finance-dashboard": Wallet,
  "student-registration": UserPlus,
  "online-registration-review": FileSearch,
  "enrollment-management": ClipboardList,
  "student-masterlist": Users,
  "learner-profile": UserRound,
  "sections-class-assignment": Network,
  "academic-records": BookOpen,
  "documents-management": FolderCheck,
  "document-requests": FileBadge,
  "transfers-management": ArrowLeftRight,
  "promotion-retention": TrendingUp,
  "graduation-completion": Award,
  "learner-movement": Activity,
  "deped-compliance-forms": Landmark,
  "id-qr-management": QrCode,
  "reports-analytics": BarChart3,
  "import-export": Upload,
  "notifications-messaging": MessageSquare,
  "registrar-settings": Settings2,
};

const titles: Record<string, { title: string; sub: string }> = {
  "/": { title: "Overview", sub: "Welcome back" },
  "/students": { title: "Student Records", sub: "Manage every enrolled student" },
  "/registration": { title: "Registration", sub: "Learner application capture" },
  "/academic-levels": { title: "Academic Levels", sub: "DEPED-aligned academic level structure" },
  "/enrollment": { title: "Enrollment", sub: "Applications and pipeline" },
  "/finance": { title: "Finance Dashboard", sub: "Revenue, billing, and budget" },
  "/reports": { title: "Reports", sub: "Insights across the institution" },
};

export function AppShell({ children }: { children: ReactNode }) {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  const moduleMeta = getModuleMeta(pathname);
  const meta = moduleMeta ?? titles[pathname] ?? { title: "Scholaris", sub: "" };
  const [mobileOpen, setMobileOpen] = useState(false);
  const user = useDemoUser();
  const hidePageIntro = pathname === "/registrar/learner-profile";

  return (
    <div className="min-h-screen bg-gradient-subtle">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-72 flex-col border-r border-[#d7e0ee] bg-[#f7f9fc] text-[#101827] shadow-[10px_0_36px_-28px_rgba(15,23,42,0.45)] lg:flex">
        <BrandHeader role={user.role} />
        <nav className="flex-1 overflow-y-auto px-4 py-5">
          <NavGroup label="MVP Modules" modules={registrarModules.filter((module) => module.group === "MVP")} pathname={pathname} />
          <NavGroup label="Production Add-ons" modules={registrarModules.filter((module) => module.group === "Add-on")} pathname={pathname} offset={10} />
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
              className="fixed inset-y-0 left-0 z-50 flex w-72 max-w-[86vw] flex-col border-r border-[#d7e0ee] bg-[#f7f9fc] text-[#101827] shadow-2xl lg:hidden"
            >
              <BrandHeader role={user.role} />
              <nav className="flex-1 overflow-y-auto px-4 py-5" onClick={() => setMobileOpen(false)}>
                <NavGroup label="MVP Modules" modules={registrarModules.filter((module) => module.group === "MVP")} pathname={pathname} />
                <NavGroup label="Production Add-ons" modules={registrarModules.filter((module) => module.group === "Add-on")} pathname={pathname} offset={10} />
              </nav>
              <UserPanel />
            </motion.aside>
          </>
        )}
      </AnimatePresence>

      {/* Main */}
      <div className="lg:pl-72">
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
                  placeholder="Search learners, documents, requests..."
                  className="w-full rounded-xl border border-input bg-card py-2 pl-9 pr-3 text-sm shadow-soft outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
                <kbd className="absolute right-3 top-1/2 hidden -translate-y-1/2 rounded border border-border bg-muted px-1.5 py-0.5 text-[10px] font-medium text-muted-foreground md:inline">⌘K</kbd>
              </div>
            </div>

            <div className="ml-auto flex items-center gap-2">
              <IconButton><Bell className="h-4 w-4" /><span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-destructive ring-2 ring-background" /></IconButton>
              <IconButton><Settings className="h-4 w-4" /></IconButton>
              <Link
                to="/login"
                className="hidden items-center gap-1.5 rounded-full border border-border bg-card px-3 py-2 text-xs font-medium shadow-soft hover:bg-accent sm:inline-flex"
              >
                <LogIn className="h-3.5 w-3.5" />
                Switch role
              </Link>
              <div className="ml-2 hidden h-9 items-center gap-2 rounded-full border border-border bg-card pl-1 pr-3 sm:flex">
                <div className="flex h-7 w-7 items-center justify-center rounded-full bg-gradient-primary text-xs font-semibold text-primary-foreground">{user.initials}</div>
                <span className="text-sm font-medium">{user.name}</span>
              </div>
            </div>
          </div>

          {!hidePageIntro && (
            <div className="flex items-end justify-between gap-4 px-4 pb-5 pt-1 sm:px-6 lg:px-8">
              <div>
                <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                  <span>{user.role}</span>
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
                <p className="text-sm text-muted-foreground">{meta.sub === "Welcome back" ? `Welcome back, ${user.name}` : meta.sub}</p>
              </div>
            </div>
          )}
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

function BrandHeader({ role }: { role: string }) {
  return (
    <div className="border-b border-[#d7e0ee] bg-white/80 px-4 py-4 backdrop-blur">
      <div className="flex items-center gap-3 rounded-2xl border border-[#d7e0ee] bg-white px-3 py-3 shadow-soft">
      <motion.div
        initial={{ rotate: -10, scale: 0.8 }} animate={{ rotate: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 200, damping: 12 }}
        className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#101827] shadow-[0_12px_24px_-14px_rgba(15,23,42,0.75)]"
      >
        <GraduationCap className="h-5 w-5 text-[#f5c84b]" />
      </motion.div>
        <div className="min-w-0">
          <div className="font-display text-base font-semibold tracking-tight text-[#101827]">Scholaris</div>
          <div className="-mt-0.5 text-[11px] font-medium text-[#64748b]">{role} Portal</div>
        </div>
      </div>
    </div>
  );
}

function NavGroup({ label, modules, pathname, offset = 0 }: { label: string; modules: RegistrarModule[]; pathname: string; offset?: number }) {
  return (
    <div className="mb-5">
      <div className="mb-2 px-2 text-[10px] font-bold uppercase tracking-[0.2em] text-[#b45309]">{label}</div>
      <div className="space-y-1.5">
        {modules.map((module, i) => (
          <NavLink key={module.id} module={module} active={pathname === module.path} index={offset + i} />
        ))}
      </div>
    </div>
  );
}

function NavLink({ module, active, index }: { module: RegistrarModule; active: boolean; index: number }) {
  const Icon = moduleIcons[module.id] ?? FileText;
  return (
    <motion.div
      initial={{ opacity: 0, x: -8 }} animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.04 }}
    >
      <Link
        to={module.path}
        className={cn(
          "group relative flex items-center gap-3 overflow-hidden rounded-2xl border px-3 py-2.5 text-[13px] font-semibold transition-all",
          active
            ? "border-[#f0c96a] bg-[#fff8e1] text-[#101827] shadow-[0_14px_34px_-24px_rgba(180,83,9,0.65)]"
            : "border-transparent text-[#516070] hover:border-[#d7e0ee] hover:bg-white hover:text-[#101827] hover:shadow-soft"
        )}
      >
        {active && (
          <motion.span
            layoutId="active-pill"
            className="absolute left-0 top-1/2 z-0 h-9 w-1 -translate-y-1/2 rounded-r-full bg-[#f5c84b]"
            transition={{ type: "spring", stiffness: 300, damping: 30 }}
          />
        )}
        <span
          className={cn(
            "relative z-10 flex h-8 w-8 shrink-0 items-center justify-center rounded-xl transition-colors",
            active ? "bg-[#101827] text-[#f5c84b]" : "bg-white text-[#64748b] ring-1 ring-[#d7e0ee] group-hover:text-[#101827]"
          )}
        >
          <Icon className="h-4 w-4" />
        </span>
        <span className="relative z-10 min-w-0 flex-1 truncate">{module.label}</span>
        {module.status === "Blueprint" && (
          <span className={cn("relative z-10 rounded-full px-1.5 py-0.5 text-[9px] font-bold", active ? "bg-white text-[#b45309]" : "bg-[#e9eef6] text-[#64748b]")}>
            Plan
          </span>
        )}
      </Link>
    </motion.div>
  );
}

function getModuleMeta(pathname: string) {
  const direct = getRegistrarModuleByPath(pathname);
  if (direct) return { title: direct.label, sub: direct.purpose };

  if (pathname.startsWith("/registrar/")) {
    const id = pathname.split("/").pop() ?? "";
    const module = getRegistrarModuleById(id);
    if (module) return { title: module.label, sub: module.purpose };
  }

  return null;
}

function UserPanel() {
  const user = useDemoUser();

  return (
    <div className="border-t border-[#d7e0ee] bg-white/60 p-4">
      <div className="rounded-2xl border border-[#d7e0ee] bg-white p-3 shadow-soft">
        <div className="flex items-center gap-2.5">
          <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#3658df] text-sm font-semibold text-white shadow-[0_12px_24px_-14px_rgba(54,88,223,0.8)]">{user.initials}</div>
          <div className="min-w-0">
            <div className="truncate text-sm font-semibold text-[#101827]">{user.name}</div>
            <div className="truncate text-[11px] font-medium text-[#64748b]">{user.role}</div>
          </div>
        </div>
        <Link
          to="/login"
          className="mt-3 inline-flex w-full items-center justify-center rounded-xl border border-[#d7e0ee] bg-[#f8fafc] px-3 py-2 text-xs font-semibold text-[#101827] transition-colors hover:border-[#f0c96a] hover:bg-[#fff8e1]"
        >
          Quick login
        </Link>
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
