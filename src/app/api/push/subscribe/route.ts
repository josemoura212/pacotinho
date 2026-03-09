import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { removeSubscription, saveSubscription } from "@/lib/services/push-service";
import type { ApiResponse } from "@/lib/types/api";
import { pushSubscriptionSchema, pushUnsubscribeSchema } from "@/lib/validations/push";

export async function POST(request: Request) {
  const session = await auth();
  if (!session) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  const body = await request.json();
  const parsed = pushSubscriptionSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  await saveSubscription(session.user.id, parsed.data);

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
  const parsed = pushUnsubscribeSchema.safeParse(body);

  if (!parsed.success) {
    return NextResponse.json<ApiResponse<null>>(
      { success: false, error: parsed.error.issues[0].message },
      { status: 400 },
    );
  }

  await removeSubscription(parsed.data.endpoint, session.user.id);

  return NextResponse.json<ApiResponse<null>>({ success: true });
}
