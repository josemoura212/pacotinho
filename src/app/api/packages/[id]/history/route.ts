import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getPackageHistory } from "@/lib/services/audit-service";
import { getPackageById } from "@/lib/services/package-service";
import type { UserRole } from "@/lib/types/user";
import type { ApiResponse } from "@/lib/types/api";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  const { id } = await params;

  const role = session.user.role as UserRole;
  if (role === "MORADOR") {
    const pkg = await getPackageById(id);
    if (!pkg || pkg.residentId !== session.user.id) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: "Sem permissão" },
        { status: 403 },
      );
    }
  }

  const history = await getPackageHistory(id);

  return NextResponse.json<ApiResponse<typeof history>>({
    success: true,
    data: history,
  });
}
