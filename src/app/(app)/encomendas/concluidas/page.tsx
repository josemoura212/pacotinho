import { redirect } from "next/navigation";
import { Suspense } from "react";
import { PackageFilters } from "@/components/packages/package-filters";
import { PackageList } from "@/components/packages/package-list";
import { RealtimeRefresh } from "@/components/packages/realtime-refresh";
import { auth } from "@/lib/auth/auth";
import { listPackages } from "@/lib/services/package-service";
import type { UserRole } from "@/lib/types/user";

export default async function ConcluidasPage({
  searchParams,
}: {
  searchParams: Promise<{ search?: string; page?: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const params = await searchParams;
  const result = await listPackages(
    {
      status: "ENTREGA_CONCLUIDA",
      search: params.search,
      page: Number(params.page) || 1,
    },
    session.user.role as UserRole,
    session.user.id,
  );

  return (
    <div className="space-y-4">
      <RealtimeRefresh />
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Entregas Concluídas</h1>
        <p className="text-muted-foreground">Encomendas já entregues aos moradores</p>
      </div>
      <Suspense>
        <PackageFilters />
      </Suspense>
      <PackageList
        packages={result.items}
        page={result.page}
        totalPages={result.totalPages}
        total={result.total}
        emptyMessage="Nenhuma entrega concluída."
      />
    </div>
  );
}
