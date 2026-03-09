import { and, desc, eq, sql } from "drizzle-orm";
import { db } from "@/lib/db";
import { notifications, users } from "@/lib/db/schema";
import { sendPushToUser } from "@/lib/services/push-service";

export async function createNotification(
  userId: string,
  payload: { title: string; body: string; url?: string },
) {
  const [notification] = await db
    .insert(notifications)
    .values({
      userId,
      title: payload.title,
      body: payload.body,
      url: payload.url ?? null,
    })
    .returning();

  return notification;
}

export async function listNotifications(userId: string) {
  return db
    .select()
    .from(notifications)
    .where(eq(notifications.userId, userId))
    .orderBy(desc(notifications.createdAt))
    .limit(50);
}

export async function countUnread(userId: string) {
  const [result] = await db
    .select({ count: sql<number>`count(*)::int` })
    .from(notifications)
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));

  return result?.count ?? 0;
}

export async function markAllAsRead(userId: string) {
  await db
    .update(notifications)
    .set({ read: true })
    .where(and(eq(notifications.userId, userId), eq(notifications.read, false)));
}

export async function sendCustomNotification(
  recipientId: string,
  payload: { title: string; body: string },
) {
  const notification = await createNotification(recipientId, {
    title: payload.title,
    body: payload.body,
  });

  sendPushToUser(recipientId, {
    title: payload.title,
    body: payload.body,
  }).catch(() => {});

  return notification;
}

export async function broadcastNotification(payload: { title: string; body: string }) {
  const residents = await db
    .select({ id: users.id })
    .from(users)
    .where(and(eq(users.role, "MORADOR"), eq(users.active, true)));

  const created = await Promise.all(
    residents.map((resident) =>
      createNotification(resident.id, {
        title: payload.title,
        body: payload.body,
      }),
    ),
  );

  Promise.allSettled(
    residents.map((resident) =>
      sendPushToUser(resident.id, {
        title: payload.title,
        body: payload.body,
      }),
    ),
  ).catch(() => {});

  return { sent: created.length };
}
