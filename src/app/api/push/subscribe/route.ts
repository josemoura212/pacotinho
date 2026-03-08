import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { saveSubscription, removeSubscription } from "@/lib/services/push-service";
import type { ApiResponse } from "@/lib/types/api";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  const body = await request.json();
  if (!body.endpoint || !body.keys?.p256dh || !body.keys?.auth) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Dados de subscription inválidos" },
      { status: 400 },
    );
  }

  await saveSubscription(session.user.id, body);

  return NextResponse.json<ApiResponse<null>>({ success: true });
}

export async function DELETE(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  const body = await request.json();
  if (!body.endpoint) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Endpoint obrigatório" },
      { status: 400 },
    );
  }

  await removeSubscription(body.endpoint);

  return NextResponse.json<ApiResponse<null>>({ success: true });
}
