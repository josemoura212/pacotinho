import type { PackageEventName, PackageEventPayload } from "../types";

export function getEventPayload(
  event: string,
  data: PackageEventPayload,
): { title: string; body: string; url: string } | null {
  if (!data.residentId) return null;

  const name = data.recipientName ?? "Morador";
  const url = `/encomendas/${data.id}`;

  switch (event) {
    case "package:created":
    case "package:registration_completed":
      return {
        title: "Nova encomenda!",
        body: `${name}, você tem uma nova encomenda (${data.trackingCode})`,
        url,
      };
    case "package:updated":
      return {
        title: "Encomenda atualizada",
        body: `${name}, sua encomenda foi atualizada`,
        url,
      };
    case "package:delivered":
      return {
        title: "Encomenda entregue!",
        body: `${name}, sua encomenda foi entregue. Confirme o recebimento.`,
        url,
      };
    case "package:receipt_confirmed":
      return {
        title: "Recebimento confirmado",
        body: `${name}, o recebimento da sua encomenda foi confirmado`,
        url,
      };
    default:
      return null;
  }
}

export async function withEventPayload(
  event: PackageEventName,
  data: PackageEventPayload,
  handler: (
    residentId: string,
    payload: { title: string; body: string; url: string },
  ) => Promise<void>,
) {
  if (!data.residentId) return;
  const payload = getEventPayload(event, data);
  if (!payload) return;
  await handler(data.residentId, payload);
}
