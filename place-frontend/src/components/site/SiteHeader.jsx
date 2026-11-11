import { useUsuarioAtual } from "@/hooks/useUsuarioAtual";
import { ROLE_HOME } from "@/lib/areas";
import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { useContato } from "./ContatoProvider";

// Ordem do menu: o que o cliente procura primeiro (comprar na planta, pronto), depois quem somos.
const MENU = [
  { rotulo: "Lançamentos", secao: "lista" },
  { rotulo: "Prontos e seminovos", para: "/prontos" },
  { rotulo: "Cidades", secao: "cidades" },
  { rotulo: "Sobre nós", para: "/sobre" },
  { rotulo: "Contato", para: "/contato" },
];

export default function SiteHeader() {
  const { abrirContato } = useContato();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [rolou, setRolou] = useState(false);
  const { data: usuarioLogado } = useUsuarioAtual();
  const naHome = pathname === "/" || pathname.startsWith("/imoveis/");

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 40);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);
  useEffect(() => setMenu(false), [pathname]);

  // Na home, o logo grande fica no topo da página; o do header só aparece quando ele sai da tela.
  const [logoDaHomeVisivel, setLogoDaHomeVisivel] = useState(false);
  useEffect(() => {
    setLogoDaHomeVisivel(false);
    if (pathname !== "/" || typeof IntersectionObserver === "undefined") return undefined;
    let observador;
    let tentativas = 0;
    let temporizador;
    const observar = () => {
      const alvo = document.getElementById("pb-logo-hero");
      if (!alvo) {
        if (++tentativas < 30) temporizador = window.setTimeout(observar, 100);
        return;
      }
      observador = new IntersectionObserver(([e]) => setLogoDaHomeVisivel(e.isIntersecting), { rootMargin: "-72px 0px 0px 0px" });
      observador.observe(alvo);
    };
    temporizador = window.setTimeout(observar, 0);
    return () => { window.clearTimeout(temporizador); observador?.disconnect(); };
  }, [pathname]);
  const esconderLogo = logoDaHomeVisivel && !menu;

  const destinoAreaRestrita = usuarioLogado ? (ROLE_HOME[usuarioLogado.cargo] ?? "/login") : "/login";
  const textoAreaRestrita = usuarioLogado ? "Voltar ao painel" : "Área restrita";

  function irPara(id) {
    setMenu(false);
    if (naHome) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    else navigate("/", { state: { rolar: id } });
  }

  const ativo = (item) => Boolean(item.para) && pathname.startsWith(item.para);
  const compacto = rolou || menu;

  const linkDesktop = (item) =>
    `relative rounded-lg px-3 py-2 text-[14px] font-medium transition-colors after:absolute after:inset-x-3 after:-bottom-0.5 after:h-0.5 after:origin-left after:rounded-full after:bg-gold after:transition-transform after:duration-300 hover:text-ink hover:after:scale-x-100 ${
      ativo(item) ? "text-ink after:scale-x-100" : "text-ink-2 after:scale-x-0"
    }`;

  return (
    <header
      className={`sticky top-0 z-40 border-b transition-[background-color,border-color,box-shadow] duration-500 ${
        compacto ? "border-line-soft bg-page/92 shadow-[0_10px_30px_-14px_rgba(0,0,0,0.55)] backdrop-blur-md" : "border-transparent bg-page/40 backdrop-blur-sm"
      }`}
    >
      <div className={`mx-auto flex max-w-7xl items-center gap-3 px-4 transition-[height] duration-500 sm:px-6 ${compacto || esconderLogo ? "h-[72px]" : "h-[84px] lg:h-[104px]"}`}>
        {/* Logo grande à esquerda (pedido da diretoria); diminui um pouco ao rolar a página. */}
        <Link to="/" aria-label="Place Brokers - início" aria-hidden={esconderLogo || undefined} tabIndex={esconderLogo ? -1 : undefined}
          className={`mr-2 shrink-0 transition-[opacity,transform] duration-500 lg:mr-6 ${esconderLogo ? "pointer-events-none -translate-y-2 scale-90 opacity-0" : "opacity-100"}`}>
          <Logo className={`transition-[height] duration-500 ${compacto ? "h-12 sm:h-[52px]" : "h-14 sm:h-16 lg:h-[76px]"}`} />
        </Link>

        <nav aria-label="Principal" className="hidden items-center gap-0.5 lg:flex">
          {MENU.map((item) =>
            item.para ? (
              <Link key={item.rotulo} to={item.para} aria-current={ativo(item) ? "page" : undefined} className={linkDesktop(item)}>{item.rotulo}</Link>
            ) : (
              <button key={item.rotulo} type="button" onClick={() => irPara(item.secao)} className={linkDesktop(item)}>{item.rotulo}</button>
            )
          )}
        </nav>

        <div className="ml-auto flex items-center gap-2 sm:gap-3">
          <Link to={destinoAreaRestrita} className="hidden items-center gap-1.5 rounded-lg px-2 py-2 text-[13px] text-ink-3 transition-colors hover:text-ink xl:inline-flex">
            <Icon name="user" className="size-4" /> {textoAreaRestrita}
          </Link>
          <button
            type="button"
            onClick={() => abrirContato(null, "cabeçalho")}
            className="inline-flex h-11 items-center gap-2 rounded-full bg-gold-gradient px-4 text-[13px] font-semibold text-[#1a1408] shadow-[0_8px_20px_-10px_rgba(201,165,76,0.8)] transition hover:-translate-y-0.5 hover:brightness-110 active:scale-95 sm:px-5 sm:text-[14px]"
          >
            <Icon name="messageCircle" className="size-4.5" />
            <span className="hidden sm:inline">Fale com especialista</span>
            <span className="sm:hidden">Especialista</span>
          </button>
          <button
            type="button"
            onClick={() => setMenu((v) => !v)}
            aria-expanded={menu}
            aria-controls="menu-site"
            aria-label={menu ? "Fechar menu" : "Abrir menu"}
            className="grid size-11 place-items-center rounded-full border border-line transition-colors hover:border-gold lg:hidden"
          >
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menu && (
        <nav id="menu-site" aria-label="Menu" className="animate-fade-in border-t border-line-soft px-4 pb-5 pt-2 lg:hidden">
          {MENU.map((item) => {
            const classe = `flex h-12 w-full items-center justify-between rounded-xl px-3 text-left text-[16px] transition-colors hover:bg-card ${ativo(item) ? "bg-card text-gold" : "text-ink"}`;
            const seta = <Icon name="chevronRight" className="size-4 text-ink-3" />;
            return item.para ? (
              <Link key={item.rotulo} to={item.para} aria-current={ativo(item) ? "page" : undefined} className={classe}>{item.rotulo}{seta}</Link>
            ) : (
              <button key={item.rotulo} type="button" onClick={() => irPara(item.secao)} className={classe}>{item.rotulo}{seta}</button>
            );
          })}
          <div className="mt-3 grid gap-2 border-t border-line-soft pt-3">
            <button type="button" onClick={() => { setMenu(false); abrirContato(null, "menu do celular"); }} className="h-12 rounded-xl bg-gold-gradient text-[15px] font-semibold text-[#1a1408]">
              Fale com um especialista
            </button>
            <Link to={destinoAreaRestrita} className="flex h-12 items-center justify-center gap-2 rounded-xl border border-line text-[14px] text-ink-2">
              <Icon name="user" className="size-4" /> {textoAreaRestrita}
            </Link>
          </div>
        </nav>
      )}
    </header>
  );
}
