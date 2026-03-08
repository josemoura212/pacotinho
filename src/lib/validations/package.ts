import { z } from "zod/v4";

export const createPackageSchema = z.object({
  trackingCode: z
    .string()
    .max(100)
    .transform((v) => v.trim() || undefined)
    .optional(),
  residentId: z.uuid().optional(),
  photoPath: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const updatePackageSchema = z.object({
  trackingCode: z
    .string()
    .max(100)
    .optional()
    .transform((v) => v?.trim() || undefined),
  residentId: z.uuid().optional(),
  photoPath: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export const completeRegistrationSchema = z.object({
  trackingCode: z
    .string()
    .min(1, "Código de rastreio é obrigatório")
    .max(100)
    .transform((v) => v.trim()),
  residentId: z.uuid("Morador é obrigatório"),
  photoPath: z.string().max(500).optional(),
  notes: z.string().max(1000).optional(),
});

export type CreatePackageInput = z.infer<typeof createPackageSchema>;
export type UpdatePackageInput = z.infer<typeof updatePackageSchema>;
export type CompleteRegistrationInput = z.infer<typeof completeRegistrationSchema>;
