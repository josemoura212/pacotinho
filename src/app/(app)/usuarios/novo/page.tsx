import { redirect } from "next/navigation";
import { UserForm } from "@/components/users/user-form";
import { auth } from "@/lib/auth/auth";

export default async function NovoUsuarioPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  return <UserForm mode="create" />;
}
