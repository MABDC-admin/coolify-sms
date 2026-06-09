import { createFileRoute, useNavigate } from "@tanstack/react-router";
import { motion } from "framer-motion";
import { ArrowRight, BookOpen, GraduationCap, ShieldCheck, Users, UserRoundCheck, Compass } from "lucide-react";
import { demoUsers, setStoredDemoUser, type DemoRole } from "@/lib/demo-auth";

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Login - Scholaris" }] }),
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
    <main className="flex min-h-screen w-full bg-background">
      {/* Left Panel: Visual/Branding */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 overflow-hidden bg-zinc-900">
        {/* The beautiful background image generated */}
        <div 
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/login-bg.png')" }}
        />
        {/* Subtle dark gradient overlay so text is readable */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-black/10" />
        
        <div className="relative z-10 flex flex-col justify-between p-12 w-full h-full text-white">
          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.2 }}
            className="flex items-center gap-3"
          >
            <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/10 backdrop-blur-md border border-white/20">
              <Compass className="h-6 w-6 text-white" />
            </div>
            <span className="font-display text-2xl font-bold tracking-wide">Scholaris</span>
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 20 }} 
            animate={{ opacity: 1, y: 0 }} 
            transition={{ delay: 0.4 }}
            className="max-w-lg space-y-6"
          >
            <h1 className="font-display text-5xl font-bold leading-[1.1] tracking-tight">
              Empowering the future of education.
            </h1>
            <p className="text-lg text-white/80 leading-relaxed font-light">
              Experience the next generation of school management. Streamlined operations, deep insights, and seamless connectivity.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div key={i} className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-white/20 backdrop-blur-md" />
                ))}
              </div>
              <p className="text-sm font-medium text-white/70">Trusted by 500+ institutions</p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel: Login Form / Buttons */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 xl:p-16">
        <div className="w-full max-w-md space-y-10">
          <motion.div initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} className="text-center lg:text-left">
            <div className="inline-flex lg:hidden items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft mb-6">
              <Compass className="h-3 w-3" /> Scholaris SMS
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome back
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Select your role to instantly access the Scholaris demo portal.
            </p>
          </motion.div>

          <div className="space-y-3">
            {demoUsers.map((user, index) => {
              const Icon = roleIcons[user.role];
              return (
                <motion.button
                  key={user.id}
                  type="button"
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ delay: 0.1 + index * 0.05 }}
                  whileHover={{ y: -2, scale: 1.01 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => loginAs(user.id, user.landingPath)}
                  className="group relative flex w-full items-center gap-4 rounded-2xl border border-border bg-card p-4 text-left shadow-sm transition-all hover:border-primary/30 hover:shadow-md"
                >
                  <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-xl bg-accent text-accent-foreground transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between">
                      <span className="font-display text-base font-semibold text-foreground group-hover:text-primary transition-colors">
                        {user.role}
                      </span>
                      <ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 -translate-x-2 transition-all group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-primary" />
                    </div>
                    <p className="truncate text-sm text-muted-foreground">{user.name}</p>
                  </div>
                </motion.button>
              );
            })}
          </div>

          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }} className="text-center text-xs text-muted-foreground">
            <p>&copy; {new Date().getFullYear()} Scholaris System. All rights reserved.</p>
          </motion.div>
        </div>
      </div>
    </main>
  );
}
