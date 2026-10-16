import { useEffect, useState } from "react";
import { Link, useLocation, useNavigate } from "react-router-dom";
import { Logo } from "@/components/ui/Logo";
import { useContato } from "./ContatoProvider";

const SECOES = [["Lançamentos", "lista"], ["Cidades", "cidades"], ["Como funciona", "como-funciona"]];
const PAGINAS = [["Sobre nós", "/sobre"], ["Contato", "/contato"]];

export default function SiteHeader() {
  const { abrirContato } = useContato();
  const { pathname } = useLocation();
  const navigate = useNavigate();
  const [menu, setMenu] = useState(false);
  const [rolou, setRolou] = useState(false);
  const naHome = pathname === "/" || pathname.startsWith("/imoveis/");

  useEffect(() => {
    const aoRolar = () => setRolou(window.scrollY > 24);
    aoRolar();
    window.addEventListener("scroll", aoRolar, { passive: true });
    return () => window.removeEventListener("scroll", aoRolar);
  }, []);
  useEffect(() => setMenu(false), [pathname]);

  function irPara(id) {
    setMenu(false);
    if (naHome) document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
    else navigate("/", { state: { rolar: id } });
  }

  const link = "rounded-lg px-3 py-2 text-[13px] text-ink-2 transition-colors hover:text-ink";

  return (
    <header className={`sticky top-0 z-40 border-b transition-colors duration-300 ${rolou || menu ? "border-line-soft bg-page/90 backdrop-blur" : "border-transparent bg-page/30 backdrop-blur-sm"}`}>
      <div className="mx-auto flex h-16 max-w-6xl items-center gap-2 px-4 sm:px-6">
        <Link to="/" aria-label="Place Brokers - início" className="mr-4 shrink-0"><Logo className="h-9" /></Link>

        <nav aria-label="Principal" className="hidden items-center md:flex">
          {SECOES.map(([rotulo, id]) => <button key={id} type="button" onClick={() => irPara(id)} className={link}>{rotulo}</button>)}
          {PAGINAS.map(([rotulo, para]) => <Link key={para} to={para} className={link}>{rotulo}</Link>)}
        </nav>

        <div className="ml-auto flex items-center gap-2">
          <Link to="/login" className="hidden rounded-lg px-3 py-2 text-[13px] text-ink-3 transition-colors hover:text-ink lg:inline">Área restrita</Link>
          <button type="button" onClick={() => abrirContato(null, "cabeçalho")} className="h-10 rounded-full bg-gold-gradient px-4 text-[13px] font-semibold text-[#1a1408] transition hover:brightness-110 sm:px-5">
            <span className="hidden sm:inline">Fale com especialista</span>
            <span className="sm:hidden">Especialista</span>
          </button>
          <button type="button" onClick={() => setMenu((v) => !v)} aria-expanded={menu} aria-label={menu ? "Fechar menu" : "Abrir menu"} className="grid size-11 place-items-center rounded-full border border-line md:hidden">
            <svg viewBox="0 0 24 24" className="size-5" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" aria-hidden="true">
              {menu ? <path d="M6 6l12 12M18 6L6 18" /> : <path d="M4 7h16M4 12h16M4 17h16" />}
            </svg>
          </button>
        </div>
      </div>

      {menu && (
        <nav aria-label="Menu" className="animate-fade-in border-t border-line-soft px-4 pb-4 pt-2 md:hidden">
          {SECOES.map(([rotulo, id]) => <button key={id} type="button" onClick={() => irPara(id)} className="block h-12 w-full rounded-lg px-3 text-left text-[15px] text-ink-2 hover:bg-card">{rotulo}</button>)}
          {PAGINAS.map(([rotulo, para]) => <Link key={para} to={para} className="flex h-12 items-center rounded-lg px-3 text-[15px] text-ink-2 hover:bg-card">{rotulo}</Link>)}
          <Link to="/login" className="flex h-12 items-center rounded-lg px-3 text-[15px] text-ink-3 hover:bg-card">Área restrita</Link>
        </nav>
      )}
    </header>
  );
}
