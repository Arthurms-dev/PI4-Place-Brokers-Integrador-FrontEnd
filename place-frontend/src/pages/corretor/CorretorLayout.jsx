import { Navigate, Outlet } from "react-router-dom";
import { AdminShell } from "@/components/layout/AdminShell";
import { useAsyncData } from "@/hooks/useAsyncData";
import { getCurrentUser } from "@/services/session";

const CORRETOR_NAV_ITEMS = [
  { label: "Início", href: "/corretor", icon: "home", end: true },
  { label: "Ver Book e Tabelas", href: "/corretor/books", icon: "book" },
  { label: "Empreendimentos", href: "/corretor/empreendimentos", icon: "building" },
  { label: "Mapa Geral", href: "/corretor/mapa", icon: "map" },
  { label: "Leads", href: "/corretor/leads", icon: "users" },
  { label: "Meus Clientes", href: "/corretor/clientes", icon: "user" },
  { label: "Relatórios", href: "/corretor/relatorios", icon: "chart" },
  { label: "Configurações", href: "/corretor/configuracoes", icon: "settings" },
];

export default function CorretorLayout() {
  const { data: user, loading } = useAsyncData(getCurrentUser);

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-ink-2">Carregando…</div>;
  }
  if (!user) {
    return <Navigate to="/login" replace />;
  }

  return (
    <AdminShell user={user} items={CORRETOR_NAV_ITEMS} home="/corretor" promo={null}>
      <Outlet context={{ user }} />
    </AdminShell>
  );
}