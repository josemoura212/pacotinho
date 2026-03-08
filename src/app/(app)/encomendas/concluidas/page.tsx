import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { listPackages } from "@/lib/services/package-service";
import { PackageList } from "@/components/packages/package-list";
import { PackageFilters } from "@/components/packages/package-filters";
import type { UserRole } from "@/lib/types/user";
import { Suspense } from "react";

export default async function ConcluidasPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const pkgs = await listPackages(
    { status: "ENTREGA_CONCLUIDA", search: params.search },
    session.user.role as UserRole,
    session.user.id,
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Entregas Concluídas</h1>
        <p className="text-muted-foreground">Encomendas já entregues aos moradores</p>
      </div>
      <Suspense>
        <PackageFilters />
      </Suspense>
      <PackageList packages={pkgs} emptyMessage="Nenhuma entrega concluída." />
    </div>
  );
}
