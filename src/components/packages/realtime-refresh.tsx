"use client";

import { useRealtimeRefresh } from "@/hooks/use-realtime-refresh";
import type { PackageEventName } from "@/lib/events/types";

interface RealtimeRefreshProps {
  events?: PackageEventName[];
  packageId?: string;
}

export function RealtimeRefresh({ events, packageId }: RealtimeRefreshProps) {
  useRealtimeRefresh({ events, packageId });
  return null;
}
