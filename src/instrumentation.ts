export async function register() {
  if (process.env.NEXT_RUNTIME === "nodejs") {
    const { registerConsumers } = await import("@/lib/events/register-consumers");
    registerConsumers();
  }
}
