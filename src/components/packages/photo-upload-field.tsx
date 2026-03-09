"use client";

import { Camera, Expand, ImageUp, X } from "lucide-react";
import { useRef, useState } from "react";
import { toast } from "sonner";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";

interface PhotoUploadFieldProps {
  photoPreview: string | null;
  onPhotoChange: (filename: string | null, preview: string | null) => void;
}

export function PhotoUploadField({ photoPreview, onPhotoChange }: PhotoUploadFieldProps) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const galleryInputRef = useRef<HTMLInputElement>(null);

  async function handleUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const formData = new FormData();
      formData.append("file", file);

      const res = await fetch("/api/upload", { method: "POST", body: formData });
      const result = await res.json();

      if (!result.success) {
        toast.error(result.error);
        return;
      }

      if (photoPreview?.startsWith("blob:")) {
        URL.revokeObjectURL(photoPreview);
      }

      onPhotoChange(result.data.filename, URL.createObjectURL(file));
      toast.success("Foto anexada!");
    } catch {
      toast.error("Erro ao enviar foto. Tente novamente.");
    }
  }

  function handleRemove() {
    if (photoPreview?.startsWith("blob:")) {
      URL.revokeObjectURL(photoPreview);
    }
    onPhotoChange(null, null);
  }

  return (
    <div className="space-y-2">
      <Label>Foto da encomenda</Label>
      <div className="flex items-center gap-4">
        <label className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-accent">
          <Camera className="h-4 w-4" />
          Tirar foto
          <input
            type="file"
            accept="image/*"
            capture="environment"
            className="hidden"
            onChange={handleUpload}
          />
        </label>
        <button
          type="button"
          className="flex cursor-pointer items-center gap-2 rounded-md border border-dashed px-4 py-3 text-sm text-muted-foreground hover:bg-accent"
          onClick={() => galleryInputRef.current?.click()}
        >
          <ImageUp className="h-4 w-4" />
          Escolher arquivo
        </button>
        <input
          ref={galleryInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={handleUpload}
        />
      </div>
      {photoPreview && (
        <div className="relative inline-block">
          <img
            src={photoPreview}
            alt="Preview"
            className="h-24 w-24 cursor-pointer rounded object-cover transition-opacity hover:opacity-80"
            onClick={() => setDialogOpen(true)}
          />
          <button
            type="button"
            className="absolute -right-2 -top-2 rounded-full bg-destructive p-1 text-destructive-foreground shadow-sm hover:bg-destructive/90"
            onClick={handleRemove}
          >
            <X className="h-3 w-3" />
          </button>
          <button
            type="button"
            className="absolute -bottom-1 -right-1 rounded-full bg-background p-1 shadow-sm border hover:bg-accent"
            onClick={() => setDialogOpen(true)}
          >
            <Expand className="h-3 w-3" />
          </button>
          <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
            <DialogContent className="max-w-[95vw] max-h-[95vh] p-2 sm:max-w-3xl">
              <DialogTitle className="sr-only">Foto da encomenda</DialogTitle>
              <img
                src={photoPreview}
                alt="Foto da encomenda"
                className="max-h-[85vh] w-full rounded object-contain"
              />
            </DialogContent>
          </Dialog>
        </div>
      )}
    </div>
  );
}
