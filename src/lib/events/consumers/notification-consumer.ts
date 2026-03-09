import { createNotification } from "@/lib/services/notification-service";
import { eventBus } from "../event-bus";
import { withEventPayload } from "./payload";

export function registerNotificationConsumer() {
  const events = [
    "package:created",
    "package:registration_completed",
    "package:updated",
    "package:delivered",
    "package:receipt_confirmed",
  ] as const;

  for (const event of events) {
    eventBus.on(event, async (data) => {
      try {
        await withEventPayload(event, data, async (residentId, payload) => {
          await createNotification(residentId, payload);
        });
      } catch (err) {
        console.error(
          `[notification-consumer] Falha ao criar notificação (${event}):`,
          err,
        );
      }
    });
  }
}
