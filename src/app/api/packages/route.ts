import { type NextRequest, NextResponse } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { createPackage, listPackages } from "@/lib/services/package-service";
import type { ApiResponse } from "@/lib/types/api";
import type { PackageStatus } from "@/lib/types/package";
import type { UserRole } from "@/lib/types/user";
import { createPackageSchema } from "@/lib/validations/package";

const statusSchema = z.enum([
  "REGISTRO_PENDENTE",
  "ENTREGA_PENDENTE",
  "ENTREGA_CONCLUIDA",
]);

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  const { searchParams } = request.nextUrl;
  const rawStatus = searchParams.get("status");
  const parsedStatus = rawStatus ? statusSchema.safeParse(rawStatus) : null;
  const status: PackageStatus | undefined = parsedStatus?.success
    ? parsedStatus.data
    : undefined;
  const search = searchParams.get("search");
  const page = Number(searchParams.get("page")) || 1;
  const limit = Number(searchParams.get("limit")) || 20;

  const role = session.user.role as UserRole;
  const result = await listPackages(
    {
      status,
      search: search ?? undefined,
      page,
      limit,
    },
    role,
    session.user.id,
  );

  return NextResponse.json<ApiResponse<typeof result>>({
    success: true,
    data: result,
  });
}

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

  let body: unknown;
  try {
    body = await request.json();
  } catch {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Corpo da requisição inválido" },
      { status: 400 },
    );
  }
  const parsed = createPackageSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const pkg = await createPackage(parsed.data, session.user.id);
    return NextResponse.json<ApiResponse<typeof pkg>>(
      { success: true, data: pkg },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao criar encomenda";
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
