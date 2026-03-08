"use client";

import Link from "next/link";
import { Package } from "lucide-react";
import { UserMenu } from "./user-menu";
import { ThemeToggle } from "./theme-toggle";
import { NotificationBell } from "./notification-bell";

export function Header() {
  return (
    <header className="sticky top-0 z-40 flex h-14 items-center justify-between border-b bg-background px-4 md:px-6">
      <Link href="/dashboard" className="flex items-center gap-2 md:hidden">
        <Package className="h-5 w-5" />
        <span className="font-semibold">Pacotinho</span>
      </Link>
      <div className="hidden md:block" />
      <div className="flex items-center gap-1">
        <NotificationBell />
        <ThemeToggle />
        <UserMenu />
      </div>
    </header>
  );
}
