import { db } from "@/lib/db";
import { packages, users } from "@/lib/db/schema";
import { eq, and, desc, or, ilike, sql } from "drizzle-orm";
import { createAuditLog } from "./audit-service";
import { sendPushToUser } from "./push-service";
import type {
  CreatePackageInput,
  UpdatePackageInput,
  CompleteRegistrationInput,
} from "@/lib/validations/package";
import type { PackageStatus } from "@/lib/types/package";
import type { UserRole } from "@/lib/types/user";

export async function createPackage(data: CreatePackageInput, registeredById: string) {
  const isComplete = !!data.trackingCode && !!data.residentId;

  let recipientName: string | null = null;
  let apartment: string | null = null;
  let block: string | null = null;

  if (data.residentId) {
    const [resident] = await db
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

  const status = isComplete ? "ENTREGA_PENDENTE" : "REGISTRO_PENDENTE";

  const pkg = await db.transaction(async (tx) => {
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

  if (isComplete && data.residentId) {
    sendPushToUser(data.residentId, {
      title: "Nova encomenda!",
      body: `${recipientName}, você tem uma nova encomenda (${data.trackingCode})`,
      url: `/encomendas/${pkg.id}`,
    }).catch(() => {});
  }

  return pkg;
}

export async function completeRegistration(
  id: string,
  data: CompleteRegistrationInput,
  userId: string,
) {
  const [existing] = await db.select().from(packages).where(eq(packages.id, id)).limit(1);

  if (!existing) {
    throw new Error("Encomenda não encontrada");
  }

  if (existing.status !== "REGISTRO_PENDENTE") {
    throw new Error("Encomenda já foi completada");
  }

  const [resident] = await db
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

  const updated = await db.transaction(async (tx) => {
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
      .where(eq(packages.id, id))
      .returning();

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

  sendPushToUser(data.residentId, {
    title: "Nova encomenda!",
    body: `${resident.name}, você tem uma nova encomenda (${data.trackingCode})`,
    url: `/encomendas/${updated.id}`,
  }).catch(() => {});

  return updated;
}

export async function updatePackage(
  id: string,
  data: UpdatePackageInput,
  userId: string,
) {
  const [existing] = await db.select().from(packages).where(eq(packages.id, id)).limit(1);

  if (!existing) {
    throw new Error("Encomenda não encontrada");
  }

  const updateData: Record<string, unknown> = { updatedAt: new Date() };

  if (data.trackingCode !== undefined)
    updateData.trackingCode = data.trackingCode ?? null;
  if (data.photoPath !== undefined) updateData.photoPath = data.photoPath ?? null;
  if (data.notes !== undefined) updateData.notes = data.notes ?? null;

  if (data.residentId !== undefined) {
    updateData.residentId = data.residentId;
    const [resident] = await db
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

  return db.transaction(async (tx) => {
    const [updated] = await tx
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

    return updated;
  });
}

export async function deliverPackage(id: string, deliveredById: string) {
  const [existing] = await db.select().from(packages).where(eq(packages.id, id)).limit(1);

  if (!existing) {
    throw new Error("Encomenda não encontrada");
  }

  if (existing.status !== "ENTREGA_PENDENTE") {
    throw new Error("Encomenda não está com entrega pendente");
  }

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(packages)
      .set({
        status: "ENTREGA_CONCLUIDA",
        deliveredById,
        deliveredAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(packages.id, id))
      .returning();

    await createAuditLog(
      {
        packageId: id,
        userId: deliveredById,
        action: "ENTREGA_CONCLUIDA",
        changes: { status: "ENTREGA_CONCLUIDA", deliveredById },
      },
      tx,
    );

    return updated;
  });
}

export async function confirmReceipt(id: string, receivedById: string) {
  const [existing] = await db.select().from(packages).where(eq(packages.id, id)).limit(1);

  if (!existing) {
    throw new Error("Encomenda não encontrada");
  }

  if (existing.status !== "ENTREGA_CONCLUIDA") {
    throw new Error("Encomenda não está com entrega concluída");
  }

  return db.transaction(async (tx) => {
    const [updated] = await tx
      .update(packages)
      .set({
        receivedById,
        receivedAt: new Date(),
        updatedAt: new Date(),
      })
      .where(eq(packages.id, id))
      .returning();

    await createAuditLog(
      {
        packageId: id,
        userId: receivedById,
        action: "CONFIRMACAO_RECEBIMENTO",
        changes: { receivedById },
      },
      tx,
    );

    return updated;
  });
}

export async function getPackageById(id: string) {
  const [pkg] = await db.select().from(packages).where(eq(packages.id, id)).limit(1);

  return pkg ?? null;
}

interface ListFilters {
  status?: PackageStatus;
  search?: string;
}

export async function listPackages(
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

  const where = conditions.length > 0 ? and(...conditions) : undefined;

  return db.select().from(packages).where(where).orderBy(desc(packages.createdAt));
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
