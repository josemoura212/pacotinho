import { and, eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { hasPermission } from "@/lib/auth/permissions";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import { createResidentWithoutAccount, createUser } from "@/lib/services/user-service";
import type { ApiResponse } from "@/lib/types/api";
import type { UserRole } from "@/lib/types/user";
import {
  createResidentWithoutAccountSchema,
  createUserSchema,
} from "@/lib/validations/user";

export async function GET() {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  if (!hasPermission(session.user.role as UserRole, "residents:list")) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Sem permissão" },
      { status: 403 },
    );
  }

  const residents = await db
    .select({
      id: users.id,
      name: users.name,
      apartment: users.apartment,
      block: users.block,
    })
    .from(users)
    .where(and(eq(users.role, "MORADOR"), eq(users.active, true)))
    .orderBy(users.name);

  return NextResponse.json<ApiResponse<typeof residents>>({
    success: true,
    data: residents,
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

  if (!hasPermission(session.user.role as UserRole, "residents:create")) {
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
  const rawBody = body as Record<string, unknown>;
  const hasEmail = !!rawBody.email;

  if (hasEmail) {
    const parsed = createUserSchema.safeParse({
      ...rawBody,
      role: "MORADOR",
    });

    if (!parsed.success) {
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: parsed.error.issues[0].message },
        { status: 400 },
      );
    }

    try {
      const user = await createUser(parsed.data);
      return NextResponse.json<ApiResponse<typeof user>>(
        { success: true, data: user },
        { status: 201 },
      );
    } catch (error) {
      const message =
        error instanceof Error ? error.message : "Erro ao cadastrar morador";
      return NextResponse.json<ApiResponse<null>>(
        { success: false, error: message },
        { status: 400 },
      );
    }
  }

  const parsed = createResidentWithoutAccountSchema.safeParse(rawBody);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  try {
    const user = await createResidentWithoutAccount(parsed.data);
    return NextResponse.json<ApiResponse<typeof user>>(
      { success: true, data: user },
      { status: 201 },
    );
  } catch (error) {
    const message = error instanceof Error ? error.message : "Erro ao cadastrar morador";
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: message },
      { status: 400 },
    );
  }
}
