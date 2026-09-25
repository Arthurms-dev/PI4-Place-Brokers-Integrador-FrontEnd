import { Outlet } from "react-router-dom";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getCurrentUser } from "@/services/session";

const ADMIN_NAV_ITEMS = [
  { label: "Início", href: "/admin", icon: "home", end: true },
  { label: "Usuários", href: "/admin/usuarios", icon: "users" },
  { label: "Configurações", href: "/admin/configuracoes", icon: "settings" },
];

export default function AdminLayout() {
  const { data: user } = useAsyncData(getCurrentUser);

  if (!user) {
    return <div className="grid min-h-screen place-items-center text-ink-2">Carregando…</div>;
  }

  return (
    <AdminShell user={user} items={ADMIN_NAV_ITEMS} home="/admin" promo={null}>
      <Outlet context={{ user }} />
    </AdminShell>
  );
}