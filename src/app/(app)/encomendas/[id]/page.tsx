import { Calendar, FileText, Hash, MapPin, User } from "lucide-react";
import { notFound, redirect } from "next/navigation";
import { PackageActions } from "@/components/packages/package-actions";
import { PackageHistory } from "@/components/packages/package-history";
import { PackagePhoto } from "@/components/packages/package-photo";
import { PackageStatusBadge } from "@/components/packages/package-status-badge";
import { RealtimeRefresh } from "@/components/packages/realtime-refresh";
import { BackButton } from "@/components/ui/back-button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { auth } from "@/lib/auth/auth";
import { getPackageById } from "@/lib/services/package-service";
import type { UserRole } from "@/lib/types/user";
import { formatDateTime } from "@/lib/utils";

export default async function PackageDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");

  const { id } = await params;
  const pkg = await getPackageById(id);
  if (!pkg) notFound();

  const role = session.user.role as UserRole;
  if (role === "MORADOR" && pkg.residentId !== session.user.id) {
    redirect("/dashboard");
  }

  return (
    <div className="mx-auto max-w-2xl space-y-4">
      <RealtimeRefresh packageId={pkg.id} />
      <BackButton fallbackHref="/encomendas/entregas-pendentes" />
      <div className="flex items-center justify-between">
        <h1 className="text-2xl font-bold tracking-tight">Detalhe da Encomenda</h1>
        <PackageStatusBadge status={pkg.status} />
      </div>

      <Card>
        <CardHeader>
          <CardTitle>{pkg.recipientName || "Destinatário não identificado"}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3 text-sm">
          {pkg.apartment && (
            <div className="flex items-center gap-2">
              <MapPin className="h-4 w-4 text-muted-foreground" />
              Bloco {pkg.block} - Apto {pkg.apartment}
            </div>
          )}
          <div className="flex items-center gap-2">
            <Hash className="h-4 w-4 text-muted-foreground" />
            {pkg.trackingCode}
          </div>
          <div className="flex items-center gap-2">
            <Calendar className="h-4 w-4 text-muted-foreground" />
            Registrado em {formatDateTime(pkg.createdAt)}
          </div>
          {pkg.deliveredAt && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Entregue em {formatDateTime(pkg.deliveredAt)}
            </div>
          )}
          {pkg.receivedAt && (
            <div className="flex items-center gap-2">
              <User className="h-4 w-4 text-muted-foreground" />
              Recebimento confirmado em {formatDateTime(pkg.receivedAt)}
            </div>
          )}
          {pkg.notes && (
            <div className="flex items-center gap-2">
              <FileText className="h-4 w-4 text-muted-foreground" />
              {pkg.notes}
            </div>
          )}
          {pkg.photoPath && <PackagePhoto src={`/api/images/${pkg.photoPath}`} />}
        </CardContent>
      </Card>

      <PackageActions pkg={pkg} userRole={role} />
      <PackageHistory packageId={pkg.id} />
    </div>
  );
}
