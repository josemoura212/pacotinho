import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { confirmReceipt, getPackageById } from "@/lib/services/package-service";
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

  if (!hasPermission(session.user.role as UserRole, "packages:confirm")) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Sem permissão" },
      { status: 403 },
    );
  }

  const { id } = await params;

  const pkg = await getPackageById(id);
  if (!pkg) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Encomenda não encontrada" },
      { status: 404 },
    );
  }

  const role = session.user.role as UserRole;
  if (role === "MORADOR" && pkg.residentId !== session.user.id) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Sem permissão para esta encomenda" },
      { status: 403 },
    );
  }

  try {
    const updated = await confirmReceipt(id, session.user.id);
    return NextResponse.json<ApiResponse<typeof updated>>({
      success: true,
      data: updated,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao confirmar recebimento";
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
