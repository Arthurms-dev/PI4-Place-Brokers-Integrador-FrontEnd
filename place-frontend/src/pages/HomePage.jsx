import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { Logo } from "@/components/ui/Logo";
import { ContatoProvider, useContato } from "@/components/site/ContatoProvider";
import { EmpreendimentoModal } from "@/components/site/EmpreendimentoModal";
import { usePageTitle } from "@/hooks/usePageTitle";
import { registrarEvento } from "@/services/eventos";
import { MOCK_PROPERTIES } from "../data/imoveis";

const INSTAGRAM_URL = "https://www.instagram.com/placebrokers.imobiliaria/";
const EMAIL = "suporte@placebrokers.com.br";
const WHATSAPP_URL = "https://wa.me/5581996298692";
const WHATSAPP_LABEL = "(81) 99629-8692";
const POR_PAGINA = 6;

const norm = (s = "") => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
const cidadeDe = (p) => p.city.split(",")[0].trim(); // "Paulista, PE" -> "Paulista"
const uniq = (lista) => [...new Set(lista)].sort((a, b) => a.localeCompare(b));
const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });
const precoDe = (p) => (p.parcelaAPartir ? `${brl(p.parcelaAPartir)}/mês` : p.price);
const irPara = (id) => document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });

function InstagramIcon({ className }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
      <rect x="3" y="3" width="18" height="18" rx="5" />
      <circle cx="12" cy="12" r="4" />
      <circle cx="17.2" cy="6.8" r="0.9" fill="currentColor" stroke="none" />
    </svg>
  );
}

function Selecao({ valor, onChange, rotulo, children }) {
  return (
    <select
      value={valor}
      onChange={(e) => onChange(e.target.value)}
      aria-label={rotulo}
      className={`h-12 w-full rounded-xl border bg-card-2 px-3 text-sm text-ink outline-none transition-colors focus:border-gold scheme-dark ${
        valor ? "border-gold/60" : "border-line"
      }`}
    >
      <option value="">{rotulo}</option>
      {children}
    </select>
  );
}

function Fotos({ p }) {
  const imagens = p.galeria?.length ? p.galeria : [p.image];
  const [atual, setAtual] = useState(0);
  return (
    <div className="absolute inset-0 overflow-hidden bg-card-2">
      <div
        onScroll={(e) => setAtual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex size-full snap-x snap-mandatory overflow-x-auto [scrollbar-width:none] [&::-webkit-scrollbar]:hidden"
      >
        {imagens.map((src, i) => (
          <img key={src + i} src={src} alt={`${p.title} — foto ${i + 1}`} loading="lazy" decoding="async" className="size-full shrink-0 snap-center object-cover" />
        ))}
      </div>
      <span className="absolute left-3 top-3 rounded-full bg-page/80 px-3 py-1 text-[11px] font-medium text-gold backdrop-blur">{p.type}</span>
      {imagens.length > 1 && (
        <div className="absolute inset-x-0 bottom-3 flex justify-center gap-1.5">
          {imagens.map((_, i) => (
            <span key={i} className={`size-1.5 rounded-full transition-colors ${i === atual ? "bg-white" : "bg-white/40"}`} />
          ))}
        </div>
      )}
    </div>
  );
}

function Specs({ p }) {
  const itens = [
    `${p.bedrooms} ${p.bedrooms === 1 ? "quarto" : "quartos"}`,
    p.bathrooms != null && `${p.bathrooms} ${p.bathrooms === 1 ? "banheiro" : "banheiros"}`,
    p.vagas != null && `${p.vagas} ${p.vagas === 1 ? "vaga" : "vagas"}`,
    p.area,
  ].filter(Boolean);
  return (
    <ul className="mt-3 flex flex-wrap gap-x-4 gap-y-1 text-[13px] text-ink-2">
      {itens.map((t) => <li key={t}>{t}</li>)}
    </ul>
  );
}

function ItemLista({ p, i, onFalar }) {
  const para = `/imoveis/${p.id}`;
  return (
    <article
      style={{ animationDelay: `${Math.min(i, 5) * 60}ms` }}
      className="animate-fade-up overflow-hidden rounded-2xl border border-line bg-card transition-colors hover:border-gold/50 sm:flex"
    >
      <Link to={para} aria-label={`Ver ${p.title}`} className="relative block aspect-16/10 sm:aspect-auto sm:min-h-56 sm:w-72 sm:shrink-0 lg:w-80">
        <Fotos p={p} />
      </Link>
      <div className="flex flex-1 flex-col p-4 sm:p-5">
        {p.parcelaAPartir && <span className="text-[11px] text-ink-3">Parcelas a partir de</span>}
        <div className="text-xl font-semibold text-gold">{precoDe(p)}</div>
        <Link to={para} className="mt-1 text-base font-semibold transition-colors hover:text-gold">{p.title}</Link>
        <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-3">
          <Icon name="mapPin" className="size-3.5" /> {p.city}
        </p>
        <Specs p={p} />
        <p className="mt-2 hidden text-[13px] text-ink-3 sm:line-clamp-2">{p.description}</p>
        <div className="mt-auto flex gap-2 pt-4">
          <button type="button" onClick={() => onFalar(p)} className="h-11 flex-1 rounded-xl bg-gold-gradient px-5 text-sm font-semibold text-[#1a1408] transition hover:brightness-110 sm:flex-none">
            Falar com especialista
          </button>
          <Link to={para} className="inline-flex h-11 items-center justify-center rounded-xl border border-line px-5 text-sm text-ink-2 transition-colors hover:border-gold hover:text-ink">
            Ver detalhes
          </Link>
        </div>
      </div>
    </article>
  );
}

function CardDestaque({ p, i }) {
  return (
    <Link
      to={`/imoveis/${p.id}`}
      style={{ animationDelay: `${i * 70}ms` }}
      className="animate-fade-up group block overflow-hidden rounded-2xl border border-line bg-card transition duration-300 hover:-translate-y-1 hover:border-gold/60 hover:shadow-xl hover:shadow-black/30"
    >
      <div className="relative aspect-16/10 overflow-hidden bg-card-2">
        <img src={p.image} alt={p.title} loading="lazy" decoding="async" className="size-full object-cover transition duration-500 group-hover:scale-105" />
        <span className="absolute left-3 top-3 rounded-full bg-page/80 px-3 py-1 text-[11px] font-medium text-gold backdrop-blur">{p.type}</span>
        <div className="absolute inset-x-0 bottom-0 bg-linear-to-t from-black/85 to-transparent px-4 pb-3 pt-12">
          <div className="text-lg font-semibold text-gold">{precoDe(p)}</div>
        </div>
      </div>
      <div className="p-4">
        <h3 className="truncate text-[15px] font-semibold">{p.title}</h3>
        <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-3"><Icon name="mapPin" className="size-3.5" /> {p.city}</p>
      </div>
    </Link>
  );
}

function Home() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { abrirContato } = useContato();
  const falar = useCallback((p) => abrirContato(p ? { id: p.id, title: p.title } : null), [abrirContato]);

  const aberto = id ? MOCK_PROPERTIES.find((p) => String(p.id) === id) ?? null : null;
  usePageTitle(aberto ? aberto.title : "Início");

  useEffect(() => {
    registrarEvento({ tipo: "visualizacao_site" });
  }, []);
  useEffect(() => {
    if (id && !aberto) navigate("/", { replace: true });
  }, [id, aberto, navigate]);
  const fechar = useCallback(() => navigate("/"), [navigate]);

  const [f, setF] = useState({ busca: "", cidade: "", tipo: "", quartos: "" });
  const [limite, setLimite] = useState(POR_PAGINA);
  const atualizar = (campo, valor) => {
    setF((s) => ({ ...s, [campo]: valor }));
    setLimite(POR_PAGINA);
  };
  const limpar = () => setF({ busca: "", cidade: "", tipo: "", quartos: "" });

  const cidades = useMemo(() => uniq(MOCK_PROPERTIES.map(cidadeDe)), []);
  const tipos = useMemo(() => uniq(MOCK_PROPERTIES.map((p) => p.type)), []);
  const destaques = useMemo(() => {
    const melhores = MOCK_PROPERTIES.filter((p) => ["Destaque", "Lançamento"].includes(p.type)).slice(0, 3);
    return melhores.length ? melhores : MOCK_PROPERTIES.slice(0, 3);
  }, []);

  const resultados = useMemo(() => {
    const q = norm(f.busca.trim());
    return MOCK_PROPERTIES.filter(
      (p) =>
        (!f.cidade || cidadeDe(p) === f.cidade) &&
        (!f.tipo || p.type === f.tipo) &&
        (!f.quartos || p.bedrooms >= Number(f.quartos)) &&
        (!q || norm(`${p.title} ${p.city} ${p.type}`).includes(q)),
    );
  }, [f]);

  const filtrando = Boolean(f.busca || f.cidade || f.tipo || f.quartos);
  const lista = filtrando ? resultados : resultados.filter((p) => !destaques.includes(p));
  const chips = [
    f.busca && ["busca", `“${f.busca}”`],
    f.cidade && ["cidade", f.cidade],
    f.tipo && ["tipo", f.tipo],
    f.quartos && ["quartos", `${f.quartos}+ quartos`],
  ].filter(Boolean);

  return (
    <div className="min-h-screen bg-page text-ink">
      <header className="sticky top-0 z-30 border-b border-line-soft bg-page/90 backdrop-blur">
        <div className="mx-auto flex h-14 max-w-6xl items-center justify-between px-4 sm:h-16 sm:px-6">
          <Link to="/" aria-label="Place Brokers - início"><Logo className="h-8 sm:h-9" /></Link>
          <div className="flex items-center gap-4">
            <Link to="/login" className="hidden text-[13px] text-ink-2 transition-colors hover:text-ink sm:inline">Área restrita</Link>
            <button type="button" onClick={() => falar(null)} className="h-10 rounded-full bg-gold-gradient px-5 text-[13px] font-semibold text-[#1a1408] transition hover:brightness-110">
              Fale com especialista
            </button>
          </div>
        </div>
      </header>

      <section className="relative isolate overflow-hidden border-b border-line-soft">
        {destaques[0] && <img src={destaques[0].image} alt="" fetchPriority="high" className="absolute inset-0 -z-10 size-full object-cover" />}
        <div className="absolute inset-0 -z-10 bg-linear-to-b from-black/70 via-black/55 to-page" />
        <div className="mx-auto max-w-6xl px-4 pb-8 pt-10 sm:px-6 sm:pb-12 sm:pt-16">
          <h1 className="animate-fade-up max-w-2xl text-3xl font-semibold tracking-tight sm:text-5xl">Lançamentos em Pernambuco</h1>
          <p className="animate-fade-up mt-2 max-w-xl text-sm text-ink-2 sm:text-base" style={{ animationDelay: "70ms" }}>
            Escolha o seu e fale com um especialista para conhecer valores e condições.
          </p>

          <form
            onSubmit={(e) => { e.preventDefault(); irPara("lista"); }}
            className="animate-fade-up mt-6 rounded-2xl border border-line bg-card/95 p-3 shadow-2xl shadow-black/40 backdrop-blur sm:p-4"
            style={{ animationDelay: "140ms" }}
          >
            <div className="grid gap-2 md:grid-cols-[1.6fr_1fr_1fr_1fr_auto]">
              <input
                value={f.busca}
                onChange={(e) => atualizar("busca", e.target.value)}
                placeholder="Nome do empreendimento ou região"
                aria-label="Buscar"
                className="h-12 w-full rounded-xl border border-line bg-card-2 px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 focus:border-gold"
              />
              <div className="grid grid-cols-3 gap-2 md:contents">
                <Selecao valor={f.cidade} onChange={(v) => atualizar("cidade", v)} rotulo="Cidade">
                  {cidades.map((c) => <option key={c} value={c}>{c}</option>)}
                </Selecao>
                <Selecao valor={f.tipo} onChange={(v) => atualizar("tipo", v)} rotulo="Tipo">
                  {tipos.map((t) => <option key={t} value={t}>{t}</option>)}
                </Selecao>
                <Selecao valor={f.quartos} onChange={(v) => atualizar("quartos", v)} rotulo="Quartos">
                  <option value="1">1 ou mais</option>
                  <option value="2">2 ou mais</option>
                  <option value="3">3 ou mais</option>
                </Selecao>
              </div>
              <button type="submit" className="h-12 rounded-xl bg-gold-gradient px-8 text-sm font-semibold text-[#1a1408] transition hover:brightness-110">Buscar</button>
            </div>
          </form>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-4 sm:px-6">
        {!filtrando && (
          <section className="pt-8" aria-label="Destaques">
            <h2 className="mb-3 text-lg font-semibold">Em destaque</h2>
            <div className="-mx-4 flex snap-x snap-mandatory gap-4 overflow-x-auto px-4 pb-2 [scrollbar-width:none] sm:mx-0 sm:px-0 [&::-webkit-scrollbar]:hidden">
              {destaques.map((p, i) => (
                <div key={p.id} className="w-[82%] shrink-0 snap-start sm:w-[calc((100%-2rem)/3)]"><CardDestaque p={p} i={i} /></div>
              ))}
            </div>
          </section>
        )}

        <section id="lista" className="scroll-mt-20 pb-14 pt-8">
          <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold">{filtrando ? "Resultados da busca" : "Mais empreendimentos"}</h2>
              <p className="text-[13px] text-ink-3">{resultados.length} {resultados.length === 1 ? "empreendimento" : "empreendimentos"}</p>
            </div>
            {filtrando && <button type="button" onClick={limpar} className="text-[13px] text-gold hover:underline">Limpar filtros</button>}
          </div>

          {chips.length > 0 && (
            <div className="mb-4 flex flex-wrap gap-2">
              {chips.map(([campo, texto]) => (
                <button key={campo} type="button" onClick={() => atualizar(campo, "")} aria-label={`Remover filtro ${texto}`}
                  className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 pl-3.5 pr-2.5 text-[13px] text-gold">
                  {texto} <Icon name="x" className="size-4" />
                </button>
              ))}
            </div>
          )}

          {resultados.length === 0 ? (
            <div className="rounded-2xl border border-line bg-card p-8 text-center text-sm text-ink-2">
              Nenhum empreendimento com esses filtros.
              <button type="button" onClick={limpar} className="ml-1 text-gold hover:underline">Ver todos</button>
              <div className="mt-4">
                <button type="button" onClick={() => falar(null)} className="h-11 rounded-xl border border-line px-5 text-sm hover:border-gold">Falar com um especialista</button>
              </div>
            </div>
          ) : (
            <div className="space-y-4">
              {lista.slice(0, limite).map((p, i) => <ItemLista key={p.id} p={p} i={i} onFalar={falar} />)}
            </div>
          )}

          {lista.length > limite && (
            <button type="button" onClick={() => setLimite((l) => l + POR_PAGINA)} className="mx-auto mt-6 block h-12 rounded-full border border-line px-8 text-sm transition-colors hover:border-gold">
              Ver mais empreendimentos
            </button>
          )}
        </section>
      </main>

      <footer className="border-t border-line-soft pb-24 sm:pb-8">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-6 text-[12px] text-ink-3 sm:flex-row sm:px-6">
          <Logo className="h-7" />
          <div className="flex items-center gap-5">
            <a href={WHATSAPP_URL} target="_blank" rel="noreferrer" className="transition-colors hover:text-gold">{WHATSAPP_LABEL}</a>
            <a href={`mailto:${EMAIL}`} className="transition-colors hover:text-gold">{EMAIL}</a>
            <a href={INSTAGRAM_URL} target="_blank" rel="noreferrer" aria-label="Instagram da Place Brokers" className="transition-colors hover:text-gold"><InstagramIcon className="size-5" /></a>
          </div>
          <p>© 2026 Place Brokers</p>
        </div>
      </footer>

      {aberto && <EmpreendimentoModal imovel={aberto} onClose={fechar} />}
    </div>
  );
}

export default function HomePage() {
  return (
    <ContatoProvider>
      <Home />
    </ContatoProvider>
  );
}