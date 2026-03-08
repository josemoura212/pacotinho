import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getPackageHistory } from "@/lib/services/audit-service";
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
  const history = await getPackageHistory(id);

  return NextResponse.json<ApiResponse<typeof history>>({
    success: true,
    data: history,
  });
}
