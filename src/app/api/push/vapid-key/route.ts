import { NextResponse } from "next/server";
import type { ApiResponse } from "@/lib/types/api";

export async function GET() {
  const vapidKey = process.env.VAPID_PUBLIC_KEY ?? null;

  return NextResponse.json<ApiResponse<string | null>>({
    success: true,
    data: vapidKey,
  });
}
