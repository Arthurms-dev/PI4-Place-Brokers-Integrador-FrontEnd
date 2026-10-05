import { Navigate, Outlet, useLocation } from "react-router-dom";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { ROLE_HOME } from "@/lib/areas";
import { getCurrentUser } from "@/services/session";

const MENU_SIMPLES = [
  { label: "Visão Geral", href: "/admin", icon: "home", end: true },
  { label: "Equipe", href: "/admin/equipe", icon: "team" },
  { label: "Configurações", href: "/admin/configuracoes", icon: "settings" },
];

const MENU_COMPLETO = [
  { label: "Dashboard", href: "/admin/dashboard", icon: "dashboard", end: true },
  { label: "Imóveis", href: "/admin/imoveis", icon: "home" },
  { label: "Leads", href: "/admin/leads", icon: "users" },
  { label: "Clientes", href: "/admin/clientes", icon: "user" },
  { label: "Agendamentos", href: "/admin/agendamentos", icon: "calendar" },
  { label: "Relatórios", href: "/admin/relatorios", icon: "chart" },
  { label: "Equipe", href: "/admin/equipe", icon: "team" },
  { label: "Configurações", href: "/admin/configuracoes", icon: "settings" },
];

export default function AdminLayout() {
  const { pathname } = useLocation();
  const { data: user, loading } = useAsyncData(getCurrentUser);

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-ink-2">Carregando…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.cargo !== "admin") return <Navigate to={ROLE_HOME[user.cargo] ?? "/acesso-negado"} replace />;

  const naVisaoGeral = pathname === "/admin" || pathname === "/admin/";

  return (
    <AdminShell
      user={user}
      items={naVisaoGeral ? MENU_SIMPLES : MENU_COMPLETO}
      home={naVisaoGeral ? "/admin" : "/admin/dashboard"}
      promo={null}
    >
      <Outlet context={{ user }} />
    </AdminShell>
  );
}