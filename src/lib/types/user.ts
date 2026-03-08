import type { users } from "@/lib/db/schema";
import type { InferSelectModel } from "drizzle-orm";

export type User = InferSelectModel<typeof users>;

export type UserWithoutPassword = Omit<User, "passwordHash">;

export type UserRole = "MORADOR" | "PORTEIRO" | "ADMIN";
