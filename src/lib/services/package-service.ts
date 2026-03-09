import type { InferInsertModel } from "drizzle-orm";
import { and, desc, eq, ilike, or, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { packages, users } from "@/lib/db/schema";
import { eventBus } from "@/lib/events/event-bus";
import type { PackageStatus } from "@/lib/types/package";
import type { UserRole } from "@/lib/types/user";
import type {
  CompleteRegistrationInput,
  CreatePackageInput,
  UpdatePackageInput,
} from "@/lib/validations/package";
import { createAuditLog } from "./audit-service";

export async function createPackage(data: CreatePackageInput, registeredById: string) {
  const isComplete = !!data.trackingCode && !!data.residentId;
  const status = isComplete ? "ENTREGA_PENDENTE" : "REGISTRO_PENDENTE";

  const pkg = await db.transaction(async (tx) => {
    let recipientName: string | null = null;
    let apartment: string | null = null;
    let block: string | null = null;

    if (data.residentId) {
      const [resident] = await tx
        .select({
          name: users.name,
          apartment: users.apartment,
          block: users.block,
        })
        .from(users)
        .where(eq(users.id, data.residentId))
        .limit(1);

      if (!resident) {
        throw new Error("Morador não encontrado");
      }

      recipientName = resident.name;
      apartment = resident.apartment;
      block = resident.block;
    }

    const [created] = await tx
      .insert(packages)
      .values({
        trackingCode: data.trackingCode ?? null,
        residentId: data.residentId ?? null,
        recipientName,
        apartment,
        block,
        photoPath: data.photoPath ?? null,
        notes: data.notes ?? null,
        status,
        registeredById,
      })
      .returning();

    await createAuditLog(
      {
        packageId: created.id,
        userId: registeredById,
        action: "CRIACAO",
        changes: {
          trackingCode: data.trackingCode,
          residentId: data.residentId,
          notes: data.notes,
          photoPath: data.photoPath,
          status,
        },
      },
      tx,
    );

    return created;
  });

  if (isComplete) {
    eventBus.emit("package:created", {
      id: pkg.id,
      status: pkg.status,
      residentId: pkg.residentId,
      recipientName: pkg.recipientName,
      trackingCode: pkg.trackingCode,
    });
  }

  return pkg;
}

export async function completeRegistration(
  id: string,
  data: CompleteRegistrationInput,
  userId: string,
) {
  const updated = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({
        photoPath: packages.photoPath,
        notes: packages.notes,
      })
      .from(packages)
      .where(and(eq(packages.id, id), eq(packages.status, "REGISTRO_PENDENTE")))
      .limit(1);

    if (!existing) {
      const [found] = await tx
        .select({ id: packages.id })
        .from(packages)
        .where(eq(packages.id, id))
        .limit(1);

      if (!found) throw new Error("Encomenda não encontrada");
      throw new Error("Encomenda já foi completada");
    }

    const [resident] = await tx
      .select({
        name: users.name,
        apartment: users.apartment,
        block: users.block,
      })
      .from(users)
      .where(eq(users.id, data.residentId))
      .limit(1);

    if (!resident) {
      throw new Error("Morador não encontrado");
    }

    const [result] = await tx
      .update(packages)
      .set({
        trackingCode: data.trackingCode,
        residentId: data.residentId,
        recipientName: resident.name,
        apartment: resident.apartment,
        block: resident.block,
        photoPath: data.photoPath ?? existing.photoPath,
        notes: data.notes ?? existing.notes,
        status: "ENTREGA_PENDENTE",
        updatedAt: new Date(),
      })
      .where(and(eq(packages.id, id), eq(packages.status, "REGISTRO_PENDENTE")))
      .returning();

    if (!result) throw new Error("Encomenda já foi completada");

    await createAuditLog(
      {
        packageId: id,
        userId,
        action: "MUDANCA_STATUS",
        changes: {
          trackingCode: data.trackingCode,
          residentId: data.residentId,
          status: "ENTREGA_PENDENTE",
        },
      },
      tx,
    );

    return result;
  });

  eventBus.emit("package:registration_completed", {
    id: updated.id,
    status: updated.status,
    residentId: updated.residentId,
    recipientName: updated.recipientName,
    trackingCode: updated.trackingCode,
  });

  return updated;
}

export async function updatePackage(
  id: string,
  data: UpdatePackageInput,
  userId: string,
) {
  const updated = await db.transaction(async (tx) => {
    const [existing] = await tx
      .select({ id: packages.id })
      .from(packages)
      .where(eq(packages.id, id))
      .limit(1);

    if (!existing) {
      throw new Error("Encomenda não encontrada");
    }

    const updateData: Partial<InferInsertModel<typeof packages>> = {
      updatedAt: new Date(),
    };

    if (data.trackingCode !== undefined)
      updateData.trackingCode = data.trackingCode ?? null;
    if (data.photoPath !== undefined) updateData.photoPath = data.photoPath ?? null;
    if (data.notes !== undefined) updateData.notes = data.notes ?? null;

    if (data.residentId !== undefined) {
      updateData.residentId = data.residentId;
      const [resident] = await tx
        .select({
          name: users.name,
          apartment: users.apartment,
          block: users.block,
        })
        .from(users)
        .where(eq(users.id, data.residentId))
        .limit(1);

      if (resident) {
        updateData.recipientName = resident.name;
        updateData.apartment = resident.apartment;
        updateData.block = resident.block;
      }
    }

    const [result] = await tx
      .update(packages)
      .set(updateData)
      .where(eq(packages.id, id))
      .returning();

    await createAuditLog(
      {
        packageId: id,
        userId,
        action: "EDICAO",
        changes: updateData,
      },
      tx,
    );

    return result;
  });

  eventBus.emit("package:updated", {
    id: updated.id,
    status: updated.status,
    residentId: updated.residentId,
    recipientName: updated.recipientName,
    trackingCode: updated.trackingCode,
  });

  return updated;
}

export async function deliverPackage(id: string, deliveredById: string) {
  const updated = await db.transaction(async (tx) => {
    const [result] = await tx
      .update(packages)
      .set({
        status: "ENTREGA_CONCLUIDA",
        deliveredById,
        deliveredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(packages.id, id), eq(packages.status, "ENTREGA_PENDENTE")))
      .returning();

    if (!result) {
      const [existing] = await tx
        .select({ id: packages.id })
        .from(packages)
        .where(eq(packages.id, id))
        .limit(1);

      if (!existing) throw new Error("Encomenda não encontrada");
      throw new Error("Encomenda não está com entrega pendente");
    }

    await createAuditLog(
      {
        packageId: id,
        userId: deliveredById,
        action: "ENTREGA_CONCLUIDA",
        changes: { status: "ENTREGA_CONCLUIDA", deliveredById },
      },
      tx,
    );

    return result;
  });

  eventBus.emit("package:delivered", {
    id: updated.id,
    status: updated.status,
    residentId: updated.residentId,
    recipientName: updated.recipientName,
    trackingCode: updated.trackingCode,
  });

  return updated;
}

export async function confirmReceipt(id: string, receivedById: string) {
  const updated = await db.transaction(async (tx) => {
    const [result] = await tx
      .update(packages)
      .set({
        receivedById,
        receivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(and(eq(packages.id, id), eq(packages.status, "ENTREGA_CONCLUIDA")))
      .returning();

    if (!result) {
      const [existing] = await tx
        .select({ id: packages.id })
        .from(packages)
        .where(eq(packages.id, id))
        .limit(1);

      if (!existing) throw new Error("Encomenda não encontrada");
      throw new Error("Encomenda não está com entrega concluída");
    }

    await createAuditLog(
      {
        packageId: id,
        userId: receivedById,
        action: "CONFIRMACAO_RECEBIMENTO",
        changes: { receivedById },
      },
      tx,
    );

    return result;
  });

  eventBus.emit("package:receipt_confirmed", {
    id: updated.id,
    status: updated.status,
    residentId: updated.residentId,
    recipientName: updated.recipientName,
    trackingCode: updated.trackingCode,
  });

  return updated;
}

export async function getPackageById(id: string) {
  const [pkg] = await db.select().from(packages).where(eq(packages.id, id)).limit(1);

  return pkg ?? null;
}

interface ListFilters {
  status?: PackageStatus;
  search?: string;
  page?: number;
  limit?: number;
}

function buildPackageConditions(
  filters: ListFilters,
  userRole: UserRole,
  userId?: string,
) {
  const conditions = [];

  if (userRole === "MORADOR" && userId) {
    conditions.push(eq(packages.residentId, userId));
  }

  if (filters.status) {
    conditions.push(eq(packages.status, filters.status));
  }

  if (filters.search) {
    const escaped = filters.search.replace(/[%_\\]/g, "\\$&");
    conditions.push(
      or(
        ilike(packages.recipientName, `%${escaped}%`),
        ilike(packages.trackingCode, `%${escaped}%`),
      ),
    );
  }

  return conditions.length > 0 ? and(...conditions) : undefined;
}

export async function listPackages(
  filters: ListFilters,
  userRole: UserRole,
  userId?: string,
) {
  const page = Math.max(1, filters.page ?? 1);
  const limit = Math.min(100, Math.max(1, filters.limit ?? 20));
  const offset = (page - 1) * limit;
  const where = buildPackageConditions(filters, userRole, userId);

  const [items, countResult] = await Promise.all([
    db
      .select()
      .from(packages)
      .where(where)
      .orderBy(desc(packages.createdAt))
      .limit(limit)
      .offset(offset),
    db.select({ count: sql<number>`count(*)::int` }).from(packages).where(where),
  ]);

  const total = countResult[0]?.count ?? 0;

  return {
    items,
    total,
    page,
    limit,
    totalPages: Math.ceil(total / limit),
  };
}

export async function getPackageCounts(userRole: UserRole, userId?: string) {
  const baseConditions =
    userRole === "MORADOR" && userId ? eq(packages.residentId, userId) : undefined;

  const result = await db
    .select({
      status: packages.status,
      count: sql<number>`count(*)::int`,
    })
    .from(packages)
    .where(baseConditions)
    .groupBy(packages.status);

  const counts = {
    total: 0,
    REGISTRO_PENDENTE: 0,
    ENTREGA_PENDENTE: 0,
    ENTREGA_CONCLUIDA: 0,
  };

  for (const row of result) {
    counts[row.status] = row.count;
    counts.total += row.count;
  }

  return counts;
}
