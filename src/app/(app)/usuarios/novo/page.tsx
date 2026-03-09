import { redirect } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { UserForm } from "@/components/users/user-form";
import { auth } from "@/lib/auth/auth";

export default async function NovoUsuarioPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <BackButton fallbackHref="/usuarios" />
      <UserForm mode="create" />
    </div>
  );
}
