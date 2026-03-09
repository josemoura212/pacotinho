import { redirect } from "next/navigation";
import { PackageForm } from "@/components/packages/package-form";
import { BackButton } from "@/components/ui/back-button";
import { auth } from "@/lib/auth/auth";

export default async function NovaEncomendaPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "MORADOR") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <BackButton fallbackHref="/dashboard" />
      <PackageForm />
    </div>
  );
}
