import { notFound, redirect } from "next/navigation";
import { PackageForm } from "@/components/packages/package-form";
import { BackButton } from "@/components/ui/back-button";
import { auth } from "@/lib/auth/auth";
import { getPackageById } from "@/lib/services/package-service";

export default async function CompletarRegistroPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "MORADOR") redirect("/dashboard");

  const { id } = await params;
  const pkg = await getPackageById(id);

  if (!pkg) notFound();
  if (pkg.status !== "REGISTRO_PENDENTE") redirect(`/encomendas/${id}`);

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <BackButton fallbackHref="/encomendas/registros-pendentes" />
      <PackageForm
        packageId={pkg.id}
        defaultValues={{
          trackingCode: pkg.trackingCode,
          residentId: pkg.residentId,
          photoPath: pkg.photoPath,
          notes: pkg.notes,
        }}
      />
    </div>
  );
}
