"use client";

import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { toast } from "sonner";
import { DiscardDialog } from "@/components/packages/discard-dialog";
import { PhotoUploadField } from "@/components/packages/photo-upload-field";
import { ResidentSelector } from "@/components/packages/resident-selector";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

interface Resident {
  id: string;
  name: string;
  apartment: string | null;
  block: string | null;
}

interface PackageFormProps {
  packageId?: string;
  defaultValues?: {
    trackingCode?: string | null;
    residentId?: string | null;
    photoPath?: string | null;
    notes?: string | null;
  };
}

export function PackageForm({ packageId, defaultValues }: PackageFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [residents, setResidents] = useState<Resident[]>([]);
  const [selectedResident, setSelectedResident] = useState<Resident | null>(null);
  const [photoFilename, setPhotoFilename] = useState<string | null>(
    defaultValues?.photoPath ?? null,
  );
  const [photoPreview, setPhotoPreview] = useState<string | null>(
    defaultValues?.photoPath ? `/api/images/${defaultValues.photoPath}` : null,
  );
  const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
  const formRef = useRef<HTMLFormElement>(null);

  const isCompleting = !!packageId;

  useEffect(() => {
    fetch("/api/residents")
      .then((res) => res.json())
      .then((result) => {
        if (result.success) {
          setResidents(result.data);
          if (defaultValues?.residentId) {
            const found = result.data.find(
              (r: Resident) => r.id === defaultValues.residentId,
            );
            if (found) setSelectedResident(found);
          }
        }
      })
      .catch(() => {
        toast.error("Erro ao carregar moradores");
      });
  }, [defaultValues?.residentId]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const fd = new FormData(e.currentTarget);
    const trackingCode = (fd.get("trackingCode") as string)?.trim() || undefined;
    const notes = (fd.get("notes") as string)?.trim() || undefined;

    if (!isCompleting && !photoFilename) {
      toast.error("A foto da encomenda é obrigatória");
      setIsLoading(false);
      return;
    }

    if (isCompleting) {
      if (!trackingCode) {
        toast.error("Código de rastreio é obrigatório para completar");
        setIsLoading(false);
        return;
      }
      if (!selectedResident?.id) {
        toast.error("Selecione um morador para completar");
        setIsLoading(false);
        return;
      }

      const res = await fetch(`/api/packages/${packageId}/complete`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          trackingCode,
          residentId: selectedResident.id,
          photoPath: photoFilename,
          notes,
        }),
      });

      const result = await res.json();
      setIsLoading(false);

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      toast.success("Registro completado!");
      router.push("/encomendas/entregas-pendentes");
      router.refresh();
      return;
    }

    const data: Record<string, unknown> = { photoPath: photoFilename, notes };
    if (trackingCode) data.trackingCode = trackingCode;
    if (selectedResident?.id) data.residentId = selectedResident.id;

    const res = await fetch("/api/packages", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await res.json();
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    const isQuick = !trackingCode || !selectedResident?.id;
    toast.success(isQuick ? "Registro rápido criado!" : "Encomenda cadastrada!");
    router.push(
      isQuick ? "/encomendas/registros-pendentes" : "/encomendas/entregas-pendentes",
    );
    router.refresh();
  }

  function hasFormData() {
    if (photoFilename && photoFilename !== defaultValues?.photoPath) return true;
    if (selectedResident && selectedResident.id !== defaultValues?.residentId)
      return true;
    if (!formRef.current) return false;
    const fd = new FormData(formRef.current);
    const trackingCode = (fd.get("trackingCode") as string)?.trim();
    const notes = (fd.get("notes") as string)?.trim();
    if (trackingCode && trackingCode !== (defaultValues?.trackingCode ?? "")) return true;
    if (notes && notes !== (defaultValues?.notes ?? "")) return true;
    return false;
  }

  function handleCancel() {
    if (hasFormData()) {
      setCancelDialogOpen(true);
    } else {
      router.back();
    }
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>{isCompleting ? "Completar Registro" : "Nova Encomenda"}</CardTitle>
          <CardDescription>
            {isCompleting
              ? "Preencha os dados que faltam para completar o registro"
              : "Registre a chegada de uma encomenda. Preencha tudo ou apenas a foto para um registro rápido."}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form ref={formRef} onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trackingCode">
                Código de rastreio
                {!isCompleting && (
                  <span className="ml-1 text-xs text-muted-foreground">
                    (opcional p/ registro rápido)
                  </span>
                )}
              </Label>
              <Input
                id="trackingCode"
                name="trackingCode"
                required={isCompleting}
                disabled={isLoading}
                placeholder="Ex: BR123456789XX"
                defaultValue={defaultValues?.trackingCode ?? ""}
              />
            </div>

            <div>
              <ResidentSelector
                residents={residents}
                selectedId={selectedResident?.id ?? null}
                onSelect={(resident) =>
                  setSelectedResident(resident.id ? resident : null)
                }
                onResidentCreated={(resident) =>
                  setResidents((prev) => [...prev, resident])
                }
                disabled={isLoading}
                required={isCompleting}
                label={isCompleting ? "Morador" : "Morador (opcional p/ registro rápido)"}
              />
            </div>

            <PhotoUploadField
              photoPreview={photoPreview}
              onPhotoChange={(filename, preview) => {
                setPhotoFilename(filename);
                setPhotoPreview(preview);
              }}
            />

            <div className="space-y-2">
              <Label htmlFor="notes">Observação</Label>
              <Textarea
                id="notes"
                name="notes"
                disabled={isLoading}
                placeholder="Ex: Caixa grande, frágil, deixar na portaria..."
                rows={3}
                defaultValue={defaultValues?.notes ?? ""}
              />
            </div>

            <div className="flex gap-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading
                  ? "Salvando..."
                  : isCompleting
                    ? "Completar Registro"
                    : "Cadastrar Encomenda"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleCancel}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>

      <DiscardDialog
        open={cancelDialogOpen}
        onOpenChange={setCancelDialogOpen}
        onDiscard={() => router.back()}
      />
    </div>
  );
}
