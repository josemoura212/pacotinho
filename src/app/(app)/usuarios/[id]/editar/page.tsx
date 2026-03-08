import { auth } from "@/lib/auth/auth";
import { redirect, notFound } from "next/navigation";
import { getUserById } from "@/lib/services/user-service";
import { UserForm } from "@/components/users/user-form";

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
    <UserForm
      mode="edit"
      userId={user.id}
      defaultValues={{
        name: user.name,
        email: user.email,
        role: user.role,
        phone: user.phone,
        apartment: user.apartment,
        block: user.block,
        active: user.active,
      }}
    />
  );
}
