import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import logoSemFrase from "@/assets/logo-sem-frase.svg";
import { useEmpreendimentosPublicos } from "@/data/empreendimentosPublicos";
import { useUsuarioAtual } from "@/hooks/useUsuarioAtual";
import { ROLE_HOME } from "@/lib/areas";

// Telas que não fazem sentido para quem já está logado: vai direto para o painel do cargo.
const SO_PARA_VISITANTE = ["/login", "/register"];

function FotoDeDestaque() {
  const { itens } = useEmpreendimentosPublicos();
  const foto = itens.find((i) => i.destaque && i.image) ?? itens.find((i) => i.image) ?? null;
  return (
    <aside aria-hidden="true" className="relative hidden overflow-hidden lg:sticky lg:top-0 lg:block lg:h-screen">
      {foto && (
        <img src={foto.image} alt="" decoding="async" className="animate-fade-in absolute inset-0 size-full object-cover" />
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-page via-page/40 to-page/10" />
      {foto && (
        <p className="absolute bottom-10 left-10 right-10 text-sm text-ink-2">
          <span className="block text-lg font-semibold text-ink">{foto.title}</span>
          {[foto.bairro, foto.city].filter(Boolean).join(" · ")}
        </p>
      )}
    </aside>
  );
}

export function AuthLayout() {
  const { pathname } = useLocation();
  const { data: user } = useUsuarioAtual();
  if (user && SO_PARA_VISITANTE.includes(pathname) && ROLE_HOME[user.cargo]) {
    return <Navigate to={ROLE_HOME[user.cargo]} replace />;
  }

  return (
    <div className="pb-auth grid min-h-screen lg:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
      <FotoDeDestaque />
      <div className="grid place-items-center px-4 py-12 sm:px-6">
        <main className="w-full max-w-sm">
          <div className="mb-8 flex justify-center">
            <Link to="/" aria-label="Place Brokers - início" className="inline-flex min-h-11 items-center">
              <img src={logoSemFrase} alt="Place Brokers" width={600} height={258} decoding="async" className="block h-11 w-auto" />
            </Link>
          </div>
          <Outlet />
        </main>
      </div>
    </div>
  );
}
