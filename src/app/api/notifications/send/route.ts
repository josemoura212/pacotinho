import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import {
  broadcastNotification,
  sendCustomNotification,
} from "@/lib/services/notification-service";
import type { ApiResponse } from "@/lib/types/api";
import type { UserRole } from "@/lib/types/user";
import { sendNotificationSchema } from "@/lib/validations/notification";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  if (!hasPermission(session.user.role as UserRole, "notifications:send")) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Sem permissão" },
      { status: 403 },
    );
  }

  const body = await request.json();
  const parsed = sendNotificationSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const { title, body: message, broadcast, recipientId } = parsed.data;

  if (broadcast) {
    const result = await broadcastNotification({ title, body: message });
    return NextResponse.json<ApiResponse<typeof result>>(
      { success: true, data: result },
      { status: 201 },
    );
  }

  const notification = await sendCustomNotification(recipientId!, {
    title,
    body: message,
  });
  return NextResponse.json<ApiResponse<typeof notification>>(
    { success: true, data: notification },
    { status: 201 },
  );
}
