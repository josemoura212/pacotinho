"use client";

import { MoreHorizontal } from "lucide-react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { useAppSession } from "@/hooks/use-session";
import { cn } from "@/lib/utils";
import { getNavItemsForRole } from "./nav-items";

const MAX_VISIBLE = 4;

export function MobileNav() {
  const pathname = usePathname();
  const { user } = useAppSession();
  const [sheetOpen, setSheetOpen] = useState(false);

  if (!user) return null;

  const items = getNavItemsForRole(user.role);
  const needsMore = items.length > MAX_VISIBLE;
  const visibleItems = needsMore ? items.slice(0, MAX_VISIBLE) : items;
  const overflowItems = needsMore ? items.slice(MAX_VISIBLE) : [];

  return (
    <>
      <nav className="fixed bottom-0 left-0 right-0 z-50 border-t bg-background pb-[env(safe-area-inset-bottom)] md:hidden">
        <div className="flex items-center justify-around">
          {visibleItems.map((item) => {
            const isActive =
              pathname === item.href || pathname.startsWith(`${item.href}/`);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={cn(
                  "flex flex-col items-center gap-1 px-2 py-2 text-xs transition-colors",
                  isActive
                    ? "text-primary"
                    : "text-muted-foreground hover:text-foreground",
                )}
              >
                <item.icon className="h-5 w-5" />
                <span className="truncate">{item.shortLabel}</span>
              </Link>
            );
          })}
          {needsMore && (
            <button
              type="button"
              onClick={() => setSheetOpen(true)}
              className={cn(
                "flex flex-col items-center gap-1 px-2 py-2 text-xs transition-colors",
                overflowItems.some(
                  (i) => pathname === i.href || pathname.startsWith(`${i.href}/`),
                )
                  ? "text-primary"
                  : "text-muted-foreground hover:text-foreground",
              )}
            >
              <MoreHorizontal className="h-5 w-5" />
              <span>Mais</span>
            </button>
          )}
        </div>
      </nav>

      <Sheet open={sheetOpen} onOpenChange={setSheetOpen}>
        <SheetContent side="bottom" showCloseButton={false}>
          <SheetHeader className="pb-0">
            <SheetTitle>Menu</SheetTitle>
            <SheetDescription className="sr-only">
              Opções adicionais de navegação
            </SheetDescription>
          </SheetHeader>
          <div className="flex flex-col gap-1 px-4 pb-4">
            {overflowItems.map((item) => {
              const isActive =
                pathname === item.href || pathname.startsWith(`${item.href}/`);
              return (
                <Link
                  key={item.href}
                  href={item.href}
                  onClick={() => setSheetOpen(false)}
                  className={cn(
                    "flex items-center gap-3 rounded-md px-3 py-3 text-sm transition-colors",
                    isActive
                      ? "bg-primary/10 text-primary font-medium"
                      : "text-foreground hover:bg-accent",
                  )}
                >
                  <item.icon className="h-5 w-5" />
                  {item.label}
                </Link>
              );
            })}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
