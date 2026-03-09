import { registerNotificationConsumer } from "./consumers/notification-consumer";
import { registerPushConsumer } from "./consumers/push-consumer";
import { registerSocketConsumer } from "./consumers/socket-consumer";

const globalForConsumers = globalThis as unknown as { consumersRegistered?: boolean };

export function registerConsumers() {
  if (globalForConsumers.consumersRegistered) return;

  registerNotificationConsumer();
  registerPushConsumer();
  registerSocketConsumer();

  globalForConsumers.consumersRegistered = true;
  console.log("[event-bus] Consumers registrados: notification, push, socket");
}
