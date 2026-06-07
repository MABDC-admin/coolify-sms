import { createFileRoute } from "@tanstack/react-router";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  Edit3,
  GraduationCap,
  Loader2,
  Plus,
  Search,
  Trash2,
  UserMinus,
  UserPlus,
  Users,
  X,
  type LucideIcon,
} from "lucide-react";
import { useMemo, useState, type ReactNode } from "react";

import {
  archiveSection,
  assignLearner,
  createSection,
  getSectionAssignments,
  moveLearner,
  removeLearnerAssignment,
  updateSection,
} from "@/lib/api/sms.functions";
import type { RegistrarSection, SectionAssignment, SectionFormPayload, SectionsAssignmentData } from "@/lib/sms-data.server";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registrar/sections-class-assignment")({
  head: () => ({ meta: [{ title: "Sections & Class Assignment - Scholaris" }] }),
  component: SectionsClassAssignmentPage,
});

type SectionFormState = SectionFormPayload;

const emptySectionsData: SectionsAssignmentData = {
  sections: [],
  unassignedLearners: [],
  classSlots: [],
  gradeBands: [],
  history: [],
};

const gradeLevelOptions = ["KG1", "KG2", "Grade 1", "Grade 2", "Grade 3", "Grade 4", "Grade 5", "Grade 6", "Grade 7", "Grade 8", "Grade 9", "Grade 10", "Grade 11", "Grade 12"];
const clusterOptions: SectionFormState["cluster"][] = ["Preschool", "Elementary", "Junior High", "Senior High"];

const statusStyle: Record<RegistrarSection["status"], string> = {
  Open: "bg-[#dcfce7] text-[#166534]",
  "Near Capacity": "bg-[#fff7df] text-[#92400e]",
  Full: "bg-[#fee2e2] text-[#991b1b]",
  "Needs Adviser": "bg-[#e0f2fe] text-[#075985]",
};

function SectionsClassAssignmentPage() {
  const queryClient = useQueryClient();
  const [query, setQuery] = useState("");
  const [selectedId, setSelectedId] = useState("SEC-JH-7-MAT");
  const [editorOpen, setEditorOpen] = useState(false);
  const [editorMode, setEditorMode] = useState<"create" | "edit">("edit");
  const [sectionForm, setSectionForm] = useState<SectionFormState>(defaultSectionForm());
  const [assignmentForm, setAssignmentForm] = useState({ learnerName: "", learnerId: "", gender: "Female" as "Male" | "Female" });
  const [message, setMessage] = useState("");

  const { data = emptySectionsData, isLoading } = useQuery({
    queryKey: ["section-assignments"],
    queryFn: () => getSectionAssignments(),
  });

  const sections = data.sections;
  const selected = sections.find((section) => section.id === selectedId) ?? sections[0];
  const invalidateSections = () => queryClient.invalidateQueries({ queryKey: ["section-assignments"] });

  const filteredSections = useMemo(() => {
    const needle = query.trim().toLowerCase();
    if (!needle) return sections;
    return sections.filter((section) =>
      [section.name, section.academicLevel, section.adviser, section.room, section.cluster]
        .some((value) => value.toLowerCase().includes(needle)),
    );
  }, [query, sections]);

  const totalEnrolled = sections.reduce((sum, section) => sum + section.enrolled, 0);
  const totalCapacity = sections.reduce((sum, section) => sum + section.capacity, 0);
  const openSeats = Math.max(totalCapacity - totalEnrolled, 0);
  const unassignedCount = data.unassignedLearners.length;

  const createSectionMutation = useMutation({
    mutationFn: (payload: SectionFormPayload) => createSection({ data: payload }),
    onSuccess: async (section) => {
      if (section?.id) setSelectedId(section.id);
      setEditorOpen(false);
      setMessage("Section created.");
      await invalidateSections();
    },
  });

  const updateSectionMutation = useMutation({
    mutationFn: (payload: { id: string; section: SectionFormPayload }) => updateSection({ data: payload }),
    onSuccess: async () => {
      setEditorOpen(false);
      setMessage("Section updated.");
      await invalidateSections();
    },
  });

  const archiveSectionMutation = useMutation({
    mutationFn: (id: string) => archiveSection({ data: { id } }),
    onSuccess: async () => {
      setSelectedId("");
      setMessage("Section archived.");
      await invalidateSections();
    },
  });

  const assignLearnerMutation = useMutation({
    mutationFn: (payload: { sectionId: string; learnerName: string; learnerId?: string; gender: "Male" | "Female" }) => assignLearner({ data: payload }),
    onSuccess: async () => {
      setAssignmentForm({ learnerName: "", learnerId: "", gender: "Female" });
      setMessage("Learner assigned.");
      await invalidateSections();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Assignment failed."),
  });

  const moveLearnerMutation = useMutation({
    mutationFn: (payload: { assignmentId: string; toSectionId: string }) => moveLearner({ data: payload }),
    onSuccess: async () => {
      setMessage("Learner moved.");
      await invalidateSections();
    },
    onError: (error) => setMessage(error instanceof Error ? error.message : "Move failed."),
  });

  const removeLearnerMutation = useMutation({
    mutationFn: (assignmentId: string) => removeLearnerAssignment({ data: { assignmentId } }),
    onSuccess: async () => {
      setMessage("Learner removed.");
      await invalidateSections();
    },
  });

  const openCreate = () => {
    setEditorMode("create");
    setSectionForm(defaultSectionForm());
    setEditorOpen(true);
    setMessage("");
  };

  const openEdit = () => {
    if (!selected) return;
    setEditorMode("edit");
    setSectionForm(formFromSection(selected));
    setEditorOpen(true);
    setMessage("");
  };

  const saveSection = () => {
    const payload = normalizeSectionForm(sectionForm);
    if (editorMode === "edit" && selected?.id) {
      updateSectionMutation.mutate({ id: selected.id, section: payload });
      return;
    }
    createSectionMutation.mutate(payload);
  };

  const assignManualLearner = () => {
    if (!selected || !assignmentForm.learnerName.trim()) return;
    assignLearnerMutation.mutate({
      sectionId: selected.id,
      learnerName: assignmentForm.learnerName.trim(),
      learnerId: assignmentForm.learnerId.trim() || undefined,
      gender: assignmentForm.gender,
    });
  };

  const assignKnownLearner = (learner: SectionsAssignmentData["unassignedLearners"][number]) => {
    if (!selected) return;
    assignLearnerMutation.mutate({
      sectionId: selected.id,
      learnerName: learner.name,
      gender: learner.gender,
    });
  };

  return (
    <div className="-mx-4 bg-[#f7f9fc] px-4 pb-10 pt-3 sm:-mx-6 sm:px-6 lg:-mx-8 lg:px-8">
      <div className="mx-auto max-w-[1400px] space-y-5">
        <section className="rounded-3xl border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_55px_-44px_rgba(15,23,42,0.55)]">
          <div className="flex flex-wrap items-start justify-between gap-4">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.18em] text-[#b45309]">Registrar</p>
              <h1 className="mt-1 font-display text-3xl font-semibold tracking-tight text-[#101827]">Sections & Class Assignment</h1>
              <p className="mt-2 max-w-3xl text-sm text-[#667085]">Simple class grouping: select a section, update its setup, and assign learners.</p>
            </div>
            <button
              type="button"
              onClick={openCreate}
              className="inline-flex items-center gap-2 rounded-2xl bg-[#101827] px-4 py-2.5 text-sm font-semibold text-[#f6c65b] transition-colors hover:bg-[#172033]"
            >
              <Plus className="h-4 w-4" />
              New Section
            </button>
          </div>

          <div className="mt-5 grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <Metric icon={GraduationCap} label="Sections" value={String(sections.length)} />
            <Metric icon={Users} label="Assigned Learners" value={String(totalEnrolled)} />
            <Metric icon={UserPlus} label="Open Seats" value={String(openSeats)} />
            <Metric icon={UserMinus} label="Unassigned" value={String(unassignedCount)} />
          </div>
        </section>

        {message && (
          <div className="rounded-2xl border border-[#d8b45f]/30 bg-[#fff7df] px-4 py-3 text-sm font-semibold text-[#785a13]">
            {message}
          </div>
        )}

        <section className="grid gap-5 xl:grid-cols-[20rem_minmax(0,1fr)]">
          <aside className="rounded-3xl border border-[#d9e2ef] bg-white p-4 shadow-[0_18px_55px_-44px_rgba(15,23,42,0.45)]">
            <div className="flex items-center justify-between gap-3">
              <h2 className="font-display text-lg font-semibold text-[#101827]">Sections</h2>
              {isLoading && <Loader2 className="h-4 w-4 animate-spin text-[#667085]" />}
            </div>

            <div className="relative mt-4">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#667085]" />
              <input
                value={query}
                onChange={(event) => setQuery(event.target.value)}
                placeholder="Search section"
                className="h-11 w-full rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] pl-10 pr-3 text-sm outline-none focus:border-[#b88b20] focus:ring-4 focus:ring-[#d8b45f]/20"
              />
            </div>

            <div className="mt-4 max-h-[34rem] space-y-2 overflow-y-auto pr-1">
              {filteredSections.map((section) => (
                <button
                  key={section.id}
                  type="button"
                  onClick={() => setSelectedId(section.id)}
                  className={cn(
                    "w-full rounded-2xl border p-3 text-left transition-all",
                    selected?.id === section.id
                      ? "border-[#d8b45f]/60 bg-[#fff7df]"
                      : "border-[#d9e2ef] bg-white hover:bg-[#f8fafc]",
                  )}
                >
                  <div className="flex items-start justify-between gap-3">
                    <div className="min-w-0">
                      <div className="truncate text-sm font-semibold text-[#101827]">{section.name}</div>
                      <div className="mt-0.5 text-xs text-[#667085]">{section.academicLevel} - {section.room}</div>
                    </div>
                    <StatusPill value={section.status} />
                  </div>
                  <CapacityLine enrolled={section.enrolled} capacity={section.capacity} />
                </button>
              ))}
              {filteredSections.length === 0 && (
                <div className="rounded-2xl border border-dashed border-[#d9e2ef] p-4 text-center text-sm text-[#667085]">No sections found.</div>
              )}
            </div>
          </aside>

          <main className="min-w-0">
            {selected ? (
              <div className="grid gap-5 2xl:grid-cols-[minmax(0,1fr)_21rem]">
                <div className="space-y-5">
                  <section className="rounded-3xl border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_55px_-44px_rgba(15,23,42,0.45)]">
                    <div className="flex flex-wrap items-start justify-between gap-4">
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <StatusPill value={selected.status} />
                          <span className="rounded-full bg-[#eef2f7] px-3 py-1 text-xs font-semibold text-[#475467]">{selected.cluster}</span>
                        </div>
                        <h2 className="mt-3 font-display text-2xl font-semibold text-[#101827]">{selected.name}</h2>
                        <p className="mt-1 text-sm text-[#667085]">{selected.academicLevel} - {selected.adviser} - {selected.room}</p>
                      </div>
                      <div className="flex flex-wrap gap-2">
                        <button type="button" onClick={openEdit} className="inline-flex items-center gap-2 rounded-2xl border border-[#d9e2ef] bg-white px-4 py-2 text-sm font-semibold text-[#101827] hover:bg-[#f8fafc]">
                          <Edit3 className="h-4 w-4" />
                          Edit
                        </button>
                        <button
                          type="button"
                          disabled={archiveSectionMutation.isPending}
                          onClick={() => archiveSectionMutation.mutate(selected.id)}
                          className="inline-flex items-center gap-2 rounded-2xl border border-[#fee2e2] bg-[#fff1f2] px-4 py-2 text-sm font-semibold text-[#991b1b] disabled:cursor-not-allowed disabled:opacity-60"
                        >
                          <Trash2 className="h-4 w-4" />
                          Archive
                        </button>
                      </div>
                    </div>

                    <div className="mt-5 grid gap-3 sm:grid-cols-4">
                      <Info label="Capacity" value={`${selected.enrolled}/${selected.capacity}`} />
                      <Info label="Schedule" value={selected.schedule} />
                      <Info label="Male" value={String(selected.male)} />
                      <Info label="Female" value={String(selected.female)} />
                    </div>

                    {selected.conflicts.length > 0 && (
                      <div className="mt-4 rounded-2xl border border-[#d8b45f]/35 bg-[#fff7df] p-3 text-sm font-medium text-[#785a13]">
                        {selected.conflicts.join(" ")}
                      </div>
                    )}
                  </section>

                  <section className="rounded-3xl border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_55px_-44px_rgba(15,23,42,0.45)]">
                    <div className="flex flex-wrap items-center justify-between gap-3">
                      <h2 className="font-display text-xl font-semibold text-[#101827]">Class List</h2>
                      <span className="text-sm font-semibold text-[#667085]">{selected.assignments.length} learners</span>
                    </div>

                    <div className="mt-4 overflow-hidden rounded-2xl border border-[#d9e2ef]">
                      <div className="grid grid-cols-[3rem_minmax(0,1fr)_8rem_11rem] bg-[#101827] px-4 py-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#f6c65b]">
                        <span>No.</span>
                        <span>Learner</span>
                        <span>Gender</span>
                        <span>Actions</span>
                      </div>
                      <div className="divide-y divide-[#d9e2ef] bg-white">
                        {selected.assignments.map((assignment, index) => (
                          <LearnerRow
                            key={assignment.id}
                            assignment={assignment}
                            index={index}
                            targetSectionId={sections.find((section) => section.id !== selected.id && section.status !== "Full")?.id}
                            onMove={(toSectionId) => moveLearnerMutation.mutate({ assignmentId: assignment.id, toSectionId })}
                            onRemove={() => removeLearnerMutation.mutate(assignment.id)}
                          />
                        ))}
                        {selected.assignments.length === 0 && (
                          <div className="p-5 text-center text-sm text-[#667085]">No learners assigned yet.</div>
                        )}
                      </div>
                    </div>
                  </section>
                </div>

                <aside className="space-y-5">
                  <AssignPanel
                    form={assignmentForm}
                    busy={assignLearnerMutation.isPending}
                    onChange={setAssignmentForm}
                    onAssign={assignManualLearner}
                  />

                  <section className="rounded-3xl border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_55px_-44px_rgba(15,23,42,0.45)]">
                    <h2 className="font-display text-lg font-semibold text-[#101827]">Unassigned Learners</h2>
                    <div className="mt-4 space-y-2">
                      {data.unassignedLearners.map((learner) => (
                        <div key={learner.name} className="rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] p-3">
                          <div className="text-sm font-semibold text-[#101827]">{learner.name}</div>
                          <div className="mt-0.5 text-xs text-[#667085]">{learner.level} - {learner.type}</div>
                          <button
                            type="button"
                            disabled={assignLearnerMutation.isPending}
                            onClick={() => assignKnownLearner(learner)}
                            className="mt-3 w-full rounded-xl bg-[#101827] px-3 py-2 text-xs font-semibold text-[#f6c65b] disabled:cursor-not-allowed disabled:opacity-60"
                          >
                            Assign here
                          </button>
                        </div>
                      ))}
                      {data.unassignedLearners.length === 0 && (
                        <div className="rounded-2xl border border-dashed border-[#d9e2ef] p-4 text-center text-sm text-[#667085]">All learners are assigned.</div>
                      )}
                    </div>
                  </section>
                </aside>
              </div>
            ) : (
              <div className="rounded-3xl border border-dashed border-[#d9e2ef] bg-white p-10 text-center text-sm text-[#667085]">
                Select a section or create a new one.
              </div>
            )}
          </main>
        </section>
      </div>

      {editorOpen && (
        <SectionEditor
          mode={editorMode}
          form={sectionForm}
          busy={createSectionMutation.isPending || updateSectionMutation.isPending}
          onChange={setSectionForm}
          onClose={() => setEditorOpen(false)}
          onSave={saveSection}
        />
      )}
    </div>
  );
}

function Metric({ icon: Icon, label, value }: { icon: LucideIcon; label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] p-4">
      <Icon className="h-5 w-5 text-[#b45309]" />
      <div className="mt-3 text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">{label}</div>
      <div className="mt-1 font-display text-2xl font-semibold text-[#101827]">{value}</div>
    </div>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] p-3">
      <div className="text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">{label}</div>
      <div className="mt-1 truncate text-sm font-semibold text-[#101827]">{value}</div>
    </div>
  );
}

function LearnerRow({
  assignment,
  index,
  targetSectionId,
  onMove,
  onRemove,
}: {
  assignment: SectionAssignment;
  index: number;
  targetSectionId?: string;
  onMove: (toSectionId: string) => void;
  onRemove: () => void;
}) {
  return (
    <div className="grid grid-cols-[3rem_minmax(0,1fr)_8rem_11rem] items-center gap-3 px-4 py-3 text-sm">
      <span className="font-semibold text-[#667085]">{index + 1}</span>
      <div className="min-w-0">
        <div className="truncate font-semibold text-[#101827]">{assignment.learnerName}</div>
        <div className="truncate text-xs text-[#667085]">{assignment.learnerId}</div>
      </div>
      <span className="text-[#667085]">{assignment.gender}</span>
      <div className="flex flex-wrap justify-end gap-2">
        <button
          type="button"
          disabled={!targetSectionId}
          onClick={() => targetSectionId && onMove(targetSectionId)}
          className="rounded-full border border-[#d9e2ef] px-3 py-1 text-xs font-semibold text-[#101827] disabled:cursor-not-allowed disabled:opacity-45"
        >
          Move
        </button>
        <button
          type="button"
          onClick={onRemove}
          className="rounded-full border border-[#fee2e2] bg-[#fff1f2] px-3 py-1 text-xs font-semibold text-[#991b1b]"
        >
          Remove
        </button>
      </div>
    </div>
  );
}

function AssignPanel({
  form,
  busy,
  onChange,
  onAssign,
}: {
  form: { learnerName: string; learnerId: string; gender: "Male" | "Female" };
  busy: boolean;
  onChange: (form: { learnerName: string; learnerId: string; gender: "Male" | "Female" }) => void;
  onAssign: () => void;
}) {
  return (
    <section className="rounded-3xl border border-[#d9e2ef] bg-white p-5 shadow-[0_18px_55px_-44px_rgba(15,23,42,0.45)]">
      <h2 className="font-display text-lg font-semibold text-[#101827]">Assign Learner</h2>
      <div className="mt-4 space-y-3">
        <Field label="Learner name">
          <input value={form.learnerName} onChange={(event) => onChange({ ...form, learnerName: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Learner ID">
          <input value={form.learnerId} onChange={(event) => onChange({ ...form, learnerId: event.target.value })} className={inputClass} />
        </Field>
        <Field label="Gender">
          <select value={form.gender} onChange={(event) => onChange({ ...form, gender: event.target.value as "Male" | "Female" })} className={inputClass}>
            <option>Female</option>
            <option>Male</option>
          </select>
        </Field>
        <button
          type="button"
          disabled={busy || !form.learnerName.trim()}
          onClick={onAssign}
          className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-[#101827] px-4 py-2.5 text-sm font-semibold text-[#f6c65b] disabled:cursor-not-allowed disabled:opacity-60"
        >
          {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <UserPlus className="h-4 w-4" />}
          Assign
        </button>
      </div>
    </section>
  );
}

function SectionEditor({
  mode,
  form,
  busy,
  onChange,
  onClose,
  onSave,
}: {
  mode: "create" | "edit";
  form: SectionFormState;
  busy: boolean;
  onChange: (form: SectionFormState) => void;
  onClose: () => void;
  onSave: () => void;
}) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-[#101827]/55 p-4 backdrop-blur-sm">
      <div className="w-full max-w-2xl rounded-3xl border border-white/20 bg-white shadow-[0_34px_110px_-38px_rgba(15,23,42,0.9)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#d9e2ef] p-5">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#b45309]">{mode === "create" ? "New section" : "Edit section"}</p>
            <h2 className="mt-1 font-display text-2xl font-semibold text-[#101827]">{mode === "create" ? "Create Section" : "Update Section"}</h2>
          </div>
          <button type="button" onClick={onClose} className="rounded-2xl border border-[#d9e2ef] p-2 text-[#667085] hover:bg-[#f8fafc]" aria-label="Close">
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="grid gap-4 p-5 sm:grid-cols-2">
          <Field label="Section name">
            <input value={form.name} onChange={(event) => onChange({ ...form, name: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Academic level">
            <select value={form.academicLevel} onChange={(event) => onChange({ ...form, academicLevel: event.target.value })} className={inputClass}>
              {gradeLevelOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Cluster">
            <select value={form.cluster} onChange={(event) => onChange({ ...form, cluster: event.target.value as SectionFormState["cluster"] })} className={inputClass}>
              {clusterOptions.map((option) => <option key={option}>{option}</option>)}
            </select>
          </Field>
          <Field label="Capacity">
            <input type="number" min={1} max={60} value={form.capacity} onChange={(event) => onChange({ ...form, capacity: Number(event.target.value) || 1 })} className={inputClass} />
          </Field>
          <Field label="Adviser">
            <input value={form.adviser} onChange={(event) => onChange({ ...form, adviser: event.target.value })} className={inputClass} />
          </Field>
          <Field label="Room">
            <input value={form.room} onChange={(event) => onChange({ ...form, room: event.target.value })} className={inputClass} />
          </Field>
          <div className="sm:col-span-2">
            <Field label="Schedule">
              <input value={form.schedule} onChange={(event) => onChange({ ...form, schedule: event.target.value })} className={inputClass} />
            </Field>
          </div>
        </div>

        <div className="flex justify-end gap-2 border-t border-[#d9e2ef] p-5">
          <button type="button" onClick={onClose} className="rounded-2xl border border-[#d9e2ef] px-4 py-2 text-sm font-semibold text-[#101827] hover:bg-[#f8fafc]">Cancel</button>
          <button
            type="button"
            disabled={busy}
            onClick={onSave}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#101827] px-4 py-2 text-sm font-semibold text-[#f6c65b] disabled:cursor-not-allowed disabled:opacity-60"
          >
            {busy && <Loader2 className="h-4 w-4 animate-spin" />}
            {mode === "create" ? "Create" : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
}

function Field({ label, children }: { label: string; children: ReactNode }) {
  return (
    <label className="block">
      <span className="mb-1.5 block text-xs font-semibold uppercase tracking-[0.12em] text-[#667085]">{label}</span>
      {children}
    </label>
  );
}

function StatusPill({ value }: { value: RegistrarSection["status"] }) {
  return <span className={cn("inline-flex rounded-full px-2.5 py-1 text-xs font-semibold", statusStyle[value])}>{value}</span>;
}

function CapacityLine({ enrolled, capacity }: { enrolled: number; capacity: number }) {
  const percent = capacity > 0 ? Math.min(100, Math.round((enrolled / capacity) * 100)) : 0;
  return (
    <div className="mt-3">
      <div className="mb-1 flex justify-between text-xs text-[#667085]">
        <span>{enrolled}/{capacity}</span>
        <span>{percent}%</span>
      </div>
      <div className="h-2 overflow-hidden rounded-full bg-[#e4e7ec]">
        <div className="h-full rounded-full bg-[#d8b45f]" style={{ width: `${percent}%` }} />
      </div>
    </div>
  );
}

function defaultSectionForm(): SectionFormState {
  return {
    name: "",
    academicLevel: "Grade 1",
    cluster: "Elementary",
    adviser: "Unassigned",
    room: "To assign",
    schedule: "Pending timetable",
    capacity: 30,
  };
}

function formFromSection(section: RegistrarSection): SectionFormState {
  return {
    name: section.name,
    academicLevel: section.academicLevel,
    cluster: section.cluster,
    adviser: section.adviser,
    room: section.room,
    schedule: section.schedule,
    capacity: section.capacity,
  };
}

function normalizeSectionForm(form: SectionFormState): SectionFormPayload {
  return {
    ...form,
    name: form.name.trim() || `${form.academicLevel} Section`,
    adviser: form.adviser.trim() || "Unassigned",
    room: form.room.trim() || "To assign",
    schedule: form.schedule.trim() || "Pending timetable",
    capacity: Math.max(1, Math.min(60, Number(form.capacity) || 1)),
  };
}

const inputClass = "h-11 w-full rounded-2xl border border-[#d9e2ef] bg-[#f8fafc] px-3 text-sm text-[#101827] outline-none transition-all focus:border-[#b88b20] focus:ring-4 focus:ring-[#d8b45f]/20";
