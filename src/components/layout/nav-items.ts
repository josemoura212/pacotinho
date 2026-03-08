import type { LucideIcon } from "lucide-react";
import {
  BarChart3,
  CheckCircle,
  ClipboardList,
  LayoutDashboard,
  PackagePlus,
  Truck,
  Users,
} from "lucide-react";
import type { UserRole } from "@/lib/types/user";

export interface NavItem {
  label: string;
  shortLabel: string;
  href: string;
  icon: LucideIcon;
  roles: UserRole[];
}

export const navItems: NavItem[] = [
  {
    label: "Dashboard",
    shortLabel: "Início",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["ADMIN", "PORTEIRO", "MORADOR"],
  },
  {
    label: "Nova Encomenda",
    shortLabel: "Nova",
    href: "/encomendas/nova",
    icon: PackagePlus,
    roles: ["ADMIN", "PORTEIRO"],
  },
  {
    label: "Registros Pendentes",
    shortLabel: "Registros",
    href: "/encomendas/registros-pendentes",
    icon: ClipboardList,
    roles: ["ADMIN", "PORTEIRO"],
  },
  {
    label: "Entregas Pendentes",
    shortLabel: "Entregas",
    href: "/encomendas/entregas-pendentes",
    icon: Truck,
    roles: ["ADMIN", "PORTEIRO", "MORADOR"],
  },
  {
    label: "Concluídas",
    shortLabel: "Concluídas",
    href: "/encomendas/concluidas",
    icon: CheckCircle,
    roles: ["ADMIN", "PORTEIRO", "MORADOR"],
  },
  {
    label: "Usuários",
    shortLabel: "Usuários",
    href: "/usuarios",
    icon: Users,
    roles: ["ADMIN"],
  },
  {
    label: "Relatórios",
    shortLabel: "Relatórios",
    href: "/relatorios",
    icon: BarChart3,
    roles: ["ADMIN"],
  },
];

export function getNavItemsForRole(role: UserRole): NavItem[] {
  return navItems.filter((item) => item.roles.includes(role));
}
