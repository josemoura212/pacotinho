"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { ResidentSelector } from "@/components/packages/resident-selector";
import { toast } from "sonner";
import { Camera } from "lucide-react";

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

  async function handlePhotoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    const formData = new FormData();
    formData.append("file", file);

    const res = await fetch("/api/upload", { method: "POST", body: formData });
    const result = await res.json();

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setPhotoFilename(result.data.filename);
    setPhotoPreview(URL.createObjectURL(file));
    toast.success("Foto anexada!");
  }

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const fd = new FormData(e.currentTarget);
    const trackingCode = (fd.get("trackingCode") as string)?.trim() || undefined;
    const notes = (fd.get("notes") as string)?.trim() || undefined;

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
    router.push(isQuick ? "/encomendas/registros-pendentes" : "/encomendas/entregas-pendentes");
    router.refresh();
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
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="trackingCode">
                Código de rastreio
                {!isCompleting && (
                  <span className="ml-1 text-xs text-muted-foreground">(opcional p/ registro rápido)</span>
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
                label={
                  isCompleting
                    ? "Morador"
                    : "Morador (opcional p/ registro rápido)"
                }
              />
            </div>

            <div className="space-y-2">
              <Label>Foto da encomenda</Label>
              <div className="flex items-center gap-4">
                <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-accent">
                  <Camera className="h-4 w-4" />
                  {photoFilename ? "Trocar foto" : "Tirar foto / Upload"}
                  <input
                    type="file"
                    accept="image/*"
                    capture="environment"
                    className="hidden"
                    onChange={handlePhotoUpload}
                  />
                </label>
                {photoPreview && (
                  <img
                    src={photoPreview}
                    alt="Preview"
                    className="h-16 w-16 rounded object-cover"
                  />
                )}
              </div>
            </div>

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

            <Button type="submit" className="w-full" disabled={isLoading}>
              {isLoading
                ? "Salvando..."
                : isCompleting
                  ? "Completar Registro"
                  : "Cadastrar Encomenda"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
