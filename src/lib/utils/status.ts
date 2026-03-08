import type { PackageStatus } from "@/lib/types/package";

const statusLabels: Record<PackageStatus, string> = {
  REGISTRO_PENDENTE: "Registro Pendente",
  ENTREGA_PENDENTE: "Entrega Pendente",
  ENTREGA_CONCLUIDA: "Entrega Concluída",
};

const statusColors: Record<PackageStatus, string> = {
  REGISTRO_PENDENTE: "bg-yellow-100 text-yellow-800",
  ENTREGA_PENDENTE: "bg-blue-100 text-blue-800",
  ENTREGA_CONCLUIDA: "bg-green-100 text-green-800",
};

export function getStatusLabel(status: PackageStatus): string {
  return statusLabels[status];
}

export function getStatusColor(status: PackageStatus): string {
  return statusColors[status];
}
