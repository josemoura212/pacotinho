import { z } from "zod/v4";

export const loginSchema = z.object({
  email: z.email("E-mail inválido").transform((v) => v.trim().toLowerCase()),
  password: z.string().min(1, "Senha é obrigatória"),
});

export const passwordSchema = z
  .string()
  .min(8, "Mínimo 8 caracteres")
  .regex(/[A-Z]/, "Deve conter ao menos 1 letra maiúscula")
  .regex(/[0-9]/, "Deve conter ao menos 1 número")
  .regex(/[^A-Za-z0-9]/, "Deve conter ao menos 1 caractere especial");

export type LoginInput = z.infer<typeof loginSchema>;
