"use client";

import { Clock } from "lucide-react";
import { useEffect, useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

const actionLabels: Record<string, string> = {
  CRIACAO: "Cadastro",
  EDICAO: "Edição",
  MUDANCA_STATUS: "Mudança de status",
  ENTREGA_CONCLUIDA: "Entrega concluída",
  CONFIRMACAO_RECEBIMENTO: "Recebimento confirmado",
};

interface AuditLog {
  id: string;
  action: string;
  changes: Record<string, unknown> | null;
  createdAt: string;
  userId: string;
  userName: string;
}

export function PackageHistory({ packageId }: { packageId: string }) {
  const [history, setHistory] = useState<AuditLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetch(`/api/packages/${packageId}/history`)
      .then((r) => r.json())
      .then((result) => {
        if (result.success) setHistory(result.data);
      })
      .finally(() => setIsLoading(false));
  }, [packageId]);

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Histórico de Movimentações</CardTitle>
      </CardHeader>
      <CardContent>
        {isLoading && <p className="text-sm text-muted-foreground">Carregando...</p>}
        {!isLoading && history.length === 0 && (
          <p className="text-sm text-muted-foreground">
            Nenhuma movimentação registrada.
          </p>
        )}
        <div className="space-y-4">
          {history.map((log) => (
            <div key={log.id} className="flex gap-3">
              <div className="flex flex-col items-center">
                <div className="flex h-8 w-8 items-center justify-center rounded-full bg-muted">
                  <Clock className="h-4 w-4" />
                </div>
                <div className="w-px flex-1 bg-border" />
              </div>
              <div className="pb-4">
                <p className="text-sm font-medium">
                  {actionLabels[log.action] || log.action}
                </p>
                <p className="text-xs text-muted-foreground">por {log.userName}</p>
                <p className="text-xs text-muted-foreground">
                  {new Date(log.createdAt).toLocaleString("pt-BR")}
                </p>
              </div>
            </div>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}
