import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { deleteUser, getUserById, updateUser } from "@/lib/services/user-service";
import type { ApiResponse } from "@/lib/types/api";
import type { UserRole } from "@/lib/types/user";
import { isValidUUID } from "@/lib/utils/validate-id";
import { updateUserSchema } from "@/lib/validations/user";

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

  if (!hasPermission(session.user.role as UserRole, "users:list")) {
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
  const user = await getUserById(id);

  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Usuário não encontrado" },
      { status: 404 },
    );
  }

  return NextResponse.json<ApiResponse<typeof user>>({
    success: true,
    data: user,
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

  if (!hasPermission(session.user.role as UserRole, "users:edit")) {
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
  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Corpo da requisição inválido" },
      { status: 400 },
    );
  }
  const parsed = updateUserSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const user = await updateUser(id, parsed.data);
    return NextResponse.json<ApiResponse<typeof user>>({
      success: true,
      data: user,
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao atualizar usuário";
    const status = message.includes("não encontrad") ? 404 : 400;
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status },
    );
  }
}

export async function DELETE(
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

  if (!hasPermission(session.user.role as UserRole, "users:delete")) {
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

  if (id === session.user.id) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não é possível excluir seu próprio usuário" },
      { status: 400 },
    );
  }

  try {
    await deleteUser(id);
    return NextResponse.json<ApiResponse<null>>({ success: true });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao excluir usuário";
    const status = message.includes("não encontrad") ? 404 : 400;
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status },
    );
  }
}
