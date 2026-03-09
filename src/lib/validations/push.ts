import { z } from "zod/v4";

export const pushSubscriptionSchema = z.object({
  endpoint: z.url("Endpoint inválido"),
  keys: z.object({
    p256dh: z.string().min(1, "Chave p256dh obrigatória"),
    auth: z.string().min(1, "Chave auth obrigatória"),
  }),
});

export const pushUnsubscribeSchema = z.object({
  endpoint: z.url("Endpoint inválido"),
});

export type PushSubscriptionInput = z.infer<typeof pushSubscriptionSchema>;
export type PushUnsubscribeInput = z.infer<typeof pushUnsubscribeSchema>;
