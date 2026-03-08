import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { ChangePasswordForm } from "@/components/auth/change-password-form";

export default async function AlterarSenhaPage() {
  const session = await auth();
  if (!session) redirect("/login");

  return <ChangePasswordForm />;
}
