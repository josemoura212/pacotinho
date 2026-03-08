import { z } from "zod/v4";
import { passwordSchema } from "./auth";

export const createUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter no mínimo 2 caracteres")
      .max(255)
      .transform((v) => v.trim()),
    email: z.email("E-mail inválido").transform((v) => v.trim().toLowerCase()),
    password: passwordSchema.optional(),
    role: z.enum(["MORADOR", "PORTEIRO", "ADMIN"]),
    phone: z
      .string()
      .max(20)
      .optional()
      .transform((v) => v?.trim() || undefined),
    apartment: z
      .string()
      .max(20)
      .optional()
      .transform((v) => v?.trim() || undefined),
    block: z
      .string()
      .max(20)
      .optional()
      .transform((v) => v?.trim() || undefined),
  })
  .refine(
    (data) => {
      if (data.role === "MORADOR") {
        return !!data.apartment && !!data.block;
      }
      return true;
    },
    {
      message: "Apartamento e bloco são obrigatórios para moradores",
      path: ["apartment"],
    },
  );

export const updateUserSchema = z
  .object({
    name: z
      .string()
      .min(2, "Nome deve ter no mínimo 2 caracteres")
      .max(255)
      .transform((v) => v.trim())
      .optional(),
    email: z
      .email("E-mail inválido")
      .transform((v) => v.trim().toLowerCase())
      .optional(),
    role: z.enum(["MORADOR", "PORTEIRO", "ADMIN"]).optional(),
    phone: z
      .string()
      .max(20)
      .nullable()
      .optional()
      .transform((v) => v?.trim() || null),
    apartment: z
      .string()
      .max(20)
      .nullable()
      .optional()
      .transform((v) => v?.trim() || null),
    block: z
      .string()
      .max(20)
      .nullable()
      .optional()
      .transform((v) => v?.trim() || null),
    active: z.boolean().optional(),
    password: passwordSchema.optional(),
  })
  .refine(
    (data) => {
      if (data.role === "MORADOR") {
        return !!data.apartment && !!data.block;
      }
      return true;
    },
    {
      message: "Apartamento e bloco são obrigatórios para moradores",
      path: ["apartment"],
    },
  );

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
