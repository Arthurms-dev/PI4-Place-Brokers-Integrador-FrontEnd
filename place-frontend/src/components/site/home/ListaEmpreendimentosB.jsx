import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { BotaoFavorito, useFavoritos } from "../favoritos";
import Reveal from "../Reveal";
import { Etiquetas, Foto } from "./pecas";

const POR_PAGINA = 6;

function Card({ p, i, onFalar }) {
  const para = `/imoveis/${p.id}`;
  const temPreco = p.precoMin != null;
  const detalhes = [p.quartosTexto, p.suitesTexto, p.tipoTexto, p.vagasTexto, p.area].filter(Boolean);

  return (
    <Reveal atraso={(i % 3) * 60}>
      <article className="pb-home-imovel group flex h-full flex-col overflow-hidden rounded-[22px] border border-[#dfe6ed] bg-white transition-[transform,box-shadow,border-color] duration-300 hover:-translate-y-1 hover:border-[#c99e64] hover:shadow-xl">
        <div className="relative">
          <Link to={para} aria-label={`Ver detalhes de ${p.title}`} className="block aspect-[1.47] overflow-hidden">
            <Foto p={p} className="size-full object-cover transition-transform duration-500 group-hover:scale-105" />
          </Link>
          <div className="absolute left-3 top-3"><Etiquetas p={p} /></div>
          <BotaoFavorito id={p.id} titulo={p.title} className="absolute right-3 top-3" />
        </div>
        <div className="flex flex-1 flex-col bg-white p-5 sm:p-6">
          <p className="mb-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-ink-3">{p.tag}</p>
          <Link to={para} className="line-clamp-2 text-[17px] font-bold leading-snug text-ink transition-colors hover:text-[#986827]">{p.title}</Link>
          <p className="mt-2 flex items-center gap-1.5 text-[12px] text-ink-2"><Icon name="mapPin" className="size-3.5" /> {p.bairro ? `${p.bairro} · ` : ""}{p.city}</p>
          {detalhes.length > 0 && <p className="mt-4 rounded-lg bg-[#eff3f7] px-3 py-2 text-[12px] font-medium text-[#42536a]">{detalhes.join(" · ")}</p>}
          <div className="mt-auto pt-5">
            <p className="text-[11px] text-ink-3">{temPreco ? "A partir de" : "Valor"}</p>
            <p className="mt-0.5 text-xl font-extrabold tracking-tight text-[#0a2140]">{temPreco ? p.preco.replace("A partir de ", "") : "Sob consulta"}</p>
            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link to={para} className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#cbd5e1] px-2 text-center text-[12px] font-semibold text-[#122744] transition-colors hover:border-[#bd8b4c]">Ver detalhes</Link>
              <button type="button" onClick={() => onFalar(p)} className="min-h-11 rounded-xl bg-[#e9ad5a] px-2 text-[12px] font-bold text-[#08152b] transition-colors hover:bg-[#f0c182]">Quero saber mais</button>
            </div>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function ListaEmpreendimentosB({ itens, carregando, chips, onRemoverChip, onLimpar, onFalar }) {
  const { ids } = useFavoritos();
  const [ordem, setOrdem] = useState("relevancia");
  const [soFavoritos, setSoFavoritos] = useState(false);
  const [limite, setLimite] = useState(POR_PAGINA);

  const lista = useMemo(() => {
    const l = soFavoritos ? itens.filter((p) => ids.includes(p.id)) : [...itens];
    if (ordem === "menor") l.sort((a, b) => (a.precoMin ?? Infinity) - (b.precoMin ?? Infinity));
    else l.sort((a, b) => Number(b.destaque) - Number(a.destaque));
    return l;
  }, [itens, ordem, soFavoritos, ids]);

  return (
    <section id="lista" aria-labelledby="titulo-lista" className="pb-c-catalog mx-auto max-w-7xl scroll-mt-24 px-4 pt-12 sm:px-6 sm:pt-16">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="pb-site-eyebrow">Encontre seu lugar</p>
          <h2 id="titulo-lista" className="mt-1 text-2xl font-bold sm:text-3xl">{chips.length ? "Resultados para você" : "Explore os empreendimentos"}</h2>
          <p className="mt-1 text-sm text-ink-2">{carregando ? "Carregando…" : `${lista.length} ${lista.length === 1 ? "empreendimento" : "empreendimentos"} no catálogo`}</p>
        </div>
        <div className="flex items-center gap-2">
          <button type="button" onClick={() => setSoFavoritos((v) => !v)} aria-pressed={soFavoritos} className={`min-h-11 rounded-xl border px-3 text-xs font-semibold transition-colors ${soFavoritos ? "border-[#c89650] bg-[#fff5e5] text-[#83561b]" : "border-line text-ink-2 hover:text-ink"}`}>
            Favoritos{ids.length ? ` (${ids.length})` : ""}
          </button>
          <select value={ordem} onChange={(e) => setOrdem(e.target.value)} aria-label="Ordenar imóveis" className="min-h-11 rounded-xl border border-line bg-card px-3 text-xs font-medium text-ink-2 outline-none focus:border-[#c89650]">
            <option value="relevancia">Em destaque</option>
            <option value="menor">Menor preço</option>
          </select>
        </div>
      </div>

      {chips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Filtros aplicados">
          {chips.map(([campo, texto]) => <button key={campo} type="button" onClick={() => onRemoverChip(campo)} className="inline-flex min-h-9 items-center gap-1 rounded-full border border-[#dabd92] bg-[#fff5e6] px-3 text-xs font-semibold text-[#77511d]">{texto} <Icon name="x" className="size-3.5" /></button>)}
          <button type="button" onClick={onLimpar} className="min-h-9 px-2 text-xs font-medium text-ink-2 underline-offset-2 hover:underline">Limpar filtros</button>
        </div>
      )}

      {carregando ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">{[0,1,2].map((i) => <div key={i} className="h-96 animate-pulse rounded-2xl bg-[#e2e8f0]" />)}</div>
      ) : lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card p-10 text-center">
          <p className="text-ink-2">{soFavoritos ? "Você ainda não adicionou imóveis aos favoritos." : "Nenhum empreendimento encontrado com esses filtros."}</p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button type="button" onClick={() => { setSoFavoritos(false); onLimpar(); }} className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold">Ver todos</button>
            <button type="button" onClick={() => onFalar(null)} className="min-h-11 rounded-full bg-[#e9ad5a] px-5 text-sm font-semibold text-[#08152b]">Falar com especialista</button>
          </div>
        </div>
      ) : (
        <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lista.slice(0, limite).map((p, i) => <Card key={p.id} p={p} i={i} onFalar={onFalar} />)}
        </div>
      )}

      {lista.length > limite && (
        <button type="button" onClick={() => setLimite((n) => n + POR_PAGINA)} className="mx-auto mt-7 block min-h-12 rounded-full border border-line bg-white px-8 text-sm font-semibold text-[#0d203b] transition-colors hover:border-[#c89650]">Ver mais empreendimentos</button>
      )}
    </section>
  );
}
