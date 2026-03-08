"use client";

import { KeyRound } from "lucide-react";
import { signIn } from "next-auth/react";
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
import { Label } from "@/components/ui/label";
import { PasswordInput } from "@/components/ui/password-input";

export function ChangePasswordForm() {
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    setIsLoading(true);

    const fd = new FormData(e.currentTarget);
    const newPassword = fd.get("newPassword") as string;
    const confirmPassword = fd.get("confirmPassword") as string;

    if (newPassword !== confirmPassword) {
      toast.error("As senhas não coincidem");
      setIsLoading(false);
      return;
    }

    const res = await fetch("/api/auth/change-password", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        currentPassword: fd.get("currentPassword") as string,
        newPassword,
      }),
    });

    const result = await res.json();

    if (!result.success) {
      toast.error(result.error);
      setIsLoading(false);
      return;
    }

    const signInResult = await signIn("credentials", {
      email: result.data.email,
      password: newPassword,
      redirect: false,
    });

    if (signInResult?.error) {
      setIsLoading(false);
      toast.error("Senha alterada, mas erro ao re-autenticar. Faça login novamente.");
      window.location.href = "/login";
      return;
    }

    toast.success("Senha alterada com sucesso!");
    window.location.href = "/dashboard";
  }

  return (
    <Card className="w-full max-w-sm">
      <CardHeader className="text-center">
        <div className="mx-auto mb-2 flex h-12 w-12 items-center justify-center rounded-lg bg-primary">
          <KeyRound className="h-6 w-6 text-primary-foreground" />
        </div>
        <CardTitle className="text-2xl">Alterar Senha</CardTitle>
        <CardDescription>Defina uma nova senha para acessar o sistema</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="currentPassword">Senha atual</Label>
            <PasswordInput
              id="currentPassword"
              name="currentPassword"
              required
              disabled={isLoading}
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="newPassword">Nova senha</Label>
            <PasswordInput
              id="newPassword"
              name="newPassword"
              required
              minLength={8}
              disabled={isLoading}
              placeholder="Min. 8 chars, 1 maiúsc., 1 núm., 1 especial"
            />
          </div>
          <div className="space-y-2">
            <Label htmlFor="confirmPassword">Confirmar nova senha</Label>
            <PasswordInput
              id="confirmPassword"
              name="confirmPassword"
              required
              minLength={8}
              disabled={isLoading}
            />
          </div>
          <Button type="submit" className="w-full" disabled={isLoading}>
            {isLoading ? "Salvando..." : "Alterar Senha"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}
