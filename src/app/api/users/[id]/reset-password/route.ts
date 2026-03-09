import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { resetUserPassword } from "@/lib/services/user-service";
import type { ApiResponse } from "@/lib/types/api";
import type { UserRole } from "@/lib/types/user";
import { isValidUUID } from "@/lib/utils/validate-id";

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

  if (!hasPermission(session.user.role as UserRole, "users:reset-password")) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Sem permissão" },
      { status: 403 },
    );
  }

  const { id } = await params;
  if (!isValidUUID(id)) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "ID inválido" },
      { status: 400 },
    );
  }

  try {
    const result = await resetUserPassword(id);
    return NextResponse.json<ApiResponse<typeof result>>({
      success: true,
      data: result,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao resetar senha";
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
