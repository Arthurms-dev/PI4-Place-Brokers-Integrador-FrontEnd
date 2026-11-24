import { useEffect, useState } from "react";
import { Link, Navigate, Outlet, useLocation } from "react-router-dom";
import logoSemFrase from "@/assets/logo-sem-frase.svg";
import { useEmpreendimentosPublicos } from "@/data/empreendimentosPublicos";
import { useUsuarioAtual } from "@/hooks/useUsuarioAtual";
import { ROLE_HOME } from "@/lib/areas";

// Telas que não fazem sentido para quem já está logado: vai direto para o painel do cargo.
const SO_PARA_VISITANTE = ["/login", "/register"];

const TROCA_MS = 7000;
const MAX_FOTOS = 5;

const semMovimento = () => typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;

// Os destaques do catálogo vão passando (troca suave + zoom lento). Com menos de 2 destaques
// completa com outros empreendimentos que têm foto. Quem pede menos movimento vê só a primeira.
function FotoDeDestaque() {
  const { itens } = useEmpreendimentosPublicos();
  const comFoto = itens.filter((i) => i.image);
  const destaques = comFoto.filter((i) => i.destaque);
  const fotos = [...destaques, ...comFoto.filter((i) => !i.destaque)].slice(0, Math.max(2, Math.min(MAX_FOTOS, destaques.length)));
  const [atual, setAtual] = useState(0);
  const [pronto, setPronto] = useState(false);
  const total = fotos.length;

  // Um quadro depois de montar, para a primeira foto também entrar com a transição.
  useEffect(() => {
    if (!total) return undefined;
    const id = window.requestAnimationFrame(() => setPronto(true));
    return () => window.cancelAnimationFrame(id);
  }, [total]);

  useEffect(() => {
    if (total < 2 || semMovimento()) return undefined;
    const id = window.setInterval(() => {
      if (!document.hidden) setAtual((i) => (i + 1) % total);
    }, TROCA_MS);
    return () => window.clearInterval(id);
  }, [total]);

  const indice = total ? atual % total : 0;
  const foto = fotos[indice] ?? null;
  // Só monta a foto da vez, a anterior (que ainda está sumindo) e a próxima (já carregando): as capas são grandes.
  const carregar = (i) => i === indice || i === (indice + 1) % total || i === (indice - 1 + total) % total;

  return (
    <aside aria-hidden="true" className="relative hidden overflow-hidden lg:sticky lg:top-0 lg:block lg:h-screen">
      {fotos.map((f, i) =>
        carregar(i) ? (
          <img
            key={f.id}
            src={f.image}
            alt=""
            decoding="async"
            className={`absolute inset-0 size-full object-cover [transition:opacity_1400ms_ease-out,transform_9s_linear] ${pronto && i === indice ? "scale-[1.08] opacity-100" : "scale-100 opacity-0"}`}
          />
        ) : null
      )}
      <div className="absolute inset-0 bg-gradient-to-t from-page via-page/40 to-page/10" />
      {foto && (
        <div className="absolute bottom-10 left-10 right-10">
          <p key={foto.id} className="animate-fade-up text-sm text-ink-2">
            <span className="block text-lg font-semibold text-ink">{foto.title}</span>
            {[foto.bairro, foto.city].filter(Boolean).join(" · ")}
          </p>
          {total > 1 && (
            <div className="mt-4 flex gap-1.5">
              {fotos.map((f, i) => (
                <span key={f.id} className={`h-1 rounded-full transition-all duration-500 ${i === indice ? "w-8 bg-gold" : "w-4 bg-white/25"}`} />
              ))}
            </div>
          )}
        </div>
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
