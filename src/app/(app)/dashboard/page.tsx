import { CheckCircle, ClipboardList, Package, Truck } from "lucide-react";
import Link from "next/link";
import { redirect } from "next/navigation";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import { getPackageCounts } from "@/lib/services/package-service";
import type { UserRole } from "@/lib/types/user";

export default async function DashboardPage() {
  const session = await auth();
  if (!session) redirect("/login");

  const role = session.user.role as UserRole;
  const counts = await getPackageCounts(role, session.user.id);

  const firstName = session.user.name.split(" ")[0];

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Olá, {firstName}!</h1>
        <p className="text-muted-foreground">Painel de gestão de encomendas.</p>
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Total</CardTitle>
            <Package className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{counts.total}</div>
            <CardDescription>encomendas registradas</CardDescription>
          </CardContent>
        </Card>
        {role !== "MORADOR" && (
          <Link href="/encomendas/registros-pendentes">
            <Card className="transition-colors hover:bg-accent/50">
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">Registro Pendente</CardTitle>
                <ClipboardList className="h-4 w-4 text-yellow-500" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">{counts.REGISTRO_PENDENTE}</div>
                <CardDescription>aguardando dados completos</CardDescription>
              </CardContent>
            </Card>
          </Link>
        )}
        <Link href="/encomendas/entregas-pendentes">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Entrega Pendente</CardTitle>
              <Truck className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.ENTREGA_PENDENTE}</div>
              <CardDescription>aguardando entrega</CardDescription>
            </CardContent>
          </Card>
        </Link>
        <Link href="/encomendas/concluidas">
          <Card className="transition-colors hover:bg-accent/50">
            <CardHeader className="flex flex-row items-center justify-between pb-2">
              <CardTitle className="text-sm font-medium">Concluídas</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{counts.ENTREGA_CONCLUIDA}</div>
              <CardDescription>entregas finalizadas</CardDescription>
            </CardContent>
          </Card>
        </Link>
      </div>
    </div>
  );
}
