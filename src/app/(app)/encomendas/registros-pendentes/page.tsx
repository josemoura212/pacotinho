import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PackageFilters } from "@/components/packages/package-filters";
import { PackageList } from "@/components/packages/package-list";
import { auth } from "@/lib/auth/auth";
import { listPackages } from "@/lib/services/package-service";
import type { UserRole } from "@/lib/types/user";

export default async function RegistrosPendentesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "MORADOR") redirect("/dashboard");

  const params = await searchParams;
  const pkgs = await listPackages(
    { status: "REGISTRO_PENDENTE", search: params.search },
    session.user.role as UserRole,
    session.user.id,
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Registros Pendentes</h1>
        <p className="text-muted-foreground">Encomendas com dados incompletos</p>
      </div>
      <Suspense>
        <PackageFilters />
      </Suspense>
      <PackageList packages={pkgs} emptyMessage="Nenhum registro pendente." />
    </div>
  );
}
