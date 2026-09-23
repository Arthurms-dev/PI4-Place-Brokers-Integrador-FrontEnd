import { Outlet } from "react-router-dom";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getCurrentUser } from "@/services/session";

export default function AdminLayout() {
  const { data: user } = useAsyncData(getCurrentUser);

  if (!user) {
    return <div className="grid min-h-screen place-items-center text-ink-2">Carregando…</div>;
  }

  return (
    <AdminShell user={user}>
      <Outlet context={{ user }} />
    </AdminShell>
  );
}