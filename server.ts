import { createServer } from "node:http";
import { decode } from "next-auth/jwt";
import next from "next";
import { Server as SocketServer } from "socket.io";
import { env } from "@/lib/env";

const dev = process.env.NODE_ENV !== "production";
const port = Number.parseInt(env.PORT, 10);

const app = next({ dev, hostname: env.HOSTNAME, port });
const handler = app.getRequestHandler();

function parseCookies(header: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const part of header.split(";")) {
    const [key, ...rest] = part.trim().split("=");
    if (key) result[key] = rest.join("=");
  }
  return result;
}

app.prepare().then(() => {
  const httpServer = createServer(handler);

  const io = new SocketServer(httpServer, {
    path: "/api/socketio",
    transports: ["websocket", "polling"],
  });

  io.use(async (socket, next) => {
    try {
      const cookieHeader = socket.handshake.headers.cookie ?? "";
      const cookies = parseCookies(cookieHeader);
      const token = cookies[env.cookieName];

      if (!token) {
        next(new Error("Token não fornecido"));
        return;
      }

      const decoded = await decode({
        token,
        salt: env.cookieName,
        secret: env.AUTH_SECRET,
      });
      if (!decoded?.id || !decoded?.role) {
        next(new Error("Token inválido"));
        return;
      }

      socket.data.userId = decoded.id as string;
      socket.data.role = decoded.role as string;
      next();
    } catch {
      next(new Error("Falha na autenticação"));
    }
  });

  io.on("connection", (socket) => {
    const { userId, role } = socket.data;

    socket.join(`user:${userId}`);

    if (role === "ADMIN" || role === "PORTEIRO") {
      socket.join("staff");
    }
  });

  const globalForIO = globalThis as unknown as { io?: SocketServer };
  globalForIO.io = io;

  httpServer.listen(port, env.HOSTNAME, () => {
    console.log(`> Pacotinho rodando em http://${env.HOSTNAME}:${port}`);
  });
});
