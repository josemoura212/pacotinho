import { db } from "@/lib/db";
import { packageAuditLogs, users } from "@/lib/db/schema";
import { eq, desc } from "drizzle-orm";
import type { AuditAction } from "@/lib/types/package";

export async function createAuditLog(
  data: {
    packageId: string;
    userId: string;
    action: AuditAction;
    changes?: Record<string, unknown> | null;
  },
  tx?: { insert: typeof db.insert },
) {
  const executor = tx ?? db;
  await executor.insert(packageAuditLogs).values({
    packageId: data.packageId,
    userId: data.userId,
    action: data.action,
    changes: data.changes ?? null,
  });
}

export async function getPackageHistory(packageId: string) {
  return db
    .select({
      id: packageAuditLogs.id,
      action: packageAuditLogs.action,
      changes: packageAuditLogs.changes,
      createdAt: packageAuditLogs.createdAt,
      userId: packageAuditLogs.userId,
      userName: users.name,
    })
    .from(packageAuditLogs)
    .innerJoin(users, eq(packageAuditLogs.userId, users.id))
    .where(eq(packageAuditLogs.packageId, packageId))
    .orderBy(desc(packageAuditLogs.createdAt));
}
