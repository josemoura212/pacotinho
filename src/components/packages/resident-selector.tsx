"use client";

import { Check, Search, UserPlus } from "lucide-react";
import { useMemo, useState } from "react";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface Resident {
  id: string;
  name: string;
  apartment: string | null;
  block: string | null;
}

interface ResidentSelectorProps {
  residents: Resident[];
  selectedId: string | null;
  onSelect: (resident: Resident) => void;
  onResidentCreated: (resident: Resident) => void;
  disabled?: boolean;
  required?: boolean;
  label?: string;
}

export function ResidentSelector({
  residents,
  selectedId,
  onSelect,
  onResidentCreated,
  disabled,
  label = "Morador",
}: ResidentSelectorProps) {
  const [search, setSearch] = useState("");
  const [showDialog, setShowDialog] = useState(false);
  const [showList, setShowList] = useState(false);

  const filtered = useMemo(() => {
    if (!search) return residents;
    const lower = search.toLowerCase();
    return residents.filter(
      (r) =>
        r.name.toLowerCase().includes(lower) ||
        r.apartment?.toLowerCase().includes(lower) ||
        r.block?.toLowerCase().includes(lower),
    );
  }, [residents, search]);

  const selected = residents.find((r) => r.id === selectedId);

  return (
    <div className="space-y-2">
      <Label>{label}</Label>

      {selected ? (
        <div className="flex items-center justify-between rounded-md border p-3">
          <div>
            <p className="text-sm font-medium">{selected.name}</p>
            <p className="text-xs text-muted-foreground">
              Apt {selected.apartment} - Bloco {selected.block}
            </p>
          </div>
          <Button
            type="button"
            variant="ghost"
            size="sm"
            onClick={() => {
              onSelect({ id: "", name: "", apartment: null, block: null });
              setSearch("");
            }}
            disabled={disabled}
          >
            Trocar
          </Button>
        </div>
      ) : (
        <div className="relative">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            placeholder="Buscar morador por nome ou apartamento..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setShowList(true);
            }}
            onFocus={() => setShowList(true)}
            className="pl-9"
            disabled={disabled}
          />
        </div>
      )}

      {!selected && showList && (
        <div className="max-h-48 overflow-y-auto rounded-md border">
          {filtered.length > 0 ? (
            filtered.map((resident) => (
              <button
                key={resident.id}
                type="button"
                className="flex w-full items-center justify-between px-3 py-2 text-left text-sm hover:bg-accent"
                onClick={() => {
                  onSelect(resident);
                  setShowList(false);
                  setSearch("");
                }}
              >
                <div>
                  <p className="font-medium">{resident.name}</p>
                  <p className="text-xs text-muted-foreground">
                    Apt {resident.apartment} - Bloco {resident.block}
                  </p>
                </div>
                {selectedId === resident.id && <Check className="h-4 w-4 text-primary" />}
              </button>
            ))
          ) : (
            <div className="px-3 py-4 text-center text-sm text-muted-foreground">
              Nenhum morador encontrado
            </div>
          )}
          <div className="border-t p-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              className="w-full"
              onClick={() => {
                setShowDialog(true);
                setShowList(false);
              }}
            >
              <UserPlus className="mr-2 h-4 w-4" />
              Cadastrar novo morador
            </Button>
          </div>
        </div>
      )}

      <NewResidentDialog
        open={showDialog}
        onOpenChange={setShowDialog}
        onCreated={(resident, generatedPassword) => {
          onResidentCreated(resident);
          onSelect(resident);
          if (generatedPassword) {
            toast.success(`Senha gerada: ${generatedPassword}`, {
              duration: 15000,
            });
          }
          setShowDialog(false);
        }}
      />
    </div>
  );
}

function NewResidentDialog({
  open,
  onOpenChange,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (resident: Resident, generatedPassword?: string) => void;
}) {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const fd = new FormData(e.currentTarget);
    const data = {
      name: fd.get("name") as string,
      email: fd.get("email") as string,
      phone: fd.get("phone") as string,
      apartment: fd.get("apartment") as string,
      block: fd.get("block") as string,
    };

    const res = await fetch("/api/residents", {
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

    toast.success("Morador cadastrado!");
    onCreated(result.data, result.data.generatedPassword);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Cadastrar Morador</DialogTitle>
          <DialogDescription>A senha será gerada automaticamente</DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="resident-name">Nome</Label>
            <Input
              id="resident-name"
              name="name"
              required
              minLength={2}
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resident-email">E-mail</Label>
            <Input
              id="resident-email"
              name="email"
              type="email"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="resident-phone">Telefone</Label>
            <Input
              id="resident-phone"
              name="phone"
              type="tel"
              placeholder="(11) 99999-9999"
              disabled={isLoading}
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="resident-apartment">Apartamento</Label>
              <Input
                id="resident-apartment"
                name="apartment"
                required
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="resident-block">Bloco</Label>
              <Input id="resident-block" name="block" required disabled={isLoading} />
            </div>
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Cadastrando..." : "Cadastrar"}
          </Button>
        </form>
      </DialogContent>
    </Dialog>
  );
}
