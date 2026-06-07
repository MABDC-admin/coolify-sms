import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to run migrations");
}

const migrationsDir = join(process.cwd(), "database", "migrations");
const files = readdirSync(migrationsDir).filter((file) => file.endsWith(".sql")).sort();
const client = new Client({ connectionString: databaseUrl });

await client.connect();
try {
  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      filename TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT now()
    )
  `);

  for (const file of files) {
    const existing = await client.query("SELECT 1 FROM schema_migrations WHERE filename = $1", [file]);
    if (existing.rowCount) {
      console.log(`skip ${file}`);
      continue;
    }

    console.log(`apply ${file}`);
    await client.query("BEGIN");
    try {
      await client.query(readFileSync(join(migrationsDir, file), "utf8"));
      await client.query("INSERT INTO schema_migrations (filename) VALUES ($1)", [file]);
      await client.query("COMMIT");
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  }
} finally {
  await client.end();
}
