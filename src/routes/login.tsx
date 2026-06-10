import { createFileRoute, useNavigate, redirect } from "@tanstack/react-router";
import { createServerFn } from "@tanstack/react-start";
import { motion } from "framer-motion";
import { Compass, Eye, EyeOff, Lock, Mail } from "lucide-react";
import { useState } from "react";
import { z } from "zod";

// ── Server functions ──────────────────────────────────────────────────────────

const getSessionFn = createServerFn({ method: "GET" }).handler(async () => {
  const { getSessionFromCookie } = await import("@/lib/auth.server");
  return getSessionFromCookie();
});

const loginFn = createServerFn({ method: "POST" })
  .validator((data: unknown) =>
    z
      .object({
        email: z.string().email("Enter a valid email address"),
        password: z.string().min(1, "Password is required"),
      })
      .parse(data)
  )
  .handler(async ({ data }) => {
    const { loginUser, setSessionCookie } = await import("@/lib/auth.server");
    const result = await loginUser(data.email, data.password);
    if ("error" in result) return { error: result.error };
    await setSessionCookie(result.user);
    return { ok: true as const };
  });

// ── Route ─────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/login")({
  head: () => ({ meta: [{ title: "Sign in – Scholaris" }] }),
  beforeLoad: async () => {
    const session = await getSessionFn();
    if (session) throw redirect({ to: "/" });
  },
  component: LoginPage,
});

// ── Component ─────────────────────────────────────────────────────────────────

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const result = await loginFn({ data: { email, password } });
      if ("error" in result && result.error) {
        setError(result.error);
      } else {
        navigate({ to: "/" });
      }
    } catch {
      setError("Something went wrong. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <main className="flex min-h-screen w-full bg-background">
      {/* Left Panel — Branding */}
      <div className="relative hidden w-full lg:flex lg:w-1/2 overflow-hidden bg-zinc-900">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{ backgroundImage: "url('/login-bg.png')" }}
        />
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
              Experience the next generation of school management. Streamlined
              operations, deep insights, and seamless connectivity.
            </p>
            <div className="flex items-center gap-4 pt-4">
              <div className="flex -space-x-3">
                {[1, 2, 3, 4].map((i) => (
                  <div
                    key={i}
                    className="h-10 w-10 rounded-full border-2 border-zinc-900 bg-white/20 backdrop-blur-md"
                  />
                ))}
              </div>
              <p className="text-sm font-medium text-white/70">
                Trusted by Filipino schools worldwide
              </p>
            </div>
          </motion.div>
        </div>
      </div>

      {/* Right Panel — Login Form */}
      <div className="flex w-full items-center justify-center p-8 lg:w-1/2 xl:p-16">
        <div className="w-full max-w-md space-y-8">
          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center lg:text-left"
          >
            <div className="inline-flex lg:hidden items-center justify-center gap-2 rounded-full border border-border bg-card px-3 py-1.5 text-xs font-medium text-muted-foreground shadow-soft mb-6">
              <Compass className="h-3 w-3" /> Scholaris SMS
            </div>
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground sm:text-4xl">
              Welcome back
            </h2>
            <p className="mt-3 text-sm text-muted-foreground">
              Sign in to your Scholaris account to continue.
            </p>
          </motion.div>

          <motion.form
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.15 }}
            onSubmit={handleSubmit}
            className="space-y-4"
          >
            {/* Email */}
            <div className="space-y-1.5">
              <label
                htmlFor="email"
                className="text-sm font-medium text-foreground"
              >
                Email address
              </label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="email"
                  type="email"
                  autoComplete="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@scholaris.edu"
                  className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-4 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
              </div>
            </div>

            {/* Password */}
            <div className="space-y-1.5">
              <label
                htmlFor="password"
                className="text-sm font-medium text-foreground"
              >
                Password
              </label>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full rounded-xl border border-input bg-card py-2.5 pl-10 pr-10 text-sm shadow-sm outline-none transition-all focus:border-primary focus:ring-2 focus:ring-ring/30"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
                  tabIndex={-1}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4" />
                  ) : (
                    <Eye className="h-4 w-4" />
                  )}
                </button>
              </div>
            </div>

            {/* Error message */}
            {error && (
              <motion.div
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="rounded-xl border border-destructive/20 bg-destructive/8 px-3 py-2.5 text-sm text-destructive"
              >
                {error}
              </motion.div>
            )}

            {/* Submit */}
            <motion.button
              type="submit"
              disabled={loading}
              whileHover={{ y: -1 }}
              whileTap={{ scale: 0.98 }}
              className="w-full rounded-xl bg-primary px-4 py-2.5 text-sm font-semibold text-primary-foreground shadow-sm transition-all hover:bg-primary/90 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {loading ? (
                <span className="flex items-center justify-center gap-2">
                  <svg
                    className="h-4 w-4 animate-spin"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"
                    />
                  </svg>
                  Signing in…
                </span>
              ) : (
                "Sign in"
              )}
            </motion.button>
          </motion.form>

          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="text-center text-xs text-muted-foreground"
          >
            © {new Date().getFullYear()} Scholaris System. All rights reserved.
          </motion.p>
        </div>
      </div>
    </main>
  );
}
