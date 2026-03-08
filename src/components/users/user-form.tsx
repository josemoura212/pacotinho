"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "sonner";
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
import type { UserRole } from "@/lib/types/user";

interface UserFormProps {
  mode: "create" | "edit";
  defaultValues?: {
    name: string;
    email: string;
    role: UserRole;
    phone?: string | null;
    apartment?: string | null;
    block?: string | null;
    active?: boolean;
  };
  userId?: string;
}

export function UserForm({ mode, defaultValues, userId }: UserFormProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);
  const [role, setRole] = useState<UserRole>(defaultValues?.role ?? "MORADOR");
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const formData = new FormData(e.currentTarget);
    const data: Record<string, unknown> = {
      name: formData.get("name"),
      email: formData.get("email"),
      role: formData.get("role"),
      phone: formData.get("phone") || undefined,
      apartment: formData.get("apartment") || undefined,
      block: formData.get("block") || undefined,
    };

    const password = formData.get("password") as string;
    if (password) {
      data.password = password;
    }

    if (mode === "edit") {
      const active = formData.get("active");
      data.active = active === "on";
    }

    const url = mode === "create" ? "/api/users" : `/api/users/${userId}`;
    const method = mode === "create" ? "POST" : "PATCH";

    const response = await fetch(url, {
      method,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(data),
    });

    const result = await response.json();
    setIsLoading(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    if (result.data?.generatedPassword) {
      setGeneratedPassword(result.data.generatedPassword);
      toast.success("Usuário criado! Anote a senha gerada.");
      return;
    }

    toast.success(
      mode === "create"
        ? "Usuário criado com sucesso!"
        : "Usuário atualizado com sucesso!",
    );
    router.push("/usuarios");
    router.refresh();
  }

  if (generatedPassword) {
    return (
      <div className="mx-auto max-w-lg">
        <Card>
          <CardHeader>
            <CardTitle>Usuário Criado</CardTitle>
            <CardDescription>Anote a senha gerada e repasse ao usuário</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="rounded-md border bg-muted p-4 text-center">
              <p className="text-sm text-muted-foreground">Senha gerada</p>
              <p className="mt-1 text-2xl font-mono font-bold tracking-wider">
                {generatedPassword}
              </p>
            </div>
            <p className="text-sm text-muted-foreground">
              O usuário pode alterar a senha depois pelo perfil.
            </p>
            <Button
              className="w-full"
              onClick={() => {
                router.push("/usuarios");
                router.refresh();
              }}
            >
              Concluir
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-lg">
      <Card>
        <CardHeader>
          <CardTitle>{mode === "create" ? "Novo Usuário" : "Editar Usuário"}</CardTitle>
          <CardDescription>
            {mode === "create"
              ? "A senha será gerada automaticamente"
              : "Atualize os dados do usuário"}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="name">Nome completo</Label>
              <Input
                id="name"
                name="name"
                required
                defaultValue={defaultValues?.name}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                name="email"
                type="email"
                required
                defaultValue={defaultValues?.email}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="phone">Telefone</Label>
              <Input
                id="phone"
                name="phone"
                type="tel"
                placeholder="(11) 99999-9999"
                defaultValue={defaultValues?.phone ?? ""}
                disabled={isLoading}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="role">Perfil</Label>
              <select
                id="role"
                name="role"
                value={role}
                onChange={(e) => setRole(e.target.value as UserRole)}
                className="flex h-9 w-full rounded-md border border-input bg-background text-foreground px-3 py-1 text-sm shadow-sm transition-colors focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring"
                disabled={isLoading}
              >
                <option value="MORADOR" className="bg-background text-foreground">
                  Morador
                </option>
                <option value="PORTEIRO" className="bg-background text-foreground">
                  Porteiro
                </option>
                <option value="ADMIN" className="bg-background text-foreground">
                  Administrador
                </option>
              </select>
            </div>

            {role === "MORADOR" && (
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="apartment">Apartamento</Label>
                  <Input
                    id="apartment"
                    name="apartment"
                    required
                    defaultValue={defaultValues?.apartment ?? ""}
                    disabled={isLoading}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="block">Bloco</Label>
                  <Input
                    id="block"
                    name="block"
                    required
                    defaultValue={defaultValues?.block ?? ""}
                    disabled={isLoading}
                  />
                </div>
              </div>
            )}

            {mode === "edit" && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="active"
                  name="active"
                  defaultChecked={defaultValues?.active ?? true}
                  className="h-4 w-4 rounded border-gray-300"
                />
                <Label htmlFor="active">Usuário ativo</Label>
              </div>
            )}

            <div className="flex gap-2 pt-2">
              <Button type="submit" disabled={isLoading} className="flex-1">
                {isLoading
                  ? "Salvando..."
                  : mode === "create"
                    ? "Criar Usuário"
                    : "Salvar Alterações"}
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={() => router.back()}
                disabled={isLoading}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </CardContent>
      </Card>
    </div>
  );
}
