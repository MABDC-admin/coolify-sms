import { createFileRoute, Link } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, CheckCircle2, ClipboardList, FileText, Layers, ShieldCheck } from "lucide-react";

import { getRegistrarModuleById, getRegistrarModuleFunctions } from "@/lib/registrar-modules";

export const Route = createFileRoute("/registrar/$moduleId")({
  head: ({ params }) => {
    const module = getRegistrarModuleById(params.moduleId);
    return { meta: [{ title: `${module?.label ?? "Registrar Module"} - Scholaris` }] };
  },
  component: RegistrarModulePage,
});

function RegistrarModulePage() {
  const { moduleId } = Route.useParams();
  const module = getRegistrarModuleById(moduleId);
  const moduleFunctions = getRegistrarModuleFunctions(moduleId);

  if (!module) {
    return (
      <div className="rounded-2xl border border-border bg-card p-8 shadow-soft">
        <h2 className="font-display text-xl font-semibold">Registrar module not found</h2>
        <p className="mt-2 text-sm text-muted-foreground">The requested registrar module is not registered in the module catalog.</p>
        <Link to="/" className="mt-5 inline-flex items-center gap-2 rounded-xl bg-gradient-primary px-4 py-2 text-sm font-medium text-primary-foreground">
          Go to dashboard <ArrowRight className="h-4 w-4" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-5">
      <div className="rounded-2xl border border-border bg-card p-5 shadow-soft">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <span className="inline-flex items-center gap-1.5 rounded-full bg-primary/10 px-3 py-1 text-xs font-semibold text-primary">
              <ShieldCheck className="h-3.5 w-3.5" />
              {module.group}
            </span>
            <h2 className="mt-4 font-display text-2xl font-semibold tracking-tight">{module.label}</h2>
            <p className="mt-2 max-w-3xl text-sm leading-6 text-muted-foreground">{module.purpose}</p>
          </div>
          <div className="rounded-xl border border-border bg-secondary/50 px-4 py-3 text-right">
            <div className="text-xs uppercase tracking-wider text-muted-foreground">Build status</div>
            <div className="mt-1 text-sm font-semibold">{module.status}</div>
          </div>
        </div>
      </div>

      <div className="grid gap-5 lg:grid-cols-[1fr_22rem]">
        <motion.section
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft"
        >
          <div className="mb-4 flex items-center gap-2">
            <Layers className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Module Functions</h3>
          </div>
          {moduleFunctions.length > 0 ? (
            <div className="overflow-hidden rounded-xl border border-border">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border bg-muted/50 text-left text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="w-64 px-4 py-3 font-semibold">Function</th>
                    <th className="px-4 py-3 font-semibold">Description</th>
                  </tr>
                </thead>
                <tbody>
                  {moduleFunctions.map((item, index) => (
                    <motion.tr
                      key={item.name}
                      initial={{ opacity: 0, y: 8 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.025 }}
                      className="border-b border-border/70 last:border-0"
                    >
                      <td className="px-4 py-3 align-top font-medium">{item.name}</td>
                      <td className="px-4 py-3 leading-6 text-muted-foreground">{item.description}</td>
                    </motion.tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {module.highlights.map((item, index) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 8 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.04 }}
                  className="flex items-start gap-3 rounded-xl border border-border bg-background p-3"
                >
                  <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-primary" />
                  <span className="text-sm">{item}</span>
                </motion.div>
              ))}
            </div>
          )}
        </motion.section>

        <motion.aside
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.08 }}
          className="rounded-2xl border border-border bg-card p-5 shadow-soft"
        >
          <div className="mb-4 flex items-center gap-2">
            <ClipboardList className="h-5 w-5 text-primary" />
            <h3 className="font-display text-lg font-semibold">Workflow</h3>
          </div>
          <ol className="space-y-3">
            {module.workflows.map((step, index) => (
              <li key={step} className="flex gap-3">
                <span className="flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-primary/10 text-xs font-semibold text-primary">{index + 1}</span>
                <span className="text-sm leading-5 text-muted-foreground">{step}</span>
              </li>
            ))}
          </ol>
        </motion.aside>
      </div>

      <div className="rounded-2xl border border-dashed border-border bg-card/70 p-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-start gap-3">
            <FileText className="mt-0.5 h-5 w-5 text-muted-foreground" />
            <div>
              <h3 className="text-sm font-semibold">Implementation note</h3>
              <p className="mt-1 text-sm text-muted-foreground">
                This module is registered in the registrar information architecture. The next build phase can replace this blueprint screen with full CRUD, filters, permissions, exports, and audit logs.
              </p>
            </div>
          </div>
          <Link to="/registration" className="inline-flex items-center gap-2 rounded-xl border border-border bg-background px-4 py-2 text-sm font-medium hover:bg-accent">
            Start registration <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </div>
    </div>
  );
}
