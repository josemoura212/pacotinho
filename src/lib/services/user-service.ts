import { hash } from "bcryptjs";
import { randomBytes } from "crypto";
import { eq } from "drizzle-orm";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { UserWithoutPassword } from "@/lib/types/user";
import type { CreateUserInput, UpdateUserInput } from "@/lib/validations/user";

const userColumns = {
  id: users.id,
  name: users.name,
  email: users.email,
  role: users.role,
  phone: users.phone,
  apartment: users.apartment,
  block: users.block,
  mustChangePassword: users.mustChangePassword,
  active: users.active,
  createdAt: users.createdAt,
  updatedAt: users.updatedAt,
} as const;

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

export async function listUsers(): Promise<UserWithoutPassword[]> {
  return db.select(userColumns).from(users).orderBy(users.name);
}

export async function getUserById(id: string): Promise<UserWithoutPassword | null> {
  const [user] = await db
    .select(userColumns)
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  return user ?? null;
}

export async function getUserByEmail(email: string): Promise<UserWithoutPassword | null> {
  const [user] = await db
    .select(userColumns)
    .from(users)
    .where(eq(users.email, email))
    .limit(1);

  return user ?? null;
}

export async function createUser(
  data: CreateUserInput,
): Promise<UserWithoutPassword & { generatedPassword?: string }> {
  const existing = await getUserByEmail(data.email);
  if (existing) {
    throw new Error("E-mail já cadastrado");
  }

  const rawPassword = data.password || generatePassword();
  const passwordHash = await hash(rawPassword, 12);

  const [user] = await db
    .insert(users)
    .values({
      name: data.name,
      email: data.email,
      passwordHash,
      role: data.role,
      phone: data.phone ?? null,
      apartment: data.apartment ?? null,
      block: data.block ?? null,
    })
    .returning(userColumns);

  return {
    ...user,
    generatedPassword: data.password ? undefined : rawPassword,
  };
}

export async function updateUser(
  id: string,
  data: UpdateUserInput,
): Promise<UserWithoutPassword> {
  if (data.email) {
    const existing = await getUserByEmail(data.email);
    if (existing && existing.id !== id) {
      throw new Error("E-mail já cadastrado");
    }
  }

  const updateData: Record<string, unknown> = {
    updatedAt: new Date(),
  };

  if (data.name !== undefined) updateData.name = data.name;
  if (data.email !== undefined) updateData.email = data.email;
  if (data.role !== undefined) updateData.role = data.role;
  if (data.phone !== undefined) updateData.phone = data.phone;
  if (data.apartment !== undefined) updateData.apartment = data.apartment;
  if (data.block !== undefined) updateData.block = data.block;
  if (data.active !== undefined) updateData.active = data.active;

  if (data.password) {
    updateData.passwordHash = await hash(data.password, 12);
  }

  const [user] = await db
    .update(users)
    .set(updateData)
    .where(eq(users.id, id))
    .returning(userColumns);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  return user;
}

export async function deleteUser(id: string): Promise<void> {
  const [user] = await db
    .select({ id: users.id, active: users.active })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  await db
    .update(users)
    .set({ active: false, updatedAt: new Date() })
    .where(eq(users.id, id));
}

export async function resetUserPassword(
  id: string,
): Promise<{ generatedPassword: string }> {
  const [user] = await db
    .select({ id: users.id })
    .from(users)
    .where(eq(users.id, id))
    .limit(1);

  if (!user) {
    throw new Error("Usuário não encontrado");
  }

  const rawPassword = generatePassword();
  const passwordHash = await hash(rawPassword, 12);

  await db
    .update(users)
    .set({ passwordHash, mustChangePassword: true, updatedAt: new Date() })
    .where(eq(users.id, id));

  return { generatedPassword: rawPassword };
}
