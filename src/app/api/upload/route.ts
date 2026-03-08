import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { uploadFile } from "@/lib/services/upload-service";
import type { ApiResponse } from "@/lib/types/api";
import type { UserRole } from "@/lib/types/user";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  if (!hasPermission(session.user.role as UserRole, "packages:create")) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Sem permissão" },
      { status: 403 },
    );
  }

  const formData = await request.formData();
  const file = formData.get("file") as File | null;

  if (!file) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Nenhum arquivo enviado" },
      { status: 400 },
    );
  }

  try {
    const result = await uploadFile(file);
    return NextResponse.json<ApiResponse<{ filename: string }>>({
      success: true,
      data: { filename: result.filename },
    });
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao fazer upload";
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
