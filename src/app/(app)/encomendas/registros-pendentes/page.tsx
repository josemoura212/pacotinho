import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { listPackages } from "@/lib/services/package-service";
import { PackageList } from "@/components/packages/package-list";
import type { UserRole } from "@/lib/types/user";

export default async function RegistrosPendentesPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "MORADOR") redirect("/dashboard");

  const pkgs = await listPackages(
    { status: "REGISTRO_PENDENTE" },
    session.user.role as UserRole,
    session.user.id,
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registros Pendentes</h1>
        <p className="text-muted-foreground">Encomendas com dados incompletos</p>
      </div>
      <PackageList packages={pkgs} emptyMessage="Nenhum registro pendente." />
    </div>
  );
}
