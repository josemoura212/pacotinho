import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getFile } from "@/lib/services/upload-service";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ filename: string }> },
) {
  const session = await auth();
  if (!session) {
    return NextResponse.json(
      { success: false, error: "Não autenticado" },
      { status: 401 },
    );
  }

  const { filename } = await params;
  const file = await getFile(filename);

  if (!file) {
    return NextResponse.json(
      { success: false, error: "Imagem não encontrada" },
      { status: 404 },
    );
  }

  return new NextResponse(new Uint8Array(file.buffer), {
    headers: {
      "Content-Type": file.contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
