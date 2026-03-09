import { getIO } from "@/lib/socket/instance";
import { eventBus } from "../event-bus";
import type { PackageEventPayload } from "../types";

export function registerSocketConsumer() {
  const events = [
    "package:created",
    "package:registration_completed",
    "package:updated",
    "package:delivered",
    "package:receipt_confirmed",
  ] as const;

  for (const event of events) {
    eventBus.on(event, (data: PackageEventPayload) => {
      const io = getIO();
      if (!io) return;

      io.to("staff").emit(event, data);

      if (data.residentId) {
        io.to(`user:${data.residentId}`).emit(event, data);
        io.to(`user:${data.residentId}`).emit("notification:new", {
          userId: data.residentId,
        });
      }
    });
  }
}
