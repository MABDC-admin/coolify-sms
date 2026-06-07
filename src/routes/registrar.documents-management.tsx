import { createFileRoute } from "@tanstack/react-router";
import { AnimatePresence, motion } from "framer-motion";
import {
  AlertCircle,
  Archive,
  CheckCircle2,
  Download,
  Eye,
  FileCheck2,
  FileText,
  Filter,
  History,
  Printer,
  RefreshCcw,
  Search,
  ShieldCheck,
  Upload,
  X,
  XCircle,
} from "lucide-react";
import { useMemo, useState } from "react";

import { cn } from "@/lib/utils";

export const Route = createFileRoute("/registrar/documents-management")({
  head: () => ({ meta: [{ title: "Documents Management - Scholaris" }] }),
  component: DocumentsManagementPage,
});

type DocumentStatus = "Submitted" | "Verified" | "Rejected" | "Missing" | "Expired";

type StudentDocument = {
  id: string;
  learner: string;
  lrn: string;
  academicLevel: string;
  studentType: "New" | "Old" | "Transferee" | "Returnee";
  schoolYear: string;
  documentType: string;
  status: DocumentStatus;
  submittedAt: string;
  verifiedBy?: string;
  remarks: string;
  version: number;
  fileName: string;
  sensitivity: "Standard" | "Restricted";
  audit: string[];
};

const initialDocuments: StudentDocument[] = [
  {
    id: "DOC-1001",
    learner: "Maria Santos",
    lrn: "136582090114",
    academicLevel: "Grade 7",
    studentType: "New",
    schoolYear: "2026-2027",
    documentType: "Birth Certificate",
    status: "Submitted",
    submittedAt: "Today, 09:20",
    remarks: "Clear PSA copy, waiting for registrar verification.",
    version: 2,
    fileName: "maria-santos-birth-certificate.pdf",
    sensitivity: "Restricted",
    audit: ["Parent uploaded v1", "Registrar requested clearer scan", "Parent uploaded v2"],
  },
  {
    id: "DOC-1002",
    learner: "Maria Santos",
    lrn: "136582090114",
    academicLevel: "Grade 7",
    studentType: "New",
    schoolYear: "2026-2027",
    documentType: "Report Card / Form 138",
    status: "Missing",
    submittedAt: "-",
    remarks: "Required before official enrollment.",
    version: 0,
    fileName: "No file",
    sensitivity: "Standard",
    audit: ["Checklist generated from Grade 7 new learner rules"],
  },
  {
    id: "DOC-1003",
    learner: "Kenji Reyes",
    lrn: "128843019742",
    academicLevel: "Grade 10",
    studentType: "Transferee",
    schoolYear: "2026-2027",
    documentType: "Transfer Credentials",
    status: "Rejected",
    submittedAt: "Jun 6, 14:10",
    remarks: "School seal is not readable. Request resubmission.",
    version: 1,
    fileName: "kenji-transfer-credentials.jpg",
    sensitivity: "Restricted",
    audit: ["Registrar viewed file", "Document rejected: seal unreadable"],
  },
  {
    id: "DOC-1004",
    learner: "Aisha Bello",
    lrn: "110984752301",
    academicLevel: "Grade 11",
    studentType: "Old",
    schoolYear: "2026-2027",
    documentType: "ID Photo",
    status: "Verified",
    submittedAt: "Jun 5, 11:40",
    verifiedBy: "Ana Reyes",
    remarks: "Accepted for ID generation.",
    version: 1,
    fileName: "aisha-id-photo.png",
    sensitivity: "Standard",
    audit: ["Student uploaded ID photo", "Ana Reyes verified document"],
  },
  {
    id: "DOC-1005",
    learner: "Lucas Kim",
    lrn: "140029475612",
    academicLevel: "Grade 6",
    studentType: "Returnee",
    schoolYear: "2026-2027",
    documentType: "Medical Record",
    status: "Expired",
    submittedAt: "May 18, 10:05",
    remarks: "Medical clearance is older than one school year.",
    version: 1,
    fileName: "lucas-medical-record.pdf",
    sensitivity: "Restricted",
    audit: ["Registrar viewed file", "System marked as expired for 2026-2027"],
  },
  {
    id: "DOC-1006",
    learner: "Sofia Ramirez",
    lrn: "119004385210",
    academicLevel: "Grade 12",
    studentType: "Old",
    schoolYear: "2026-2027",
    documentType: "Good Moral Certificate",
    status: "Submitted",
    submittedAt: "Today, 08:45",
    remarks: "Pending check against previous year record.",
    version: 1,
    fileName: "sofia-good-moral.pdf",
    sensitivity: "Standard",
    audit: ["Student uploaded certificate"],
  },
];

const statusStyles: Record<DocumentStatus, string> = {
  Submitted: "bg-warning/15 text-warning-foreground",
  Verified: "bg-success/15 text-success-foreground",
  Rejected: "bg-destructive/10 text-destructive",
  Missing: "bg-muted text-muted-foreground",
  Expired: "bg-accent text-accent-foreground",
};

function DocumentsManagementPage() {
  const [documents, setDocuments] = useState(initialDocuments);
  const [query, setQuery] = useState("");
  const [status, setStatus] = useState<"All" | DocumentStatus>("All");
  const [selected, setSelected] = useState<StudentDocument | null>(initialDocuments[0]);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const filtered = useMemo(() => {
    const needle = query.trim().toLowerCase();
    return documents.filter((document) => {
      const matchesStatus = status === "All" || document.status === status;
      const matchesQuery = !needle || [document.learner, document.lrn, document.academicLevel, document.documentType, document.fileName]
        .some((value) => value.toLowerCase().includes(needle));
      return matchesStatus && matchesQuery;
    });
  }, [documents, query, status]);

  const stats = useMemo(() => ({
    submitted: documents.filter((document) => document.status === "Submitted").length,
    verified: documents.filter((document) => document.status === "Verified").length,
    missing: documents.filter((document) => document.status === "Missing").length,
    actionRequired: documents.filter((document) => ["Rejected", "Expired", "Missing"].includes(document.status)).length,
  }), [documents]);

  const updateDocument = (id: string, nextStatus: DocumentStatus, remarks: string) => {
    setDocuments((current) => current.map((document) => {
      if (document.id !== id) return document;
      const auditLine = `Ana Reyes set status to ${nextStatus}`;
      const updated = {
        ...document,
        status: nextStatus,
        remarks,
        verifiedBy: nextStatus === "Verified" ? "Ana Reyes" : document.verifiedBy,
        audit: [...document.audit, auditLine],
      };
      setSelected((active) => active?.id === id ? updated : active);
      return updated;
    }));
  };

  const toggleSelected = (id: string) => {
    setSelectedIds((current) => current.includes(id) ? current.filter((item) => item !== id) : [...current, id]);
  };

  const bulkVerify = () => {
    selectedIds.forEach((id) => updateDocument(id, "Verified", "Bulk verified after registrar checklist review."));
    setSelectedIds([]);
  };

  return (
    <div className="space-y-5">
      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <Stat label="Submitted" value={stats.submitted} icon={Upload} tone="warning" />
        <Stat label="Verified" value={stats.verified} icon={ShieldCheck} tone="success" />
        <Stat label="Missing" value={stats.missing} icon={AlertCircle} tone="muted" />
        <Stat label="Action required" value={stats.actionRequired} icon={XCircle} tone="danger" />
      </div>

      <div className="grid gap-5 xl:grid-cols-[1fr_24rem]">
        <section className="space-y-4">
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="flex flex-wrap items-center gap-3">
              <div className="relative min-w-[220px] flex-1">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder="Search learner, LRN, academic level, document..."
                  className="h-10 w-full rounded-xl border border-input bg-background pl-9 pr-3 text-sm shadow-soft outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </div>
              <div className="flex items-center gap-2 rounded-xl border border-border bg-background p-1">
                <Filter className="ml-2 h-4 w-4 text-muted-foreground" />
                <select
                  value={status}
                  onChange={(event) => setStatus(event.target.value as "All" | DocumentStatus)}
                  className="h-8 bg-transparent pr-2 text-sm outline-none"
                >
                  {["All", "Submitted", "Verified", "Rejected", "Missing", "Expired"].map((item) => (
                    <option key={item}>{item}</option>
                  ))}
                </select>
              </div>
              <button
                type="button"
                onClick={bulkVerify}
                disabled={selectedIds.length === 0}
                className="inline-flex h-10 items-center gap-2 rounded-xl bg-gradient-primary px-4 text-sm font-semibold text-primary-foreground shadow-elegant disabled:cursor-not-allowed disabled:opacity-50"
              >
                <CheckCircle2 className="h-4 w-4" />
                Bulk verify {selectedIds.length ? `(${selectedIds.length})` : ""}
              </button>
            </div>
          </div>

          <div className="overflow-hidden rounded-2xl border border-border bg-card shadow-soft">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/45 text-left text-xs uppercase tracking-wider text-muted-foreground">
                  <th className="w-10 px-4 py-3"></th>
                  <th className="px-4 py-3">Learner</th>
                  <th className="hidden px-4 py-3 md:table-cell">Document</th>
                  <th className="hidden px-4 py-3 lg:table-cell">Academic Level</th>
                  <th className="px-4 py-3">Status</th>
                  <th className="hidden px-4 py-3 xl:table-cell">Updated</th>
                  <th className="w-24 px-4 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((document, index) => (
                  <motion.tr
                    key={document.id}
                    initial={{ opacity: 0, y: 8 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: index * 0.025 }}
                    className={cn("border-b border-border/70 last:border-0 hover:bg-accent/35", selected?.id === document.id && "bg-accent/45")}
                  >
                    <td className="px-4 py-3">
                      <input
                        type="checkbox"
                        checked={selectedIds.includes(document.id)}
                        onChange={() => toggleSelected(document.id)}
                        className="h-4 w-4 rounded border-border accent-primary"
                      />
                    </td>
                    <td className="px-4 py-3">
                      <button type="button" onClick={() => setSelected(document)} className="text-left">
                        <div className="font-medium">{document.learner}</div>
                        <div className="text-xs text-muted-foreground">{document.lrn} · {document.studentType}</div>
                      </button>
                    </td>
                    <td className="hidden px-4 py-3 md:table-cell">
                      <div className="font-medium">{document.documentType}</div>
                      <div className="text-xs text-muted-foreground">{document.fileName}</div>
                    </td>
                    <td className="hidden px-4 py-3 lg:table-cell text-muted-foreground">{document.academicLevel}</td>
                    <td className="px-4 py-3">
                      <span className={cn("inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold", statusStyles[document.status])}>
                        <span className="h-1.5 w-1.5 rounded-full bg-current" />
                        {document.status}
                      </span>
                    </td>
                    <td className="hidden px-4 py-3 xl:table-cell text-muted-foreground">{document.submittedAt}</td>
                    <td className="px-4 py-3">
                      <div className="flex justify-end gap-1">
                        <IconAction label="Preview" onClick={() => setSelected(document)} icon={Eye} />
                        <IconAction label="Verify" onClick={() => updateDocument(document.id, "Verified", "Verified by registrar after document review.")} icon={CheckCircle2} />
                        <IconAction label="Reject" onClick={() => updateDocument(document.id, "Rejected", "Rejected pending corrected resubmission.")} icon={XCircle} />
                      </div>
                    </td>
                  </motion.tr>
                ))}
              </tbody>
            </table>
            {filtered.length === 0 && (
              <div className="p-10 text-center text-sm text-muted-foreground">No documents match the current filters.</div>
            )}
          </div>
        </section>

        <aside className="space-y-4">
          <DocumentPreview
            document={selected}
            onClose={() => setSelected(null)}
            onVerify={(id) => updateDocument(id, "Verified", "Verified by registrar after preview.")}
            onReject={(id) => updateDocument(id, "Rejected", "Rejected after preview. Needs corrected file.")}
            onResubmit={(id) => updateDocument(id, "Missing", "Resubmission requested from parent or learner.")}
          />
          <div className="rounded-2xl border border-border bg-card p-4 shadow-soft">
            <div className="mb-3 flex items-center gap-2">
              <History className="h-4 w-4 text-primary" />
              <h3 className="font-display text-base font-semibold">Document Audit Logs</h3>
            </div>
            <div className="space-y-2">
              {(selected?.audit ?? ["Select a document to inspect its audit log."]).map((event) => (
                <div key={event} className="rounded-lg border border-border bg-background p-3 text-xs text-muted-foreground">
                  {event}
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}

function Stat({ label, value, icon: Icon, tone }: { label: string; value: number; icon: typeof FileCheck2; tone: "warning" | "success" | "muted" | "danger" }) {
  const styles = {
    warning: "bg-warning/15 text-warning-foreground",
    success: "bg-success/15 text-success-foreground",
    muted: "bg-muted text-muted-foreground",
    danger: "bg-destructive/10 text-destructive",
  };

  return (
    <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="rounded-2xl border border-border bg-card p-4 shadow-soft">
      <div className="flex items-center justify-between">
        <div>
          <div className="text-xs uppercase tracking-wider text-muted-foreground">{label}</div>
          <div className="mt-1 font-display text-3xl font-semibold">{value}</div>
        </div>
        <div className={cn("flex h-11 w-11 items-center justify-center rounded-xl", styles[tone])}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
    </motion.div>
  );
}

function IconAction({ label, icon: Icon, onClick }: { label: string; icon: typeof Eye; onClick: () => void }) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:bg-accent hover:text-foreground"
    >
      <Icon className="h-4 w-4" />
    </button>
  );
}

function DocumentPreview({
  document,
  onClose,
  onVerify,
  onReject,
  onResubmit,
}: {
  document: StudentDocument | null;
  onClose: () => void;
  onVerify: (id: string) => void;
  onReject: (id: string) => void;
  onResubmit: (id: string) => void;
}) {
  return (
    <AnimatePresence mode="wait">
      <motion.div
        key={document?.id ?? "empty"}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: -10 }}
        className="rounded-2xl border border-border bg-card p-4 shadow-soft"
      >
        {document ? (
          <>
            <div className="mb-4 flex items-start justify-between gap-3">
              <div>
                <h3 className="font-display text-base font-semibold">Document Preview</h3>
                <p className="text-xs text-muted-foreground">{document.documentType}</p>
              </div>
              <button type="button" onClick={onClose} className="rounded-lg p-1.5 text-muted-foreground hover:bg-accent">
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="flex aspect-[4/5] items-center justify-center rounded-xl border border-dashed border-border bg-secondary/40">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-muted-foreground" />
                <div className="mt-3 max-w-[14rem] truncate text-sm font-medium">{document.fileName}</div>
                <div className="mt-1 text-xs text-muted-foreground">v{document.version} · {document.sensitivity}</div>
              </div>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2 text-xs">
              <Info label="Learner" value={document.learner} />
              <Info label="LRN" value={document.lrn} />
              <Info label="Academic Level" value={document.academicLevel} />
              <Info label="School Year" value={document.schoolYear} />
            </div>

            <div className="mt-3 rounded-xl border border-border bg-background p-3">
              <div className="text-xs uppercase tracking-wider text-muted-foreground">Remarks</div>
              <p className="mt-1 text-sm leading-5">{document.remarks}</p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <button type="button" onClick={() => onVerify(document.id)} className="inline-flex items-center justify-center gap-2 rounded-xl bg-gradient-primary px-3 py-2 text-xs font-semibold text-primary-foreground">
                <CheckCircle2 className="h-4 w-4" /> Verify
              </button>
              <button type="button" onClick={() => onReject(document.id)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-destructive/30 bg-destructive/10 px-3 py-2 text-xs font-semibold text-destructive">
                <XCircle className="h-4 w-4" /> Reject
              </button>
              <button type="button" onClick={() => onResubmit(document.id)} className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent">
                <RefreshCcw className="h-4 w-4" /> Request Resubmission
              </button>
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent">
                <Printer className="h-4 w-4" /> Print
              </button>
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent">
                <Download className="h-4 w-4" /> Download
              </button>
              <button type="button" className="inline-flex items-center justify-center gap-2 rounded-xl border border-border bg-background px-3 py-2 text-xs font-semibold hover:bg-accent">
                <Archive className="h-4 w-4" /> Archive
              </button>
            </div>
          </>
        ) : (
          <div className="rounded-xl border border-dashed border-border p-8 text-center text-sm text-muted-foreground">
            Select a learner document to preview and process it.
          </div>
        )}
      </motion.div>
    </AnimatePresence>
  );
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background p-2">
      <div className="text-[10px] uppercase tracking-wider text-muted-foreground">{label}</div>
      <div className="mt-0.5 truncate font-medium">{value}</div>
    </div>
  );
}
