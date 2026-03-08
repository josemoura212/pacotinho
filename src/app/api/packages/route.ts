import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { listPackages, createPackage } from "@/lib/services/package-service";
import { createPackageSchema } from "@/lib/validations/package";
import { hasPermission } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/types/user";
import type { PackageStatus } from "@/lib/types/package";
import type { ApiResponse } from "@/lib/types/api";

export async function GET(request: NextRequest) {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  const { searchParams } = request.nextUrl;
  const status = searchParams.get("status") as PackageStatus | null;
  const search = searchParams.get("search");

  const role = session.user.role as UserRole;
  const pkgs = await listPackages(
    {
      status: status ?? undefined,
      search: search ?? undefined,
    },
    role,
    session.user.id,
  );

  return NextResponse.json<ApiResponse<typeof pkgs>>({
    success: true,
    data: pkgs,
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

  const body = await request.json();
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
    const message =
      error instanceof Error ? error.message : "Erro ao criar encomenda";
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
