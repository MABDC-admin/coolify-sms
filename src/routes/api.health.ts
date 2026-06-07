import { createFileRoute } from "@tanstack/react-router";

import { hasDatabase, queryOne } from "@/lib/db.server";

export const Route = createFileRoute("/api/health")({
  server: {
    handlers: {
      GET: async () => {
        let database = "not_configured";

        if (hasDatabase()) {
          try {
            const result = await queryOne<{ ok: number }>("SELECT 1 AS ok");
            database = result?.ok === 1 ? "ok" : "error";
          } catch {
            database = "error";
          }
        }

        return Response.json({
          status: database === "error" ? "degraded" : "ok",
          database,
          service: "school-compass",
          timestamp: new Date().toISOString(),
        });
      },
    },
  },
});
