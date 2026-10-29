import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { Avatar } from "@/components/ui/Avatar";
import { Icon } from "@/components/ui/Icon";
import { authService } from "@/services/authService";

export function Topbar({ user, menuOpen, onMenuToggle, home = "/admin", items = [] }) {
  const [perfilAberto, setPerfilAberto] = useState(false);
  const { pathname } = useLocation();
  const secao = items.flatMap((item) => [item.href, ...(item.match ?? [])].map((href) => ({ href, label: item.label }))).sort((a, b) => b.href.length - a.href.length).find((c) => pathname === c.href || pathname.startsWith(`${c.href}/`))?.label ?? "Painel";
  const [busca, setBusca] = useState("");
  const resultados = busca.trim() ? items.filter((item) => item.label.toLocaleLowerCase("pt-BR").includes(busca.trim().toLocaleLowerCase("pt-BR"))).slice(0, 6) : [];

  function sair() {
    authService.logout();
    window.location.href = "/login";
  }

  return (
    <header className="pb-topbar sticky top-0 z-10 flex h-[76px] items-center gap-4 border-b border-line-soft bg-page/95 px-4 backdrop-blur-xl sm:gap-6 sm:px-6 lg:px-8">
      <button
        type="button"
        onClick={onMenuToggle}
        aria-label={menuOpen ? "Fechar menu" : "Abrir menu"}
        aria-controls="admin-sidebar"
        aria-expanded={menuOpen}
        className="grid size-9.5 place-items-center rounded-lg border border-line lg:hidden"
      >
        <Icon name="menu" />
      </button>

      <div className="hidden min-w-0 flex-col lg:flex">
        <span className="text-[10px] font-semibold uppercase tracking-[0.17em] text-ink-3">Place Brokers / Plataforma</span>
        <span className="truncate text-[15px] font-semibold text-ink">{secao}</span>
      </div>

      <div role="search" className="relative ml-auto min-w-0 max-w-[340px] flex-1">
        <label className="pb-search flex h-11 items-center gap-3 rounded-xl border border-line bg-card-2 px-3.5 text-ink-3 focus-within:border-gold/60">
          <Icon name="search" className="size-4 shrink-0" />
          <span className="sr-only">Buscar página do painel</span>
          <input
            type="search"
            value={busca}
            onChange={(event) => setBusca(event.target.value)}
            onKeyDown={(event) => { if (event.key === "Escape") setBusca(""); }}
            placeholder="Pesquisar no menu..."
            aria-label="Buscar página do painel"
            aria-controls="pesquisa-navegacao"
            aria-expanded={Boolean(busca.trim())}
            className="min-w-0 w-full bg-transparent text-[13px] text-ink outline-none placeholder:text-ink-3"
          />
        </label>
        {busca.trim() && (
          <div id="pesquisa-navegacao" role="region" aria-label="Resultados da navegação" className="absolute inset-x-0 top-full z-40 mt-2 max-h-72 overflow-auto rounded-xl border border-line bg-card p-1.5 shadow-xl">
            {resultados.length ? resultados.map((item) => (
              <Link key={item.href} to={item.href} onClick={() => setBusca("")} className="flex min-h-11 items-center gap-2.5 rounded-lg px-3 text-[13px] text-ink-2 hover:bg-white/5 hover:text-gold">
                <Icon name={item.icon} className="size-4 shrink-0" />{item.label}
              </Link>
            )) : <p className="px-3 py-3 text-xs text-ink-3">Nenhuma página encontrada.</p>}
          </div>
        )}
      </div>

      <div className="flex items-center gap-3 sm:gap-4">
        <Link to="/" aria-label="Abrir o site publico da Place Brokers"
          className="hidden h-10 shrink-0 items-center gap-2 rounded-lg border border-line px-3 text-[12px] font-medium text-ink-2 transition-colors hover:border-gold/50 hover:text-gold md:inline-flex">
          <Icon name="home" className="size-4" /> Ver site
        </Link>
        {Number(user?.unreadNotifications) > 0 && (
          <span role="status" title="Notificações não lidas" className="flex items-center gap-1.5 text-xs text-gold">
            <Icon name="bell" className="size-4" /> {user.unreadNotifications}
            <span className="sr-only">notificações não lidas</span>
          </span>
        )}

        <div className="relative border-l border-line-soft pl-3 sm:pl-4">
          <button
            type="button"
            onClick={() => setPerfilAberto((v) => !v)}
            aria-haspopup="menu"
            aria-expanded={perfilAberto}
            className="pb-account-button flex items-center gap-3 rounded-xl px-1 py-1 transition-colors hover:bg-white/5"
          >
            <Avatar name={user.name} src={user.avatarUrl} />
            <div className="hidden text-left sm:block">
              <div className="text-[13px] font-medium">{user.name}</div>
              <div className="text-[11px] text-ink-3">{user.role}</div>
            </div>
            <Icon name="chevronDown" className="hidden size-3.5 sm:block" />
          </button>

          {perfilAberto && (
            <>
              <button
                type="button"
                aria-label="Fechar menu de perfil"
                onClick={() => setPerfilAberto(false)}
                className="fixed inset-0 z-20"
              />
              <div className="absolute right-0 top-full z-30 mt-2 w-48 overflow-hidden rounded-lg border border-line bg-card shadow-lg">
                <Link
                  to={`/${home.split("/")[1]}/perfil`}
                  onClick={() => setPerfilAberto(false)}
                  className="flex items-center gap-2.5 px-4 py-3 text-[13px] text-ink hover:bg-white/5"
                >
                  <Icon name="user" className="size-4" /> Ver perfil
                </Link>
                <Link
                  to="/"
                  onClick={() => setPerfilAberto(false)}
                  className="flex items-center gap-2.5 border-t border-line-soft px-4 py-3 text-[13px] text-ink hover:bg-white/5 md:hidden"
                >
                  <Icon name="home" className="size-4" />Ver site
                </Link>
                <button
                  type="button"
                  onClick={sair}
                  className="flex w-full items-center gap-2.5 border-t border-line-soft px-4 py-3 text-left text-[13px] text-danger hover:bg-white/5"
                >
                  <Icon name="arrowRight" className="size-4" /> Sair
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </header>
  );
}