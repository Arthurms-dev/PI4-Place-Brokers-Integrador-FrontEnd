import { Navigate, Outlet } from "react-router-dom";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { ROLE_HOME } from "@/lib/areas";
import { getCurrentUser } from "@/services/session";

const MENU = [
  { label: "Visão Geral", href: "/admin/painel", icon: "home" },
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard" },
  { label: "Imóveis", href: "/admin/imoveis", icon: "building" },
  { label: "Leads", href: "/admin/leads", icon: "users" },
  { label: "Clientes", href: "/admin/clientes", icon: "user" },
  { label: "Agendamentos", href: "/admin/agendamentos", icon: "calendar" },
  { label: "Vendas", href: "/admin/vendas", icon: "chart" },
  { label: "Relatórios", href: "/admin/relatorios", icon: "chart" },
  { label: "Equipe", href: "/admin/equipe", icon: "team" },
  { label: "Configurações", href: "/admin/configuracoes", icon: "settings" },
];

export default function AdminLayout() {
  const { data: user, loading } = useAsyncData(getCurrentUser);

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-ink-2">Carregando…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.cargo !== "admin") return <Navigate to={ROLE_HOME[user.cargo] ?? "/acesso-negado"} replace />;

  return (
    <AdminShell user={user} items={MENU} home="/admin/dashboard" promo={null}>
      <Outlet context={{ user }} />
    </AdminShell>
  );
}