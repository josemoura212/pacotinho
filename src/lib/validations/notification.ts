import { z } from "zod/v4";

export const sendNotificationSchema = z
  .object({
    title: z
      .string()
      .min(1, "Título é obrigatório")
      .max(100, "Título deve ter no máximo 100 caracteres")
      .transform((v) => v.trim()),
    body: z
      .string()
      .min(1, "Mensagem é obrigatória")
      .max(500, "Mensagem deve ter no máximo 500 caracteres")
      .transform((v) => v.trim()),
    recipientId: z.uuid("ID do destinatário inválido").optional(),
    broadcast: z.boolean().default(false),
  })
  .refine((data) => data.broadcast || data.recipientId, {
    message: "Selecione um destinatário ou marque como envio para todos",
  });

export type SendNotificationInput = z.infer<typeof sendNotificationSchema>;
