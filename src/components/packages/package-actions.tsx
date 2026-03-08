"use client";

import { CheckCircle, Truck } from "lucide-react";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import type { Package } from "@/lib/types/package";
import type { UserRole } from "@/lib/types/user";

export function PackageActions({ pkg, userRole }: { pkg: Package; userRole: UserRole }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  async function handleDeliver() {
    setIsLoading(true);
    const res = await fetch(`/api/packages/${pkg.id}/deliver`, { method: "POST" });
    const result = await res.json();
    setIsLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Entrega registrada!");
    router.refresh();
  }

  async function handleConfirm() {
    setIsLoading(true);
    const res = await fetch(`/api/packages/${pkg.id}/confirm`, { method: "POST" });
    const result = await res.json();
    setIsLoading(false);
    if (!result.success) {
      toast.error(result.error);
      return;
    }
    toast.success("Recebimento confirmado!");
    router.refresh();
  }

  const canDeliver =
    pkg.status === "ENTREGA_PENDENTE" &&
    (userRole === "PORTEIRO" || userRole === "ADMIN");
  const canConfirm = pkg.status === "ENTREGA_CONCLUIDA" && !pkg.receivedAt;

  if (!canDeliver && !canConfirm) return null;

  return (
    <div className="flex gap-2">
      {canDeliver && (
        <Button onClick={handleDeliver} disabled={isLoading}>
          <Truck className="mr-2 h-4 w-4" />
          Registrar Entrega
        </Button>
      )}
      {canConfirm && (
        <Button onClick={handleConfirm} disabled={isLoading} variant="outline">
          <CheckCircle className="mr-2 h-4 w-4" />
          Confirmar Recebimento
        </Button>
      )}
    </div>
  );
}
