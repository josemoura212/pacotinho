import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { hash } from "bcryptjs";
import { users } from "./schema";
import { eq } from "drizzle-orm";

async function seed() {
  const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
  });

  const db = drizzle(pool);

  const existing = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.email, "admin@pacotinho.com"))
    .limit(1);

  if (existing.length > 0) {
    console.log("Admin já existe, pulando seed.");
    await pool.end();
    return;
  }

  const passwordHash = await hash("Admin@123", 12);

  await db.insert(users).values({
    name: "Administrador",
    email: "admin@pacotinho.com",
    passwordHash,
    role: "ADMIN",
    active: true,
  });

  console.log("Seed concluído: admin@pacotinho.com / Admin@123");
  await pool.end();
}

seed().catch((err) => {
  console.error("Erro no seed:", err);
  process.exit(1);
});
