import { Navigate, Outlet } from "react-router-dom";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { useUsuarioAtual } from "@/hooks/useUsuarioAtual";
import { AREAS, ROLE_HOME } from "@/lib/areas";

export default function AreaLayout({ cargo }) {
  const { data: user, loading } = useUsuarioAtual();
  const area = AREAS[cargo];

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-ink-2">Carregando…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.cargo !== cargo) return <Navigate to={ROLE_HOME[user.cargo] ?? "/acesso-negado"} replace />;

  return (
    <AdminShell user={user} items={area.items} home={area.home} promo={null}>
      <Outlet context={{ user }} />
    </AdminShell>
  );
}