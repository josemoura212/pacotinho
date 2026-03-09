"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef } from "react";
import type { PackageEventName, PackageEventPayload } from "@/lib/events/types";
import { useSocket } from "./use-socket";

const ALL_PACKAGE_EVENTS: PackageEventName[] = [
  "package:created",
  "package:registration_completed",
  "package:updated",
  "package:delivered",
  "package:receipt_confirmed",
];

interface UseRealtimeRefreshOptions {
  events?: PackageEventName[];
  packageId?: string;
}

export function useRealtimeRefresh(options?: UseRealtimeRefreshOptions) {
  const socket = useSocket();
  const router = useRouter();
  const eventsRef = useRef(options?.events ?? ALL_PACKAGE_EVENTS);
  const packageIdRef = useRef(options?.packageId);

  useEffect(() => {
    if (!socket) return;

    const events = eventsRef.current;
    const packageId = packageIdRef.current;

    const handler = (data: PackageEventPayload) => {
      if (packageId && data.id !== packageId) return;
      router.refresh();
    };

    for (const event of events) {
      socket.on(event, handler);
    }

    return () => {
      for (const event of events) {
        socket.off(event, handler);
      }
    };
  }, [socket, router]);
}
