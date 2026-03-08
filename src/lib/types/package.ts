import type { InferSelectModel } from "drizzle-orm";
import type { packages } from "@/lib/db/schema";

export type Package = InferSelectModel<typeof packages>;

export type PackageStatus =
  | "REGISTRO_PENDENTE"
  | "ENTREGA_PENDENTE"
  | "ENTREGA_CONCLUIDA";

export type AuditAction =
  | "CRIACAO"
  | "EDICAO"
  | "MUDANCA_STATUS"
  | "ENTREGA_CONCLUIDA"
  | "CONFIRMACAO_RECEBIMENTO";
