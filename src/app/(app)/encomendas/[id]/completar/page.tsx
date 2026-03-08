import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { getPackageById } from "@/lib/services/package-service";
import { PackageForm } from "@/components/packages/package-form";

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
    <PackageForm
      packageId={pkg.id}
      defaultValues={{
        trackingCode: pkg.trackingCode,
        residentId: pkg.residentId,
        photoPath: pkg.photoPath,
        notes: pkg.notes,
      }}
    />
  );
}
