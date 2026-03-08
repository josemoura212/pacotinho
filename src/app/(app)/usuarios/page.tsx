import { auth } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import { listUsers } from "@/lib/services/user-service";
import { UserList } from "@/components/users/user-list";

export default async function UsuariosPage() {
  const session = await auth();
  if (!session || session.user.role !== "ADMIN") redirect("/dashboard");

  const users = await listUsers();

  return <UserList users={users} />;
}
