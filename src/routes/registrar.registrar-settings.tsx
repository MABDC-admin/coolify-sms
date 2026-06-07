import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  BadgeCheck,
  CalendarClock,
  CalendarDays,
  CheckCircle2,
  CirclePause,
  LockKeyhole,
  Plus,
  RefreshCw,
  School,
  ShieldCheck,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import { createAcademicYear, getAcademicYears, setActiveAcademicYear, updateAcademicYear } from "@/lib/api/sms.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registrar/registrar-settings")({
  head: () => ({ meta: [{ title: "Registrar Settings - Scholaris" }] }),
  component: RegistrarSettingsPage,
});

function RegistrarSettingsPage() {
  const queryClient = useQueryClient();
  const [startYear, setStartYear] = useState(new Date().getFullYear() + 1);
  const [message, setMessage] = useState("");

  const { data, isLoading } = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => getAcademicYears(),
  });

  const years = data?.years ?? [];
  const activeYear = data?.activeYear ?? null;
  const termsForActive = useMemo(
    () => data?.terms.filter((term) => term.academicYearId === activeYear?.id) ?? [],
    [activeYear?.id, data?.terms],
  );
  const openYears = years.filter((year) => year.enrollmentStatus === "open").length;
  const setupYears = years.filter((year) => year.status === "setup").length;

  const invalidate = () => queryClient.invalidateQueries({ queryKey: ["academic-years"] });

  const createYearMutation = useMutation({
    mutationFn: () => createAcademicYear({ data: { startYear, notes: "Created from Registrar Settings." } }),
    onSuccess: async (year) => {
      setMessage(`${year.name} created for rollover planning.`);
      setStartYear((current) => current + 1);
      await invalidate();
    },
  });

  const setActiveMutation = useMutation({
    mutationFn: (id: string) => setActiveAcademicYear({ data: { id } }),
    onSuccess: async (year) => {
      setMessage(year ? `${year.name} is now the active academic year.` : "Academic year was not found.");
      await invalidate();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Unable to activate academic year."),
  });

  const updateYearMutation = useMutation({
    mutationFn: ({ id, enrollmentStatus, status }: { id: string; enrollmentStatus?: "open" | "paused" | "closed"; status?: "setup" | "active" | "closed" | "archived" }) =>
      updateAcademicYear({ data: { id, enrollmentStatus, status } }),
    onSuccess: async (year) => {
      setMessage(year ? `${year.name} updated.` : "Academic year was not found.");
      await invalidate();
    },
  });

  return (
    <div className="relative -mx-4 overflow-hidden px-4 pb-10 pt-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="pointer-events-none absolute inset-0 -z-10 bg-[linear-gradient(135deg,#f8fbff_0%,#fff8e7_48%,#f4fbf8_100%)]" />
      <div className="space-y-5">
        <section className="overflow-hidden rounded-[2rem] bg-[#101827] text-white shadow-[0_32px_90px_-48px_rgba(15,23,42,0.95)]">
          <div className="relative grid gap-6 p-6 xl:grid-cols-[minmax(0,1fr)_22rem]">
            <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_18%_12%,rgba(246,198,91,0.26),transparent_26rem),linear-gradient(120deg,rgba(15,118,110,0.2),transparent_46%)]" />
            <div className="relative">
              <div className="inline-flex items-center gap-2 rounded-full border border-[#f6c65b]/35 bg-[#f6c65b]/12 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-[#f6c65b]">
                <School className="h-3.5 w-3.5" />
                Registrar setup
              </div>
              <h2 className="mt-4 font-display text-3xl font-semibold tracking-tight sm:text-4xl">Academic Years</h2>
              <p className="mt-3 max-w-3xl text-sm leading-6 text-white/70">
                Control the active school year, registration intake window, academic terms, and rollover readiness from one registrar configuration page.
              </p>
              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <HeroMetric icon={BadgeCheck} label="Active Year" value={activeYear?.name ?? "None"} />
                <HeroMetric icon={CalendarClock} label="Open Intake" value={String(openYears)} />
                <HeroMetric icon={RefreshCw} label="Setup Years" value={String(setupYears)} />
              </div>
            </div>
            <div className="relative rounded-[1.5rem] border border-white/12 bg-white/10 p-4 backdrop-blur">
              <div className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/50">Create next year</div>
              <div className="mt-3 flex gap-2">
                <input
                  type="number"
                  min={2000}
                  max={2200}
                  value={startYear}
                  onChange={(event) => setStartYear(Number(event.target.value))}
                  className="h-11 min-w-0 flex-1 rounded-2xl border border-white/10 bg-white/[0.08] px-3 text-sm text-white outline-none focus:ring-4 focus:ring-white/10"
                />
                <button
                  type="button"
                  disabled={createYearMutation.isPending}
                  onClick={() => createYearMutation.mutate()}
                  className="inline-flex h-11 items-center justify-center gap-2 rounded-2xl bg-[#f6c65b] px-4 text-sm font-semibold text-[#101827] disabled:cursor-not-allowed disabled:opacity-60"
                >
                  <Plus className="h-4 w-4" />
                  Add
                </button>
              </div>
              <p className="mt-3 text-xs leading-5 text-white/58">
                Start year creates a full label such as 2027-2028 with default UAE-style school dates.
              </p>
            </div>
          </div>
        </section>

        {message && (
          <div className="rounded-[1.15rem] border border-[#d8b45f]/30 bg-[#fff7df] px-4 py-3 text-sm font-semibold text-[#785a13]">
            {message}
          </div>
        )}

        <section className="grid gap-5 xl:grid-cols-[minmax(0,1fr)_22rem]">
          <div className="rounded-[1.6rem] border border-[#1f2937]/10 bg-white/86 p-5 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.48)] backdrop-blur">
            <div className="flex items-center justify-between gap-3">
              <SectionTitle icon={CalendarDays} title="Academic Year Registry" />
              {isLoading && <span className="text-xs font-semibold text-[#667085]">Loading...</span>}
            </div>
            <div className="mt-4 overflow-hidden rounded-[1.2rem] border border-[#1f2937]/10">
              <div className="grid grid-cols-[1.1fr_1fr_0.8fr_0.8fr_1.1fr] bg-[#101827] px-4 py-3 text-xs font-semibold uppercase tracking-[0.14em] text-[#f6c65b]">
                <span>Year</span>
                <span>Dates</span>
                <span>Status</span>
                <span>Intake</span>
                <span>Actions</span>
              </div>
              <div className="divide-y divide-[#1f2937]/10 bg-[#fffdf8]">
                {years.map((year) => (
                  <motion.div
                    key={year.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="grid grid-cols-[1.1fr_1fr_0.8fr_0.8fr_1.1fr] items-center gap-3 px-4 py-3 text-sm"
                  >
                    <div>
                      <div className="font-semibold text-[#172033]">{year.name}</div>
                      {year.isActive && <div className="mt-1 inline-flex items-center gap-1 text-xs font-semibold text-[#067647]"><CheckCircle2 className="h-3.5 w-3.5" /> Active</div>}
                    </div>
                    <div className="text-xs font-medium text-[#667085]">{formatDate(year.startDate)} - {formatDate(year.endDate)}</div>
                    <StatusPill value={year.status} />
                    <StatusPill value={year.enrollmentStatus} />
                    <div className="flex flex-wrap gap-2">
                      <button
                        type="button"
                        disabled={year.isActive || year.status === "closed" || setActiveMutation.isPending}
                        onClick={() => setActiveMutation.mutate(year.id)}
                        className="rounded-full bg-[#101827] px-3 py-1.5 text-xs font-semibold text-[#f6c65b] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Set Active
                      </button>
                      <button
                        type="button"
                        disabled={year.status === "closed" || year.status === "archived" || updateYearMutation.isPending}
                        onClick={() => updateYearMutation.mutate({ id: year.id, enrollmentStatus: year.enrollmentStatus === "open" ? "paused" : "open" })}
                        className="rounded-full border border-[#1f2937]/10 bg-white px-3 py-1.5 text-xs font-semibold text-[#172033] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        {year.enrollmentStatus === "open" ? "Pause" : "Open"}
                      </button>
                      <button
                        type="button"
                        disabled={year.isActive || year.status === "closed" || updateYearMutation.isPending}
                        onClick={() => updateYearMutation.mutate({ id: year.id, status: "closed", enrollmentStatus: "closed" })}
                        className="rounded-full border border-[#fee2e2] bg-[#fff1f2] px-3 py-1.5 text-xs font-semibold text-[#991b1b] disabled:cursor-not-allowed disabled:opacity-45"
                      >
                        Close
                      </button>
                    </div>
                  </motion.div>
                ))}
              </div>
            </div>
          </div>

          <aside className="space-y-5">
            <Panel icon={ShieldCheck} title="Active Year Rules">
              <Rule icon={CheckCircle2} label="Only one active academic year can exist." />
              <Rule icon={CalendarClock} label="Registration uses the active open year by default." />
              <Rule icon={LockKeyhole} label="Closed years stay historical and cannot be reactivated." />
              <Rule icon={CirclePause} label="Intake can be opened or paused without changing the active year." />
            </Panel>

            <Panel icon={CalendarDays} title="Terms">
              <div className="space-y-2">
                {termsForActive.map((term) => (
                  <div key={term.id} className="rounded-2xl border border-[#1f2937]/10 bg-[#fffdf8] p-3">
                    <div className="flex items-center justify-between gap-3">
                      <div className="text-sm font-semibold text-[#172033]">{term.name}</div>
                      <span className="text-xs font-semibold text-[#8a7a5c]">{term.status}</span>
                    </div>
                    <div className="mt-1 text-xs text-[#667085]">{formatDate(term.startDate)} - {formatDate(term.endDate)}</div>
                  </div>
                ))}
                {termsForActive.length === 0 && <div className="rounded-2xl border border-dashed border-[#1f2937]/15 p-4 text-sm text-[#667085]">No terms configured for the active year.</div>}
              </div>
            </Panel>
          </aside>
        </section>
      </div>
    </div>
  );
}

function HeroMetric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-white/12 bg-white/10 p-4 backdrop-blur">
      <Icon className="h-5 w-5 text-[#f6c65b]" />
      <div className="mt-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/50">{label}</div>
      <div className="mt-1 font-display text-xl font-semibold">{value}</div>
    </div>
  );
}

function SectionTitle({ icon: Icon, title }: { icon: LucideIcon; title: string }) {
  return (
    <div className="flex items-center gap-2">
      <div className="flex h-10 w-10 items-center justify-center rounded-2xl bg-[#fff7df] text-[#b45309]">
        <Icon className="h-5 w-5" />
      </div>
      <h3 className="font-display text-xl font-semibold text-[#172033]">{title}</h3>
    </div>
  );
}

function Panel({ icon: Icon, title, children }: { icon: LucideIcon; title: string; children: ReactNode }) {
  return (
    <div className="rounded-[1.5rem] border border-[#1f2937]/10 bg-white/86 p-5 shadow-[0_24px_70px_-52px_rgba(15,23,42,0.48)] backdrop-blur">
      <SectionTitle icon={Icon} title={title} />
      <div className="mt-4">{children}</div>
    </div>
  );
}

function Rule({ icon: Icon, label }: { icon: LucideIcon; label: string }) {
  return (
    <div className="mb-2 flex items-start gap-2 rounded-2xl border border-[#1f2937]/10 bg-[#fffdf8] p-3 text-sm text-[#344054] last:mb-0">
      <Icon className="mt-0.5 h-4 w-4 shrink-0 text-[#b45309]" />
      {label}
    </div>
  );
}

function StatusPill({ value }: { value: string }) {
  const styles: Record<string, string> = {
    active: "bg-[#dcfce7] text-[#166534]",
    open: "bg-[#dcfce7] text-[#166534]",
    setup: "bg-[#e0f2fe] text-[#075985]",
    paused: "bg-[#fff7df] text-[#92400e]",
    closed: "bg-[#fee2e2] text-[#991b1b]",
    archived: "bg-[#f1f5f9] text-[#475569]",
  };
  return <span className={cn("inline-flex w-fit rounded-full px-2.5 py-1 text-xs font-semibold capitalize", styles[value] ?? styles.archived)}>{value}</span>;
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(`${value}T00:00:00`));
}
