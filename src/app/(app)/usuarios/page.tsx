import { redirect } from "next/navigation";
import { UserList } from "@/components/users/user-list";
import { auth } from "@/lib/auth/auth";
import { listUsers } from "@/lib/services/user-service";

export default async function UsuariosPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await listUsers();

  return <UserList users={users} />;
}
