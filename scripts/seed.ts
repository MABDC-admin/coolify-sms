import { readFileSync, readdirSync } from "node:fs";
import { join } from "node:path";
import { Client } from "pg";

const databaseUrl = process.env.DATABASE_URL;

if (!databaseUrl) {
  throw new Error("DATABASE_URL is required to seed data");
}

const seedDir = join(process.cwd(), "database", "seeds");
const files = readdirSync(seedDir).filter((file) => file.endsWith(".sql")).sort();
const client = new Client({ connectionString: databaseUrl });

await client.connect();
try {
  for (const file of files) {
    console.log(`seed ${file}`);
    await client.query(readFileSync(join(seedDir, file), "utf8"));
  }
} finally {
  await client.end();
}
