"use client";

import { Bell, CheckCheck } from "lucide-react";
import Link from "next/link";
import { useCallback, useEffect, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

interface Notification {
  id: string;
  title: string;
  body: string;
  url: string | null;
  read: boolean;
  createdAt: string;
}

function timeAgo(dateStr: string): string {
  const now = Date.now();
  const date = new Date(dateStr).getTime();
  const diff = Math.floor((now - date) / 1000);

  if (diff < 60) return "agora";
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

export function NotificationBell() {
  const [open, setOpen] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);
  const [items, setItems] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(false);

  const fetchCount = useCallback(() => {
    fetch("/api/notifications?count=true")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) setUnreadCount(result.data.unread);
      })
      .catch(() => {});
  }, []);

  useEffect(() => {
    fetchCount();
    const interval = setInterval(fetchCount, 30_000);
    return () => clearInterval(interval);
  }, [fetchCount]);

  function handleOpen(isOpen: boolean) {
    setOpen(isOpen);
    if (isOpen) {
      setLoading(true);
      fetch("/api/notifications")
        .then((res) => res.json())
        .then((result) => {
          if (result.success) setItems(result.data);
        })
        .catch(() => {})
        .finally(() => setLoading(false));
    }
  }

  async function handleMarkAllRead() {
    try {
      const res = await fetch("/api/notifications", { method: "POST" });
      const result = await res.json();
      if (!result.success) {
        toast.error("Erro ao marcar notificações como lidas");
        return;
      }
      setItems((prev) => prev.map((n) => ({ ...n, read: true })));
      setUnreadCount(0);
    } catch {
      toast.error("Erro ao marcar notificações como lidas");
    }
  }

  return (
    <>
      <Button
        variant="ghost"
        size="icon"
        className="relative"
        onClick={() => handleOpen(true)}
      >
        <Bell className="h-5 w-5" />
        {unreadCount > 0 && (
          <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-destructive px-1 text-[10px] font-bold text-destructive-foreground">
            {unreadCount > 99 ? "99+" : unreadCount}
          </span>
        )}
        <span className="sr-only">Notificações</span>
      </Button>

      <Sheet open={open} onOpenChange={handleOpen}>
        <SheetContent side="right" className="w-full sm:max-w-md">
          <SheetHeader className="flex-row items-center justify-between pr-6">
            <div>
              <SheetTitle>Notificações</SheetTitle>
              <SheetDescription className="sr-only">
                Lista de notificações
              </SheetDescription>
            </div>
            {items.some((n) => !n.read) && (
              <Button
                variant="ghost"
                size="sm"
                className="gap-1 text-xs"
                onClick={handleMarkAllRead}
              >
                <CheckCheck className="h-3.5 w-3.5" />
                Marcar tudo lido
              </Button>
            )}
          </SheetHeader>

          <div className="flex-1 overflow-y-auto px-4 pb-4">
            {loading && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Carregando...
              </p>
            )}

            {!loading && items.length === 0 && (
              <p className="py-8 text-center text-sm text-muted-foreground">
                Nenhuma notificação
              </p>
            )}

            {!loading && items.length > 0 && (
              <ul className="space-y-1">
                {items.map((item) => {
                  const content = (
                    <div
                      className={cn(
                        "rounded-md px-3 py-3 text-sm transition-colors",
                        item.read ? "text-muted-foreground" : "bg-primary/5 font-medium",
                      )}
                    >
                      <div className="flex items-start justify-between gap-2">
                        <span className="font-semibold">{item.title}</span>
                        <span className="shrink-0 text-xs text-muted-foreground">
                          {timeAgo(item.createdAt)}
                        </span>
                      </div>
                      <p className="mt-0.5 text-xs leading-relaxed">{item.body}</p>
                    </div>
                  );

                  return (
                    <li key={item.id}>
                      {item.url ? (
                        <Link
                          href={item.url}
                          onClick={() => setOpen(false)}
                          className="block hover:bg-accent rounded-md"
                        >
                          {content}
                        </Link>
                      ) : (
                        content
                      )}
                    </li>
                  );
                })}
              </ul>
            )}
          </div>
        </SheetContent>
      </Sheet>
    </>
  );
}
