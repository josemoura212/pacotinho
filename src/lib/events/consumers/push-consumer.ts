import { sendPushToUser } from "@/lib/services/push-service";
import { eventBus } from "../event-bus";
import { withEventPayload } from "./payload";

export function registerPushConsumer() {
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
        await withEventPayload(event, data, (residentId, payload) =>
          sendPushToUser(residentId, payload),
        );
      } catch (err) {
        console.error(`[push-consumer] Falha ao enviar push (${event}):`, err);
      }
    });
  }
}
