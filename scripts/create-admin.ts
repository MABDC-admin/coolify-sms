/**
 * Create or update the initial admin user.
 *
 * Usage:
 *   docker exec <container> bun scripts/create-admin.ts
 *
 * Override defaults with env vars:
 *   ADMIN_EMAIL=you@school.edu ADMIN_PASSWORD=StrongPass123 bun scripts/create-admin.ts
 */

import { Client } from "pg";
import bcrypt from "bcryptjs";

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  console.error("❌ DATABASE_URL is required");
  process.exit(1);
}

const email = process.env.ADMIN_EMAIL ?? "admin@scholaris.edu";
const password = process.env.ADMIN_PASSWORD ?? "Scholaris@Admin2024!";
const name = process.env.ADMIN_NAME ?? "System Administrator";

console.log(`\n🔐 Creating admin user: ${email}\n`);

const client = new Client({ connectionString: databaseUrl });
await client.connect();

try {
  const hash = await bcrypt.hash(password, 12);

  const { rows } = await client.query(
    `INSERT INTO users (email, name, role, password_hash, is_active)
     VALUES ($1, $2, 'Admin', $3, true)
     ON CONFLICT (LOWER(email)) DO UPDATE
       SET name          = EXCLUDED.name,
           role          = EXCLUDED.role,
           password_hash = EXCLUDED.password_hash,
           is_active     = true,
           updated_at    = now()
     RETURNING id, email, name, role`,
    [email, name, hash]
  );

  const created = rows[0];
  console.log("✅ Admin user ready:");
  console.log(`   ID   : ${created.id}`);
  console.log(`   Email: ${created.email}`);
  console.log(`   Name : ${created.name}`);
  console.log(`   Role : ${created.role}`);
  console.log(`\n   Password: ${password}`);
  console.log(
    "\n⚠️  Change this password immediately after your first login!\n"
  );
} finally {
  await client.end();
}
