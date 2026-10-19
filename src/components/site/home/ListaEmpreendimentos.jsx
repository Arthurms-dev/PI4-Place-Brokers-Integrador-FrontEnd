import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { BotaoFavorito, useFavoritos } from "../favoritos";
import Reveal from "../Reveal";
import { Etiquetas, Ficha, Foto } from "./pecas";

const POR_PAGINA = 6;

function Item({ p, i, onFalar }) {
  const para = `/imoveis/${p.id}`;
  return (
    <Reveal atraso={(i % 3) * 60}>
      <article className="pb-property-card group overflow-hidden rounded-2xl border border-line bg-card transition-colors duration-300 hover:border-gold/50 sm:flex">
        <Link to={para} aria-label={`Ver ${p.title}`} className="relative block aspect-16/10 overflow-hidden sm:aspect-auto sm:min-h-56 sm:w-72 sm:shrink-0 lg:w-80">
          <Foto p={p} className="absolute inset-0 size-full object-cover transition duration-700 group-hover:scale-105" />
          <div className="absolute left-3 top-3"><Etiquetas p={p} /></div>
          <BotaoFavorito id={p.id} titulo={p.title} className="absolute right-3 top-3" />
        </Link>
        <div className="flex flex-1 flex-col p-5 sm:p-6">
          <p className="text-[11px] uppercase tracking-wide text-ink-3">{p.preco.startsWith("A partir") ? "A partir de" : "Valores"}</p>
          <p className="text-xl font-semibold text-gold">{p.preco.replace("A partir de ", "")}</p>
          <Link to={para} className="mt-1 text-base font-semibold transition-colors hover:text-gold">{p.title}</Link>
          <p className="mt-0.5 flex items-center gap-1.5 text-[13px] text-ink-3"><Icon name="mapPin" className="size-3.5 shrink-0" /> {p.bairro ? `${p.bairro} · ` : ""}{p.city}</p>
          <Ficha p={p} className="mt-3" />
          {p.description && <p className="mt-2 hidden text-[13px] text-ink-3 sm:line-clamp-2">{p.description}</p>}
          <div className="mt-auto flex gap-2 pt-4">
            <button type="button" onClick={() => onFalar(p)} className="h-11 flex-1 rounded-xl bg-gold-gradient px-5 text-sm font-semibold text-[#1a1408] transition hover:brightness-110 sm:flex-none">Falar com especialista</button>
            <Link to={para} className="inline-flex h-11 items-center justify-center rounded-xl border border-line px-5 text-sm text-ink-2 transition-colors hover:border-gold hover:text-ink">Ver detalhes</Link>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function ListaEmpreendimentos({ itens, carregando, chips, onRemoverChip, onLimpar, onFalar }) {
  const { ids } = useFavoritos();
  const [ordem, setOrdem] = useState("relevancia");
  const [soFavoritos, setSoFavoritos] = useState(false);
  const [limite, setLimite] = useState(POR_PAGINA);

  const lista = useMemo(() => {
    let l = soFavoritos ? itens.filter((p) => ids.includes(p.id)) : [...itens];
    if (ordem === "menor") l.sort((a, b) => (a.precoMin ?? Infinity) - (b.precoMin ?? Infinity));
    else l.sort((a, b) => Number(b.destaque) - Number(a.destaque));
    return l;
  }, [itens, ordem, soFavoritos, ids]);

  return (
    <section id="lista" aria-labelledby="titulo-lista" className="mx-auto max-w-7xl scroll-mt-20 px-4 pt-16 sm:px-6">
      <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="pb-site-eyebrow">Portfólio Place Brokers</p><h2 id="titulo-lista" className="text-2xl font-semibold sm:text-3xl">{chips.length ? "Resultados da busca" : "Todos os lançamentos"}</h2>
          <p className="mt-1 text-[14px] text-ink-2">{carregando ? "Carregando…" : `${lista.length} ${lista.length === 1 ? "empreendimento" : "empreendimentos"}`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSoFavoritos((v) => !v)} aria-pressed={soFavoritos} className={`h-11 rounded-xl border px-4 text-[13px] transition-colors ${soFavoritos ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
            Favoritos{ids.length ? ` (${ids.length})` : ""}
          </button>
          <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar" className="h-11 rounded-xl border border-line bg-card-2 px-3 text-[13px] text-ink-2 outline-none focus:border-gold scheme-dark">
            <option value="relevancia">Mais relevantes</option>
            <option value="menor">Menor preço</option>
          </select>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {chips.map(([campo, texto]) => (
            <button key={campo} type="button" onClick={() => onRemoverChip(campo)} aria-label={`Remover filtro ${texto}`} className="inline-flex h-9 items-center gap-1.5 rounded-full border border-gold/50 bg-gold/10 pl-3.5 pr-2.5 text-[13px] text-gold">
              {texto} <Icon name="x" className="size-4" />
            </button>
          ))}
          <button type="button" onClick={onLimpar} className="px-2 text-[13px] text-ink-3 underline-offset-2 hover:text-ink hover:underline">Limpar tudo</button>
        </div>
      )}

      {carregando ? (
        <div className="space-y-4" aria-busy="true">{[0, 1, 2].map((i) => <div key={i} className="h-56 animate-pulse rounded-2xl bg-card" />)}</div>
      ) : lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line p-10 text-center">
          <p className="text-ink-2">{soFavoritos ? "Você ainda não favoritou nenhum empreendimento." : "Nenhum empreendimento com esses filtros."}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => { setSoFavoritos(false); onLimpar(); }} className="h-11 rounded-xl border border-line px-5 text-sm hover:border-gold">Ver todos</button>
            <button type="button" onClick={() => onFalar(null)} className="h-11 rounded-xl bg-gold-gradient px-5 text-sm font-semibold text-[#1a1408]">Falar com um especialista</button>
          </div>
        </div>
      ) : (
        <div className="space-y-4">{lista.slice(0, limite).map((p, i) => <Item key={p.id} p={p} i={i} onFalar={onFalar} />)}</div>
      )}

      {lista.length > limite && (
        <button type="button" onClick={() => setLimite((l) => l + POR_PAGINA)} className="mx-auto mt-6 block h-12 rounded-full border border-line px-8 text-sm transition-colors hover:border-gold">Ver mais empreendimentos</button>
      )}
    </section>
  );
}
