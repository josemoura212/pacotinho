import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { deliverPackage } from "@/lib/services/package-service";
import { hasPermission } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/types/user";
import type { ApiResponse } from "@/lib/types/api";

export async function POST(
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

  if (!hasPermission(session.user.role as UserRole, "packages:deliver")) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Sem permissão" },
      { status: 403 },
    );
  }

  const { id } = await params;

  try {
    const pkg = await deliverPackage(id, session.user.id);
    return NextResponse.json<ApiResponse<typeof pkg>>({
      success: true,
      data: pkg,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao registrar entrega";
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
