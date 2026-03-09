"use client";

import { createContext, useEffect, useState } from "react";
import { io, type Socket } from "socket.io-client";
import type { SocketEventMap } from "@/lib/events/types";

type TypedSocket = Socket<SocketEventMap, Record<string, never>>;

export const SocketContext = createContext<TypedSocket | null>(null);

export function SocketProvider({ children }: { children: React.ReactNode }) {
  const [socket, setSocket] = useState<TypedSocket | null>(null);

  useEffect(() => {
    const s = io({
      path: "/api/socketio",
      withCredentials: true,
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 10,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
    }) as TypedSocket;

    s.on("connect", () => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[socket.io] Conectado");
      }
    });

    s.on("disconnect", (reason) => {
      if (process.env.NODE_ENV !== "production") {
        console.log("[socket.io] Desconectado:", reason);
      }
    });

    setSocket(s);

    return () => {
      s.disconnect();
    };
  }, []);

  return <SocketContext value={socket}>{children}</SocketContext>;
}
