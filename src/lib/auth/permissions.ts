import type { UserRole } from "@/lib/types/user";

type Resource =
  | "dashboard"
  | "packages:create"
  | "packages:list"
  | "packages:list-all"
  | "packages:edit"
  | "packages:deliver"
  | "packages:confirm"
  | "packages:pending-registration"
  | "residents:list"
  | "residents:create"
  | "users:list"
  | "users:create"
  | "users:edit"
  | "users:delete"
  | "users:reset-password"
  | "reports:view";

const permissionsMap: Record<UserRole, Set<Resource>> = {
  ADMIN: new Set([
    "dashboard",
    "packages:create",
    "packages:list",
    "packages:list-all",
    "packages:edit",
    "packages:deliver",
    "packages:confirm",
    "packages:pending-registration",
    "residents:list",
    "residents:create",
    "users:list",
    "users:create",
    "users:edit",
    "users:delete",
    "users:reset-password",
    "reports:view",
  ]),
  PORTEIRO: new Set([
    "dashboard",
    "packages:create",
    "packages:list",
    "packages:list-all",
    "packages:edit",
    "packages:deliver",
    "packages:pending-registration",
    "residents:list",
    "residents:create",
  ]),
  MORADOR: new Set(["dashboard", "packages:list", "packages:confirm"]),
};

export function hasPermission(role: UserRole, resource: Resource): boolean {
  return permissionsMap[role]?.has(resource) ?? false;
}

const routePermissions: Record<string, Resource> = {
  "/dashboard": "dashboard",
  "/encomendas/nova": "packages:create",
  "/encomendas/registros-pendentes": "packages:pending-registration",
  "/encomendas/entregas-pendentes": "packages:list",
  "/encomendas/concluidas": "packages:list",
  "/usuarios": "users:list",
  "/usuarios/novo": "users:create",
  "/relatorios": "reports:view",
};

export function getRoutePermission(pathname: string): Resource | null {
  for (const [route, resource] of Object.entries(routePermissions)) {
    if (pathname === route || pathname.startsWith(`${route}/`)) {
      return resource;
    }
  }
  return null;
}
