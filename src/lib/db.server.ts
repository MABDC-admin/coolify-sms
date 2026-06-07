import { Pool } from "pg";

let pool: Pool | undefined;

export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL);
}

export function getPool() {
  if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is not configured");
  }

  pool ??= new Pool({
    connectionString: process.env.DATABASE_URL,
    max: Number(process.env.PG_POOL_MAX ?? 10),
    idleTimeoutMillis: 30_000,
    connectionTimeoutMillis: 5_000,
  });

  return pool;
}

export async function query<T extends object>(sql: string, values: unknown[] = []) {
  const result = await getPool().query<T>(sql, values);
  return result.rows;
}

export async function queryOne<T extends object>(sql: string, values: unknown[] = []) {
  const rows = await query<T>(sql, values);
  return rows[0];
}
