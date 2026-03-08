import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PackageFilters } from "@/components/packages/package-filters";
import { PackageList } from "@/components/packages/package-list";
import { auth } from "@/lib/auth/auth";
import { listPackages } from "@/lib/services/package-service";
import type { UserRole } from "@/lib/types/user";

export default async function EntregasPendentesPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const pkgs = await listPackages(
    { status: "ENTREGA_PENDENTE", search: params.search },
    session.user.role as UserRole,
    session.user.id,
  );

  return (
    <div className="space-y-4">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Entregas Pendentes</h1>
        <p className="text-muted-foreground">Encomendas aguardando entrega ao morador</p>
      </div>
      <Suspense>
        <PackageFilters />
      </Suspense>
      <PackageList packages={pkgs} emptyMessage="Nenhuma entrega pendente." />
    </div>
  );
}
