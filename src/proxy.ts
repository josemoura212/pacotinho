import { NextResponse } from "next/server";
import { auth } from "@/lib/auth/auth";
import { getRoutePermission, hasPermission } from "@/lib/auth/permissions";
import type { UserRole } from "@/lib/types/user";

const publicPaths = ["/login", "/api/auth"];

export const proxy = auth((req) => {
  const { pathname } = req.nextUrl;

  const isPublic = publicPaths.some(
    (path) => pathname === path || pathname.startsWith(`${path}/`),
  );

  if (isPublic) return NextResponse.next();

  if (!req.auth) {
    const loginUrl = new URL("/login", req.nextUrl.origin);
    loginUrl.searchParams.set("callbackUrl", pathname);
    return NextResponse.redirect(loginUrl);
  }

  if (req.auth.user?.mustChangePassword && pathname !== "/alterar-senha") {
    return NextResponse.redirect(new URL("/alterar-senha", req.nextUrl.origin));
  }

  const role = req.auth.user.role as UserRole;
  const resource = getRoutePermission(pathname);

  if (resource && !hasPermission(role, resource)) {
    return NextResponse.redirect(new URL("/dashboard", req.nextUrl.origin));
  }

  return NextResponse.next();
});

export const config = {
  matcher: [
    "/((?!_next/static|_next/image|favicon.ico|public|sw\\.js|manifest\\.json|offline\\.html|icons/).*)",
  ],
};
