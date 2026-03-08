import {
  LayoutDashboard,
  PackagePlus,
  ClipboardList,
  Truck,
  CheckCircle,
  Users,
  BarChart3,
} from "lucide-react";
import type { UserRole } from "@/lib/types/user";
import type { LucideIcon } from "lucide-react";

export interface NavItem {
  label: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "PORTEIRO", "MORADOR"],
  },
  {
    label: "Nova Encomenda",
    href: "/encomendas/nova",
    icon: PackagePlus,
    roles: ["ADMIN", "PORTEIRO"],
  },
  {
    label: "Registros Pendentes",
    href: "/encomendas/registros-pendentes",
    icon: ClipboardList,
    roles: ["ADMIN", "PORTEIRO"],
  },
  {
    label: "Entregas Pendentes",
    href: "/encomendas/entregas-pendentes",
    icon: Truck,
    roles: ["ADMIN", "PORTEIRO", "MORADOR"],
  },
  {
    label: "Concluídas",
    href: "/encomendas/concluidas",
    icon: CheckCircle,
    roles: ["ADMIN", "PORTEIRO", "MORADOR"],
  },
  {
    label: "Usuários",
    href: "/usuarios",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    roles: ["ADMIN"],
  },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role));
}
