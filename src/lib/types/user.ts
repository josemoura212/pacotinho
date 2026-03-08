import type { InferSelectModel } from "drizzle-orm";
import type { users } from "@/lib/db/schema";

export type User = InferSelectModel<typeof users>;

export type UserWithoutPassword = Omit<User, "passwordHash">;

export type UserRole = "MORADOR" | "PORTEIRO" | "ADMIN";
