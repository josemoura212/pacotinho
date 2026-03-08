import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema";

function generatePassword(): string {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789@#$!";
  const bytes = randomBytes(16);
  let password = "";
  for (const byte of bytes) {
    password += chars[byte % chars.length];
  }
  return password;
}

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
    console.log("[seed] Admin já existe, pulando seed.");
    await pool.end();
    return;
  }

  const password = generatePassword();
  const passwordHash = await hash(password, 12);

  await db.insert(users).values({
    name: "Administrador",
    email: "admin@pacotinho.com",
    passwordHash,
    role: "ADMIN",
    active: true,
    mustChangePassword: true,
  });

  console.log("=========================================");
  console.log("  ADMIN CRIADO COM SUCESSO");
  console.log("-----------------------------------------");
  console.log(`  Email: admin@pacotinho.com`);
  console.log(`  Senha: ${password}`);
  console.log("-----------------------------------------");
  console.log("  Troca de senha obrigatória no 1o login");
  console.log("=========================================");

  await pool.end();
}

seed().catch((err) => {
  console.error("[seed] Erro:", err);
  process.exit(1);
});
