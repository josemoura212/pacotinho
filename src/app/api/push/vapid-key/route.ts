import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { env } from "@/lib/env";
import type { ApiResponse } from "@/lib/types/api";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  const vapidKey = env.VAPID_PUBLIC_KEY || null;

  return NextResponse.json<ApiResponse<string | null>>({
    success: true,
    data: vapidKey,
  });
}
