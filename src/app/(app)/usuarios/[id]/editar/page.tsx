import { notFound, redirect } from "next/navigation";
import { BackButton } from "@/components/ui/back-button";
import { UserForm } from "@/components/users/user-form";
import { auth } from "@/lib/auth/auth";
import { getUserById } from "@/lib/services/user-service";

export default async function EditarUsuarioPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const { id } = await params;
  const user = await getUserById(id);
  if (!user) notFound();

  return (
    <div className="mx-auto max-w-lg space-y-4">
      <BackButton fallbackHref="/usuarios" />
      <UserForm
        mode="edit"
        userId={user.id}
        defaultValues={{
          name: user.name,
          email: user.email ?? "",
          role: user.role,
          phone: user.phone,
          apartment: user.apartment,
          block: user.block,
          active: user.active,
        }}
      />
    </div>
  );
}
