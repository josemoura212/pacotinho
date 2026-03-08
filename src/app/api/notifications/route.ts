import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import {
  countUnread,
  listNotifications,
  markAllAsRead,
} from "@/lib/services/notification-service";
import type { ApiResponse } from "@/lib/types/api";

export async function GET(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  const { searchParams } = new URL(request.url);
  const countOnly = searchParams.get("count") === "true";

  if (countOnly) {
    const count = await countUnread(session.user.id);
    return NextResponse.json<ApiResponse<{ unread: number }>>({
      success: true,
      data: { unread: count },
    });
  }

  const items = await listNotifications(session.user.id);
  return NextResponse.json<ApiResponse<typeof items>>({
    success: true,
    data: items,
  });
}

export async function POST() {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  await markAllAsRead(session.user.id);
  return NextResponse.json<ApiResponse<null>>({ success: true, data: null });
}
