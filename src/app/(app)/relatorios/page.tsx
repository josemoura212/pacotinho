import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { getPackageCounts, listPackages } from "@/lib/services/package-service";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { PackageCard } from "@/components/packages/package-card";
import { BarChart3, AlertTriangle, Truck, CheckCircle } from "lucide-react";

export default async function RelatoriosPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role !== "ADMIN") redirect("/dashboard");

  const counts = await getPackageCounts("ADMIN");
  const incomplete = await listPackages({ status: "REGISTRO_PENDENTE" }, "ADMIN");

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Relatórios</h1>
        <p className="text-muted-foreground">Visão geral do sistema de encomendas</p>
      </div>

      <div className="grid gap-4 sm:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Registros Inconsistentes
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.REGISTRO_PENDENTE}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Entregas Pendentes</CardTitle>
            <Truck className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.ENTREGA_PENDENTE}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.ENTREGA_CONCLUIDA}</div>
          </CardContent>
        </Card>
      </div>

      {incomplete.length > 0 && (
        <div className="space-y-2">
          <h2 className="text-lg font-semibold flex items-center gap-2">
            <BarChart3 className="h-5 w-5" />
            Registros com Inconsistências
          </h2>
          <div className="grid gap-2">
            {incomplete.map((pkg) => (
              <PackageCard
                key={pkg.id}
                pkg={pkg}
                subtitle={[
                  !pkg.recipientName && "Nome ausente",
                  !pkg.apartment && "Apto ausente",
                  !pkg.block && "Bloco ausente",
                  !pkg.photoPath && "Foto ausente",
                ]
                  .filter(Boolean)
                  .join(" · ")}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
