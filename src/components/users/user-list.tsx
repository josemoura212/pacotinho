"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  UserPlus,
  Pencil,
  UserX,
  KeyRound,
  MoreVertical,
  Copy,
  Check,
} from "lucide-react";
import { toast } from "sonner";
import type { UserWithoutPassword } from "@/lib/types/user";

const roleLabels = {
  ADMIN: "Administrador",
  PORTEIRO: "Porteiro",
  MORADOR: "Morador",
} as const;

const roleColors = {
  ADMIN: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-200",
  PORTEIRO: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-200",
  MORADOR: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-200",
} as const;

interface UserListProps {
  users: UserWithoutPassword[];
}

export function UserList({ users }: UserListProps) {
  const router = useRouter();
  const [deleteTarget, setDeleteTarget] = useState<UserWithoutPassword | null>(null);
  const [isDeleting, setIsDeleting] = useState(false);
  const [generatedPassword, setGeneratedPassword] = useState<string | null>(null);
  const [resetTarget, setResetTarget] = useState<string | null>(null);
  const [isResetting, setIsResetting] = useState(false);
  const [copied, setCopied] = useState(false);

  async function handleDelete() {
    if (!deleteTarget) return;
    setIsDeleting(true);

    const res = await fetch(`/api/users/${deleteTarget.id}`, { method: "DELETE" });
    const result = await res.json();
    setIsDeleting(false);
    setDeleteTarget(null);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    toast.success("Usuário desativado");
    router.refresh();
  }

  async function handleResetPassword(userId: string) {
    setIsResetting(true);

    const res = await fetch(`/api/users/${userId}/reset-password`, { method: "POST" });
    const result = await res.json();
    setIsResetting(false);

    if (!result.success) {
      toast.error(result.error);
      return;
    }

    setResetTarget(userId);
    setGeneratedPassword(result.data.generatedPassword);
  }

  async function handleCopyPassword() {
    if (!generatedPassword) return;
    await navigator.clipboard.writeText(generatedPassword);
    setCopied(true);
    toast.success("Senha copiada!");
    setTimeout(() => setCopied(false), 2000);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">Usuários</h1>
          <p className="text-muted-foreground">Gerencie os usuários do sistema</p>
        </div>
        <Button asChild>
          <Link href="/usuarios/novo">
            <UserPlus className="mr-2 h-4 w-4" />
            Novo Usuário
          </Link>
        </Button>
      </div>

      <div className="grid gap-3">
        {users.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Nenhum usuário cadastrado.
            </CardContent>
          </Card>
        )}
        {users.map((user) => (
          <Card key={user.id}>
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <CardTitle className="text-base">{user.name}</CardTitle>
                <div className="flex items-center gap-2">
                  <Badge variant="secondary" className={roleColors[user.role]}>
                    {roleLabels[user.role]}
                  </Badge>
                  {!user.active && <Badge variant="destructive">Inativo</Badge>}
                </div>
              </div>
              <CardDescription>{user.email}</CardDescription>
            </CardHeader>
            <CardContent className="flex items-center justify-between pt-0">
              <div>
                {user.phone && (
                  <p className="text-sm text-muted-foreground">{user.phone}</p>
                )}
                {user.apartment && (
                  <p className="text-sm text-muted-foreground">
                    Apto {user.apartment} - Bloco {user.block}
                  </p>
                )}
              </div>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm">
                    <MoreVertical className="h-4 w-4" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuItem asChild>
                    <Link href={`/usuarios/${user.id}/editar`}>
                      <Pencil className="mr-2 h-4 w-4" />
                      Editar
                    </Link>
                  </DropdownMenuItem>
                  <DropdownMenuItem
                    onClick={() => handleResetPassword(user.id)}
                    disabled={isResetting}
                  >
                    <KeyRound className="mr-2 h-4 w-4" />
                    Resetar senha
                  </DropdownMenuItem>
                  {user.active && (
                    <>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => setDeleteTarget(user)}
                        className="text-destructive"
                      >
                        <UserX className="mr-2 h-4 w-4" />
                        Desativar
                      </DropdownMenuItem>
                    </>
                  )}
                </DropdownMenuContent>
              </DropdownMenu>
            </CardContent>
          </Card>
        ))}
      </div>

      <AlertDialog open={!!deleteTarget} onOpenChange={() => setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Desativar usuário</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja desativar <strong>{deleteTarget?.name}</strong>? O
              usuário não conseguirá mais acessar o sistema.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={isDeleting}>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              disabled={isDeleting}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {isDeleting ? "Desativando..." : "Desativar"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog
        open={!!generatedPassword}
        onOpenChange={() => {
          setGeneratedPassword(null);
          setResetTarget(null);
          setCopied(false);
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Senha resetada</DialogTitle>
            <DialogDescription>
              A nova senha foi gerada. Copie e envie ao usuário. No próximo login, será
              solicitada a troca.
            </DialogDescription>
          </DialogHeader>
          <div className="flex items-center gap-2">
            <code className="flex-1 rounded-md bg-muted px-4 py-3 text-center text-lg font-mono font-bold tracking-widest">
              {generatedPassword}
            </code>
            <Button variant="outline" size="icon" onClick={handleCopyPassword}>
              {copied ? <Check className="h-4 w-4" /> : <Copy className="h-4 w-4" />}
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
