"use client";

import { Send } from "lucide-react";
import { useEffect, useState } from "react";
import { toast } from "sonner";
import { ResidentSelector } from "@/components/packages/resident-selector";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Resident {
  id: string;
  name: string;
  apartment: string | null;
  block: string | null;
}

export function SendNotificationForm() {
  const [isLoading, setIsLoading] = useState(false);
  const [broadcast, setBroadcast] = useState(false);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [residents, setResidents] = useState<Resident[]>([]);

  useEffect(() => {
    fetch("/api/residents")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setResidents(result.data);
        }
      })
      .catch(() => {});
  }, []);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const fd = new FormData(e.currentTarget);
    const title = (fd.get("title") as string).trim();
    const body = (fd.get("body") as string).trim();

    if (!broadcast && !selectedResident?.id) {
      toast.error("Selecione um destinatário ou marque como envio para todos");
      setIsLoading(false);
      return;
    }

    const payload = {
      title,
      body,
      broadcast,
      recipientId: broadcast ? undefined : selectedResident?.id,
    };

    const res = await fetch("/api/notifications/send", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload),
    });

    const result = await res.json();
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (broadcast) {
      toast.success(`Notificação enviada para ${result.data.sent} moradores`);
    } else {
      toast.success("Notificação enviada!");
    }

    (e.target as HTMLFormElement).reset();
    setSelectedResident(null);
    setBroadcast(false);
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Enviar Notificação</CardTitle>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="title">Título</Label>
            <Input
              id="title"
              name="title"
              required
              maxLength={100}
              placeholder="Título da notificação"
              disabled={isLoading}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="body">Mensagem</Label>
            <Textarea
              id="body"
              name="body"
              required
              maxLength={500}
              placeholder="Escreva a mensagem..."
              disabled={isLoading}
            />
          </div>

          <div className="flex items-center gap-3">
            <input
              type="checkbox"
              id="broadcast"
              checked={broadcast}
              onChange={(e) => {
                setBroadcast(e.target.checked);
                if (e.target.checked) {
                  setSelectedResident(null);
                }
              }}
              className="h-4 w-4 rounded border-input"
              disabled={isLoading}
            />
            <Label htmlFor="broadcast" className="cursor-pointer">
              Enviar para todos os moradores
            </Label>
          </div>

          {!broadcast && (
            <ResidentSelector
              residents={residents}
              selectedId={selectedResident?.id ?? null}
              onSelect={setSelectedResident}
              onResidentCreated={(resident) => {
                setResidents((prev) => [...prev, resident]);
              }}
              disabled={isLoading}
              label="Destinatário"
            />
          )}

          <Button type="submit" className="w-full" disabled={isLoading}>
            <Send className="mr-2 h-4 w-4" />
            {isLoading ? "Enviando..." : "Enviar Notificação"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
