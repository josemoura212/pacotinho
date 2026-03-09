import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { users } from "./schema";

function secureRandomIndex(max: number): number {
  const limit = Math.floor(0x100000000 / max) * max;
  let value: number;
  do {
    value = randomBytes(4).readUInt32BE(0);
  } while (value >= limit);
  return value % max;
}

function generatePassword(): string {
  const upper = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const lower = "abcdefghijklmnopqrstuvwxyz";
  const digits = "0123456789";
  const special = "!@#$%&*";
  const all = upper + lower + digits + special;

  const parts = [
    upper[secureRandomIndex(upper.length)],
    lower[secureRandomIndex(lower.length)],
    digits[secureRandomIndex(digits.length)],
    special[secureRandomIndex(special.length)],
  ];

  for (let i = 0; i < 4; i++) {
    parts.push(all[secureRandomIndex(all.length)]);
  }

  for (let i = parts.length - 1; i > 0; i--) {
    const j = secureRandomIndex(i + 1);
    [parts[i], parts[j]] = [parts[j], parts[i]];
  }

  return parts.join("");
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
