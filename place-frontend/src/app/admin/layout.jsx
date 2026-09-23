import { AdminShell } from "@/components/admin/layout/AdminShell";
import { getCurrentUser } from "@/services/session";

// TODO (auth): bloquear acesso se o usuário não for ADMIN (middleware ou verificação aqui).
export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  return <AdminShell user={user}>{children}</AdminShell>;
}
