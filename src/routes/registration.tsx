import { createFileRoute, Link } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { motion } from "framer-motion";
import {
  ArrowRight,
  BadgeCheck,
  Calculator,
  CheckCircle2,
  FileCheck2,
  GraduationCap,
  Loader2,
  UserRound,
  UsersRound,
  type LucideIcon,
} from "lucide-react";
import { useEffect, useMemo, useState, type FormEvent, type ReactNode } from "react";

import { createRegistration, getAcademicYears } from "@/lib/api/sms.functions";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registration")({
  head: () => ({ meta: [{ title: "Registrar Registration - Scholaris" }] }),
  component: RegistrationPage,
});

const gradeLevels = [
  "KG1",
  "KG2",
  "Grade 1",
  "Grade 2",
  "Grade 3",
  "Grade 4",
  "Grade 5",
  "Grade 6",
  "Grade 7",
  "Grade 8",
  "Grade 9",
  "Grade 10",
  "Grade 11",
  "Grade 12",
];

const documents = [
  "Birth certificate",
  "Passport copy",
  "Emirates ID",
  "Previous report card",
  "Transfer certificate",
  "Medical record",
];

const feePlans = [
  { id: "standard", label: "Standard campus plan", base: 18500, vatItems: 1450 },
  { id: "transport", label: "Standard + transport", base: 22200, vatItems: 2450 },
  { id: "senior", label: "Senior high STEM plan", base: 26500, vatItems: 2100 },
];

type RegistrationForm = {
  learnerFirstName: string;
  learnerLastName: string;
  dateOfBirth: string;
  gender: string;
  grade: string;
  academicYear: string;
  previousSchool: string;
  guardianName: string;
  guardianEmail: string;
  guardianPhone: string;
  emiratesId: string;
  nationality: string;
  address: string;
  feePlan: string;
  documents: string[];
  notes: string;
};

const initialForm: RegistrationForm = {
  learnerFirstName: "",
  learnerLastName: "",
  dateOfBirth: "",
  gender: "",
  grade: "Grade 1",
  academicYear: "2026-2027",
  previousSchool: "",
  guardianName: "",
  guardianEmail: "",
  guardianPhone: "",
  emiratesId: "",
  nationality: "",
  address: "",
  feePlan: "standard",
  documents: ["Birth certificate", "Passport copy"],
  notes: "",
};

function RegistrationPage() {
  const queryClient = useQueryClient();
  const [form, setForm] = useState<RegistrationForm>(initialForm);
  const [createdName, setCreatedName] = useState("");
  const { data: academicYearsData } = useQuery({
    queryKey: ["academic-years"],
    queryFn: () => getAcademicYears(),
  });

  const registrationYears = useMemo(() => {
    const years = academicYearsData?.years ?? [];
    return years.filter((year) => year.enrollmentStatus === "open" && year.status !== "closed" && year.status !== "archived");
  }, [academicYearsData?.years]);

  useEffect(() => {
    const preferred = academicYearsData?.activeYear ?? registrationYears[0];
    if (preferred && form.academicYear !== preferred.name) {
      setForm((current) => ({ ...current, academicYear: preferred.name }));
    }
  }, [academicYearsData?.activeYear, registrationYears, form.academicYear]);

  const selectedPlan = feePlans.find((plan) => plan.id === form.feePlan) ?? feePlans[0];
  const vat = selectedPlan.vatItems * 0.05;
  const total = selectedPlan.base + selectedPlan.vatItems + vat;

  const registration = useMutation({
    mutationFn: () => createRegistration({ data: form }),
    onSuccess: (application) => {
      setCreatedName(application.name);
      setForm({ ...initialForm, academicYear: academicYearsData?.activeYear?.name ?? initialForm.academicYear });
      queryClient.invalidateQueries({ queryKey: ["enrollment-applications"] });
      queryClient.invalidateQueries({ queryKey: ["dashboard-overview"] });
    },
  });

  const update = (field: keyof RegistrationForm, value: string) => {
    setForm((current) => ({ ...current, [field]: value }));
  };

  const toggleDocument = (document: string) => {
    setForm((current) => ({
      ...current,
      documents: current.documents.includes(document)
        ? current.documents.filter((item) => item !== document)
        : [...current.documents, document],
    }));
  };

  const submit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setCreatedName("");
    registration.mutate();
  };

  return (
    <form onSubmit={submit} className="space-y-5">
      {createdName && (
        <motion.div
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-success/25 bg-success/10 px-4 py-3 text-sm"
        >
          <span className="inline-flex items-center gap-2 font-medium text-success-foreground">
            <CheckCircle2 className="h-4 w-4" />
            {createdName} was added to New Applications.
          </span>
          <Link to="/enrollment" className="inline-flex items-center gap-1 text-xs font-semibold text-primary">
            View pipeline <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </motion.div>
      )}

      <div className="grid gap-5 xl:grid-cols-[1fr_22rem]">
        <div className="space-y-5">
          <Section icon={UserRound} title="Learner profile" subtitle="Identity and school placement details.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="First name" required>
                <input value={form.learnerFirstName} onChange={(event) => update("learnerFirstName", event.target.value)} required className={inputClass} placeholder="Maria" />
              </Field>
              <Field label="Last name" required>
                <input value={form.learnerLastName} onChange={(event) => update("learnerLastName", event.target.value)} required className={inputClass} placeholder="Santos" />
              </Field>
              <Field label="Date of birth" required>
                <input value={form.dateOfBirth} onChange={(event) => update("dateOfBirth", event.target.value)} required type="date" className={inputClass} />
              </Field>
              <Field label="Gender" required>
                <select value={form.gender} onChange={(event) => update("gender", event.target.value)} required className={inputClass}>
                  <option value="">Select gender</option>
                  <option>Female</option>
                  <option>Male</option>
                  <option>Prefer not to say</option>
                </select>
              </Field>
              <Field label="Nationality">
                <input value={form.nationality} onChange={(event) => update("nationality", event.target.value)} className={inputClass} placeholder="Filipino" />
              </Field>
              <Field label="Emirates ID">
                <input value={form.emiratesId} onChange={(event) => update("emiratesId", event.target.value)} className={inputClass} placeholder="784-0000-0000000-0" />
              </Field>
            </div>
          </Section>

          <Section icon={GraduationCap} title="Academic placement" subtitle="Grade level, school year, and prior school data.">
            <div className="grid gap-4 sm:grid-cols-3">
              <Field label="Grade level" required>
                <select value={form.grade} onChange={(event) => update("grade", event.target.value)} required className={inputClass}>
                  {gradeLevels.map((grade) => <option key={grade}>{grade}</option>)}
                </select>
              </Field>
              <Field label="Academic year" required>
                <select value={form.academicYear} onChange={(event) => update("academicYear", event.target.value)} required className={inputClass}>
                  {(registrationYears.length ? registrationYears : academicYearsData?.years ?? []).map((year) => (
                    <option key={year.id} value={year.name}>{year.name}</option>
                  ))}
                </select>
              </Field>
              <Field label="Fee plan" required>
                <select value={form.feePlan} onChange={(event) => update("feePlan", event.target.value)} required className={inputClass}>
                  {feePlans.map((plan) => <option key={plan.id} value={plan.id}>{plan.label}</option>)}
                </select>
              </Field>
              <Field label="Previous school">
                <input value={form.previousSchool} onChange={(event) => update("previousSchool", event.target.value)} className={cn(inputClass, "sm:col-span-2")} placeholder="Previous campus or nursery" />
              </Field>
            </div>
          </Section>

          <Section icon={UsersRound} title="Guardian contact" subtitle="Primary responsible adult and household contact.">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Guardian name" required>
                <input value={form.guardianName} onChange={(event) => update("guardianName", event.target.value)} required className={inputClass} placeholder="Ana Santos" />
              </Field>
              <Field label="Mobile number" required>
                <input value={form.guardianPhone} onChange={(event) => update("guardianPhone", event.target.value)} required className={inputClass} placeholder="+971 50 000 0000" />
              </Field>
              <Field label="Email address" required>
                <input value={form.guardianEmail} onChange={(event) => update("guardianEmail", event.target.value)} required type="email" className={inputClass} placeholder="guardian@example.com" />
              </Field>
              <Field label="Home address">
                <input value={form.address} onChange={(event) => update("address", event.target.value)} className={inputClass} placeholder="Dubai, UAE" />
              </Field>
            </div>
          </Section>

          <Section icon={FileCheck2} title="Documents and notes" subtitle="Track files received during registrar intake.">
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {documents.map((document) => {
                const checked = form.documents.includes(document);
                return (
                  <button
                    key={document}
                    type="button"
                    onClick={() => toggleDocument(document)}
                    className={cn(
                      "flex min-h-12 items-center gap-2 rounded-xl border px-3 py-2 text-left text-sm transition-colors",
                      checked ? "border-primary/40 bg-primary/10 text-primary" : "border-border bg-background hover:bg-accent",
                    )}
                  >
                    <span className={cn("flex h-5 w-5 items-center justify-center rounded-full border", checked ? "border-primary bg-primary text-primary-foreground" : "border-border")}>
                      {checked && <CheckCircle2 className="h-3.5 w-3.5" />}
                    </span>
                    {document}
                  </button>
                );
              })}
            </div>
            <Field label="Registrar notes">
              <textarea value={form.notes} onChange={(event) => update("notes", event.target.value)} className={cn(inputClass, "min-h-24 resize-y")} placeholder="Interview notes, sibling links, document gaps, or registrar follow-up." />
            </Field>
          </Section>
        </div>

        <aside className="space-y-5">
          <div className="sticky top-24 rounded-2xl border border-border bg-card p-5 shadow-soft">
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground">
                <Calculator className="h-5 w-5" />
              </div>
              <div>
                <h3 className="font-display text-lg font-semibold">Fee preview</h3>
                <p className="text-xs text-muted-foreground">5% VAT on taxable items</p>
              </div>
            </div>

            <div className="mt-5 space-y-3 text-sm">
              <FeeRow label="Tuition and core fees" value={selectedPlan.base} />
              <FeeRow label="Taxable services/items" value={selectedPlan.vatItems} />
              <FeeRow label="VAT at 5%" value={vat} tone="accent" />
              <div className="border-t border-border pt-3">
                <FeeRow label="Estimated total" value={total} tone="strong" />
              </div>
            </div>

            <button
              type="submit"
              disabled={registration.isPending}
              className="mt-5 inline-flex w-full items-center justify-center gap-2 rounded-xl bg-gradient-primary px-4 py-3 text-sm font-semibold text-primary-foreground shadow-elegant transition-transform hover:-translate-y-0.5 disabled:cursor-not-allowed disabled:opacity-70 disabled:hover:translate-y-0"
            >
              {registration.isPending ? <Loader2 className="h-4 w-4 animate-spin" /> : <BadgeCheck className="h-4 w-4" />}
              Submit registration
            </button>

            {registration.isError && (
              <p className="mt-3 rounded-lg border border-destructive/20 bg-destructive/10 p-3 text-xs text-destructive">
                Registration could not be saved. Check the required fields and try again.
              </p>
            )}
          </div>
        </aside>
      </div>
    </form>
  );
}

const inputClass = "h-10 w-full rounded-xl border border-input bg-background px-3 text-sm shadow-soft outline-none transition-all placeholder:text-muted-foreground focus:border-primary focus:ring-2 focus:ring-ring/30";

function Section({
  icon: Icon,
  title,
  subtitle,
  children,
}: {
  icon: LucideIcon;
  title: string;
  subtitle: string;
  children: ReactNode;
}) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-2xl border border-border bg-card p-5 shadow-soft"
    >
      <div className="mb-5 flex items-start gap-3">
        <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-secondary text-secondary-foreground">
          <Icon className="h-5 w-5" />
        </div>
        <div>
          <h3 className="font-display text-lg font-semibold">{title}</h3>
          <p className="text-sm text-muted-foreground">{subtitle}</p>
        </div>
      </div>
      <div className="space-y-4">{children}</div>
    </motion.section>
  );
}

function Field({ label, required, children }: { label: string; required?: boolean; children: ReactNode }) {
  return (
    <label className="block space-y-1.5 text-sm">
      <span className="font-medium">
        {label}
        {required && <span className="text-destructive"> *</span>}
      </span>
      {children}
    </label>
  );
}

function FeeRow({ label, value, tone }: { label: string; value: number; tone?: "accent" | "strong" }) {
  return (
    <div className={cn("flex items-center justify-between gap-3", tone === "strong" && "font-semibold", tone === "accent" && "text-primary")}>
      <span>{label}</span>
      <span>{formatCurrency(value)}</span>
    </div>
  );
}

function formatCurrency(value: number) {
  return `AED ${value.toLocaleString("en-AE", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}
