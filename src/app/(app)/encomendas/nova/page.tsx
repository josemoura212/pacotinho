import { redirect } from "next/navigation";
import { PackageForm } from "@/components/packages/package-form";
import { auth } from "@/lib/auth/auth";

export default async function NovaEncomendaPage() {
  const session = await auth();
  if (!session) redirect("/login");
  if (session.user.role === "MORADOR") redirect("/dashboard");

  return <PackageForm />;
}
