"use client";

import { Package } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAppSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { getNavItemsForRole } from "./nav-items";

export function Sidebar() {
  const pathname = usePathname();
  const { user } = useAppSession();

  if (!user) return null;

  const items = getNavItemsForRole(user.role);

  return (
    <aside className="hidden w-64 shrink-0 border-r bg-sidebar md:block">
      <Link href="/dashboard" className="flex h-14 items-center gap-2 border-b px-6">
        <Package className="h-5 w-5" />
        <span className="font-semibold">Pacotinho</span>
      </Link>
      <nav className="flex flex-col gap-1 p-4">
        {items.map((item) => {
          const isActive = pathname === item.href || pathname.startsWith(`${item.href}/`);
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors",
                isActive
                  ? "bg-sidebar-accent font-medium text-sidebar-accent-foreground"
                  : "text-sidebar-foreground hover:bg-sidebar-accent/50",
              )}
            >
              <item.icon className="h-4 w-4" />
              {item.label}
            </Link>
          );
        })}
      </nav>
    </aside>
  );
}
