import type { Server as SocketServer } from "socket.io";

const globalForIO = globalThis as unknown as { io?: SocketServer };

export function getIO(): SocketServer | undefined {
  return globalForIO.io;
}
