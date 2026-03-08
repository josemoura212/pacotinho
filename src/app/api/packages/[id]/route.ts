import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getPackageById, updatePackage } from "@/lib/services/package-service";
import { updatePackageSchema } from "@/lib/validations/package";
import { hasPermission } from "@/lib/auth/permissions";
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
      { success: false, error: "Sem permissão" },
      { status: 403 },
    );
  }

  return NextResponse.json<ApiResponse<typeof pkg>>({
    success: true,
    data: pkg,
  });
}

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  if (!hasPermission(session.user.role as UserRole, "packages:edit")) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Sem permissão" },
      { status: 403 },
    );
  }

  const { id } = await params;
  const body = await request.json();
  const parsed = updatePackageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const pkg = await updatePackage(id, parsed.data, session.user.id);
    return NextResponse.json<ApiResponse<typeof pkg>>({
      success: true,
      data: pkg,
    });
  } catch (error) {
    const message =
      error instanceof Error ? error.message : "Erro ao atualizar";
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
