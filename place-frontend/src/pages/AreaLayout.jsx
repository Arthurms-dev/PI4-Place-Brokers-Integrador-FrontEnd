import { Navigate, Outlet } from "react-router-dom";
import { AdminShell } from "@/components/admin/layout/AdminShell";
import { useUsuarioAtual } from "@/hooks/useUsuarioAtual";
import { AREAS, ROLE_HOME } from "@/lib/areas";
import TrocaSenhaObrigatoria from "@/components/auth/TrocaSenhaObrigatoria";
import { comContador, useCandidaturasNovas } from "@/hooks/useCandidaturasNovas";

export default function AreaLayout({ cargo }) {
  const { data: user, loading } = useUsuarioAtual();
  const area = AREAS[cargo];
  const novas = useCandidaturasNovas(cargo === "rh" && user?.cargo === "rh" && !user?.trocarSenha);

  if (loading) {
    return <div className="grid min-h-screen place-items-center text-ink-2">Carregando…</div>;
  }
  if (!user) return <Navigate to="/login" replace />;
  if (user.cargo !== cargo) return <Navigate to={ROLE_HOME[user.cargo] ?? "/acesso-negado"} replace />;
  // Acesso criado pelo admin: troca a senha temporária antes de ver o painel.
  if (user.trocarSenha) return <TrocaSenhaObrigatoria user={user} />;

  return (
    <AdminShell user={user} items={cargo === "rh" ? comContador(area.items, "/rh", novas) : area.items} home={area.home} promo={null}>
      <Outlet context={{ user }} />
    </AdminShell>
  );
}