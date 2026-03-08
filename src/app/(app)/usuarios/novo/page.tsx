import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { UserForm } from "@/components/users/user-form";

export default async function NovoUsuarioPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  return <UserForm mode="create" />;
}
