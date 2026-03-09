import { type NextRequest, NextResponse } from "next/server";
import { handlers } from "@/lib/auth/auth";
import { checkRateLimit } from "@/lib/utils/rate-limit";

export const { GET } = handlers;

export async function POST(request: NextRequest) {
  const url = new URL(request.url);

  if (url.pathname.includes("/callback/credentials")) {
    const ip = request.headers.get("x-forwarded-for") ?? "unknown";
    const { allowed, resetIn } = checkRateLimit(`auth:${ip}`);
    if (!allowed) {
      return NextResponse.json(
        {
          error: `Muitas tentativas. Tente novamente em ${Math.ceil(resetIn / 1000)}s`,
        },
        { status: 429 },
      );
    }
  }

  return handlers.POST(request);
}
