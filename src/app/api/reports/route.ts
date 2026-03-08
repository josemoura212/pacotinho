import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getPackageCounts, listPackages } from "@/lib/services/package-service";
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
  const pendingRegistrations = await listPackages({ status: "REGISTRO_PENDENTE" }, "ADMIN");
  const pendingDeliveries = await listPackages({ status: "ENTREGA_PENDENTE" }, "ADMIN");
  const completed = await listPackages({ status: "ENTREGA_CONCLUIDA" }, "ADMIN");

  return NextResponse.json<ApiResponse<unknown>>({
    success: true,
    data: {
      counts,
      pendingRegistrations: pendingRegistrations.length,
      pendingDeliveries: pendingDeliveries.length,
      completed: completed.length,
    },
  });
}
