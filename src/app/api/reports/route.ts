import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getPackageCounts } from "@/lib/services/package-service";
import { hasPermission } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/types/user";
import type { ApiResponse } from "@/lib/types/api";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  if (!hasPermission(session.user.role as UserRole, "reports:view")) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Sem permissão" },
      { status: 403 },
    );
  }

  const counts = await getPackageCounts("ADMIN");

  return NextResponse.json<ApiResponse<typeof counts>>({
    success: true,
    data: counts,
  });
}
