import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck, Users, UserRoundCheck } from "lucide-react";

import { demoUsers, setStoredDemoUser, type DemoRole } from "@/lib/demo-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Quick Login - Scholaris" }] }),
  component: LoginPage,
});

const roleIcons: Record<DemoRole, typeof ShieldCheck> = {
  Admin: ShieldCheck,
  "Academic Director": BookOpen,
  Registrar: UserRoundCheck,
  Teacher: Users,
  Student: GraduationCap,
};

function LoginPage() {
  const navigate = useNavigate();

  const loginAs = (userId: string, landingPath: (typeof demoUsers)[number]["landingPath"]) => {
    setStoredDemoUser(userId);
    navigate({ to: landingPath });
  };

  return (
    <main className="min-h-screen bg-gradient-subtle px-4 py-8 sm:px-6 lg:px-8">
      <section className="mx-auto grid min-h-[calc(100vh-4rem)] max-w-6xl items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="space-y-5">
          <div className="inline-flex items-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft">
            <span className="h-2 w-2 rounded-full bg-primary" />
            School Compass Demo Access
          </div>
          <div>
            <h1 className="font-display text-4xl font-semibold tracking-tight text-foreground sm:text-5xl">
              Choose a portal and enter instantly.
            </h1>
            <p className="mt-4 max-w-xl text-sm leading-6 text-muted-foreground sm:text-base">
              Use these quick login buttons to review each SMS role without passwords while the production RBAC layer is being built.
            </p>
          </div>
          <div className="grid max-w-xl grid-cols-2 gap-3 text-sm">
            {["Admin", "Academic", "Registrar", "Teacher"].map((item) => (
              <div key={item} className="rounded-2xl border border-border bg-card/80 p-4 shadow-soft">
                <div className="font-medium">{item}</div>
                <div className="mt-1 text-xs text-muted-foreground">Portal-ready shell</div>
              </div>
            ))}
          </div>
        </motion.div>

        <div className="grid gap-3">
          {demoUsers.map((user, index) => {
            const Icon = roleIcons[user.role];
            return (
              <motion.button
                key={user.id}
                type="button"
                initial={{ opacity: 0, x: 18 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: index * 0.05 }}
                whileHover={{ y: -2 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => loginAs(user.id, user.landingPath)}
                className="group grid grid-cols-[48px_1fr_auto] items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-soft transition-shadow hover:shadow-elegant"
              >
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-gradient-primary text-primary-foreground shadow-elegant">
                  <Icon className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-display text-lg font-semibold">{user.role}</span>
                    <span className="rounded-full bg-secondary px-2 py-0.5 text-[11px] font-medium text-secondary-foreground">
                      {user.initials}
                    </span>
                  </div>
                  <p className="mt-1 text-sm text-foreground">{user.name}</p>
                  <p className="mt-1 text-xs text-muted-foreground">{user.scope}</p>
                </div>
                <ArrowRight className="h-5 w-5 text-muted-foreground transition-transform group-hover:translate-x-1 group-hover:text-primary" />
              </motion.button>
            );
          })}
        </div>
      </section>
    </main>
  );
}
