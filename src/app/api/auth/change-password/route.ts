import { compare, hash } from "bcryptjs";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";
import { z } from "zod/v4";
import { auth } from "@/lib/auth/auth";
import { db } from "@/lib/db";
import { users } from "@/lib/db/schema";
import type { ApiResponse } from "@/lib/types/api";
import { checkRateLimit } from "@/lib/utils/rate-limit";
import { passwordSchema } from "@/lib/validations/auth";

const changePasswordSchema = z.object({
  currentPassword: z.string().min(1, "Senha atual é obrigatória"),
  newPassword: passwordSchema,
});

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  const { allowed, resetIn } = checkRateLimit(`change-password:${session.user.id}`);
  if (!allowed) {
    return NextResponse.json<ApiResponse<null>>(
      {
        success: false,
        error: `Muitas tentativas. Tente novamente em ${Math.ceil(resetIn / 1000)}s`,
      },
      { status: 429 },
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
  const parsed = changePasswordSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  const [user] = await db
    .select({ passwordHash: users.passwordHash })
    .from(users)
    .where(eq(users.id, session.user.id))
    .limit(1);

  if (!user) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Usuário não encontrado" },
      { status: 404 },
    );
  }

  if (!user.passwordHash) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Usuário sem senha cadastrada" },
      { status: 400 },
    );
  }

  const isValid = await compare(parsed.data.currentPassword, user.passwordHash);
  if (!isValid) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Senha atual incorreta" },
      { status: 400 },
    );
  }

  const newHash = await hash(parsed.data.newPassword, 12);
  await db
    .update(users)
    .set({ passwordHash: newHash, mustChangePassword: false, updatedAt: new Date() })
    .where(eq(users.id, session.user.id));

  return NextResponse.json<ApiResponse<{ email: string }>>({
    success: true,
    data: { email: session.user.email },
  });
}
