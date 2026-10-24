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

  const detalhes = [
    p.quartosTexto,
    p.suitesTexto,
    p.tipoTexto,
    p.vagasTexto,
    p.area,
  ].filter(Boolean);

  const preco = temPreco
    ? p.preco.replace("A partir de ", "")
    : "Sob consulta";

  return (
    <Reveal atraso={(i % 3) * 60}>
      <article className="pb-home-imovel group flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#dce4ed] bg-white shadow-[0_12px_32px_-22px_rgba(8,21,43,.35)] transition-all duration-300 hover:-translate-y-1 hover:border-[#c99e64] hover:shadow-xl">
        <div className="relative overflow-hidden">
          <Link
            to={para}
            aria-label={`Ver detalhes de ${p.title}`}
            className="block aspect-[16/10] overflow-hidden sm:aspect-[1.47]"
          >
            <Foto
              p={p}
              className="size-full object-cover transition-transform duration-500 group-hover:scale-105"
            />
          </Link>

          <div className="absolute left-3 top-3">
            <Etiquetas p={p} />
          </div>

          <BotaoFavorito
            id={p.id}
            titulo={p.title}
            className="absolute right-3 top-3"
          />
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">

          <Link
            to={para}
            className="line-clamp-2 text-[19px] font-bold leading-snug text-[#102843] transition-colors hover:text-[#a27032]"
          >
            {p.title}
          </Link>

          <p className="mt-2 flex items-center gap-1.5 text-[12px] text-[#61748b]">
            <Icon name="mapPin" className="size-3.5 shrink-0" />
            <span className="truncate">
              {p.bairro ? `${p.bairro} · ` : ""}
              {p.city}
            </span>
          </p>

          {detalhes.length > 0 && (
            <div className="mt-4 rounded-xl bg-[#f1f5f9] px-3 py-2.5">
              <p className="text-[12px] font-medium leading-5 text-[#43566c]">
                {detalhes.join(" · ")}
              </p>
            </div>
          )}

          <div className="mt-auto pt-4">
            <div className="border-t border-[#e6ebf1] pt-4">
              <p className="text-[11px] text-[#71839a]">
                {temPreco ? "A partir de" : "Valor"}
              </p>

              <p className="mt-1 text-[23px] font-extrabold tracking-tight text-[#102843]">
                {preco}
              </p>
            </div>

            <div className="mt-4 grid grid-cols-2 gap-2">
              <Link
                to={para}
                className="inline-flex min-h-11 items-center justify-center rounded-xl border border-[#cbd5e1] px-3 text-center text-[12px] font-bold text-[#102843] transition-colors hover:border-[#bd8b4c]"
              >
                Ver detalhes
              </Link>

              <button
                type="button"
                onClick={() => onFalar(p)}
                className="min-h-11 rounded-xl bg-[#e9ad5a] px-3 text-[12px] font-bold text-[#08152b] transition-colors hover:bg-[#f0c182]"
              >
                Quero saber mais
              </button>
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
