import { motion } from "framer-motion";
import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";
import { TrendingUp, TrendingDown } from "lucide-react";

type Props = {
  label: string;
  value: string | number;
  delta: number;
  icon: LucideIcon;
  accent?: string;
  index?: number;
};

export function StatCard({ label, value, delta, icon: Icon, accent = "from-primary to-primary-glow", index = 0 }: Props) {
  const up = delta >= 0;
  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.06, duration: 0.35, ease: "easeOut" }}
      whileHover={{ y: -3 }}
      className="group relative overflow-hidden rounded-2xl border border-border bg-card p-5 shadow-soft transition-shadow hover:shadow-elegant"
    >
      <div className={cn("absolute -right-10 -top-10 h-32 w-32 rounded-full bg-gradient-to-br opacity-10 blur-2xl transition-opacity group-hover:opacity-20", accent)} />
      <div className="flex items-start justify-between">
        <div>
          <p className="text-xs font-medium uppercase tracking-wider text-muted-foreground">{label}</p>
          <motion.p
            key={String(value)}
            initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
            className="mt-2 font-display text-3xl font-semibold tracking-tight"
          >
            {value}
          </motion.p>
        </div>
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br text-primary-foreground", accent)}>
          <Icon className="h-5 w-5" />
        </div>
      </div>
      <div className="mt-4 flex items-center gap-1.5 text-xs">
        <span className={cn("inline-flex items-center gap-1 rounded-full px-2 py-0.5 font-medium", up ? "bg-success/15 text-success-foreground" : "bg-destructive/15 text-destructive")}>
          {up ? <TrendingUp className="h-3 w-3" /> : <TrendingDown className="h-3 w-3" />}
          {up ? "+" : ""}{delta}%
        </span>
        <span className="text-muted-foreground">vs last term</span>
      </div>
    </motion.div>
  );
}
