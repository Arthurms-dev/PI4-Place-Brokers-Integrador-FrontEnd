import { AdminShell } from "@/components/admin/layout/AdminShell";
import { getCurrentUser } from "@/services/session";

export default async function AdminLayout({ children }) {
  const user = await getCurrentUser();
  return <AdminShell user={user}>{children}</AdminShell>;
}
