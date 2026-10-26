import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { SEGMENTOS_HOME, ordenarCatalogo } from "@/lib/catalogoHome";
import { BotaoFavorito, useFavoritos } from "../favoritos";
import Reveal from "../Reveal";
import { Etiquetas, Foto } from "./pecas";

const POR_PAGINA = 9;

function Card({ p, i, onFalar }) {
  const destino = `/imoveis/${p.id}`;
  const ehParcela = p.precoRotulo === "Parcelas a partir de";
  const temValor = p.precoMin != null || ehParcela;
  const fotos = (p.galeria?.length ?? 0) + (p.image ? 1 : 0);
  const ficha = [p.quartosTexto, p.area].filter(Boolean).join(" · ");

  return (
    <Reveal atraso={(i % 3) * 60}>
      <article className="pb-home-imovel group flex h-full min-w-0 flex-col overflow-hidden rounded-[22px] border border-[#dce4ed] bg-white transition-all duration-300 hover:-translate-y-1 hover:border-[#c99e64] hover:shadow-xl">
        <div className="relative overflow-hidden">
          <Link to={destino} aria-label={`Ver detalhes de ${p.title}`} className="block aspect-[1.45] overflow-hidden">
            <Foto p={p} className="size-full object-cover transition-transform duration-700 group-hover:scale-105" />
          </Link>
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-20 bg-gradient-to-t from-black/45 to-transparent" />
          <div className="absolute left-3 top-3">
            <Etiquetas p={p} comSegmento />
          </div>
          <BotaoFavorito id={p.id} titulo={p.title} className="absolute right-3 top-3" />
          {fotos > 1 && (
            <span className="pointer-events-none absolute bottom-3 right-3 rounded-full bg-[#08152b]/75 px-2.5 py-1 text-[11px] font-semibold text-white backdrop-blur">
              {fotos} fotos
            </span>
          )}
        </div>

        <div className="flex flex-1 flex-col p-4 sm:p-5">
          {p.construtora && (
            <p className="text-[11px] font-bold uppercase tracking-[.12em] text-[#a87534]">{p.construtora}</p>
          )}
          <Link
            to={destino}
            className="mt-1 line-clamp-2 text-[19px] font-extrabold leading-snug tracking-tight text-[#102843] transition-colors hover:text-[#a27032]"
          >
            {p.title}
          </Link>
          <p className="mt-1.5 flex items-center gap-1.5 text-[12.5px] text-[#61748b]">
            <Icon name="mapPin" className="size-3.5 shrink-0" />
            <span className="truncate">{[p.bairro, p.cidade].filter((v) => v && v !== "A confirmar").join(", ")}</span>
          </p>
          {ficha && <p className="mt-2 text-[12.5px] font-medium text-[#43566c]">{ficha}</p>}

          <div className="h-4 shrink-0" aria-hidden="true" />
          <div className="mt-auto flex items-end justify-between gap-3 border-t border-[#e6ebf1] pt-4">
            <div className="min-w-0">
              <p className="text-[11px] font-semibold text-[#71839a]">{temValor ? p.precoRotulo : "Valores"}</p>
              <p className="mt-0.5 truncate text-[22px] font-extrabold tracking-tight text-[#102843]">
                {temValor ? (
                  ehParcela ? (
                    <>
                      {p.precoValor.replace("/mês", "")}
                      <span className="ml-0.5 text-[13px] font-bold text-[#a87534]">/mês</span>
                    </>
                  ) : p.precoValor
                ) : "Sob consulta"}
              </p>
            </div>
            <button
              type="button"
              onClick={() => onFalar(p)}
              className="shrink-0 rounded-xl bg-[#0c2846] px-3.5 py-2.5 text-[12px] font-bold text-white transition-colors hover:bg-[#163c61]"
            >
              Quero saber mais
            </button>
          </div>
        </div>
      </article>
    </Reveal>
  );
}

export default function ListaEmpreendimentos({
  itens,
  carregando,
  chips,
  segmento,
  onSegmento,
  onRemoverChip,
  onLimpar,
  onFalar,
  segmentosDisponiveis = SEGMENTOS_HOME.map((s) => s.id),
}) {
  const { ids } = useFavoritos();
  const [ordem, setOrdem] = useState("relevancia");
  const [soFavoritos, setSoFavoritos] = useState(false);
  const [limite, setLimite] = useState(POR_PAGINA);

  const lista = useMemo(() => {
    const base = soFavoritos ? itens.filter((item) => ids.includes(item.id)) : itens;
    return ordenarCatalogo(base, ordem);
  }, [itens, ids, ordem, soFavoritos]);

  useEffect(() => {
    setLimite(POR_PAGINA);
  }, [itens, ordem, soFavoritos]);

  return (
    <section id="lista" aria-labelledby="titulo-lista" className="pb-c-catalog mx-auto max-w-7xl scroll-mt-24 px-4 pt-12 sm:px-6 sm:pt-16">
      <div className="mb-5 flex flex-wrap items-end justify-between gap-3">
        <div>
          <p className="pb-site-eyebrow">Catálogo atualizado</p>
          <h2 id="titulo-lista" className="mt-1 text-2xl font-extrabold tracking-tight sm:text-[32px]">
            {chips.length ? "Resultados para você" : "Empreendimentos à venda"}
          </h2>
          <p className="mt-1 text-sm text-ink-2" aria-live="polite">
            {carregando ? "Carregando…" : `${lista.length} ${lista.length === 1 ? "empreendimento encontrado" : "empreendimentos encontrados"}`}
          </p>
        </div>

        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setSoFavoritos((valor) => !valor)}
            aria-pressed={soFavoritos}
            className={`min-h-11 rounded-xl border px-3 text-xs font-semibold transition-colors ${
              soFavoritos ? "border-[#c89650] bg-[#fff5e5] text-[#83561b]" : "border-line bg-white text-ink-2 hover:text-ink"
            }`}
          >
            ♥ Favoritos{ids.length ? ` (${ids.length})` : ""}
          </button>
          <select
            value={ordem}
            onChange={(evento) => setOrdem(evento.target.value)}
            aria-label="Ordenar imóveis"
            className="min-h-11 rounded-xl border border-line bg-white px-3 text-xs font-semibold text-ink-2 outline-none focus:border-[#c89650]"
          >
            <option value="relevancia">Em destaque</option>
            <option value="menor">Menor valor</option>
            <option value="entrega">Prazo mais curto</option>
          </select>
        </div>
      </div>

      {/* Barra de perfis fixa no topo da lista (estilo Booking) */}
      <div className="pb-d-pilulas sticky top-[76px] z-20 -mx-4 mb-5 flex gap-2 overflow-x-auto px-4 py-2.5 sm:mx-0 sm:rounded-2xl sm:px-3">
        {[{ id: "", rotulo: "Todos" }, ...SEGMENTOS_HOME.filter((s) => segmentosDisponiveis.includes(s.id) || s.id === segmento)].map((opcao) => {
          const ativo = segmento === opcao.id;
          return (
            <button
              key={opcao.id || "todos"}
              type="button"
              onClick={() => onSegmento(opcao.id)}
              aria-pressed={ativo}
              className={`min-h-10 shrink-0 rounded-full border px-4 text-[12.5px] font-bold transition-colors ${
                ativo ? "border-[#0c2846] bg-[#0c2846] text-white" : "border-[#d5dee8] bg-white text-[#2b4058] hover:border-[#c89650]"
              }`}
            >
              {opcao.rotulo}
            </button>
          );
        })}
      </div>

      {chips.length > 0 && (
        <div className="mb-5 flex flex-wrap items-center gap-2" aria-label="Filtros aplicados">
          {chips.map(([campo, texto]) => (
            <button
              key={campo}
              type="button"
              onClick={() => onRemoverChip(campo)}
              className="inline-flex min-h-9 items-center gap-1 rounded-full border border-[#dabd92] bg-[#fff5e6] px-3 text-xs font-semibold text-[#77511d]"
            >
              {texto} <Icon name="x" className="size-3.5" />
            </button>
          ))}
          <button type="button" onClick={onLimpar} className="min-h-9 px-2 text-xs font-medium text-ink-2 underline-offset-2 hover:underline">
            Limpar filtros
          </button>
        </div>
      )}

      {carregando ? (
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3" aria-busy="true">
          {[0, 1, 2].map((indice) => <div key={indice} className="h-96 animate-pulse rounded-2xl bg-[#e2e8f0]" />)}
        </div>
      ) : lista.length === 0 ? (
        <div className="rounded-2xl border border-dashed border-line bg-card p-10 text-center">
          <p className="text-ink-2">
            {soFavoritos
              ? ids.length === 0
                ? "Você ainda não adicionou imóveis aos favoritos."
                : "Nenhum favorito corresponde aos filtros selecionados."
              : "Nenhum empreendimento com esses filtros, mas um especialista pode achar o ideal para você."}
          </p>
          <div className="mt-5 flex flex-wrap justify-center gap-2">
            <button
              type="button"
              onClick={() => {
                setSoFavoritos(false);
                onLimpar();
              }}
              className="min-h-11 rounded-full border border-line px-5 text-sm font-semibold"
            >
              Ver todos
            </button>
            <button type="button" onClick={() => onFalar(null)} className="min-h-11 rounded-full bg-[#e9ad5a] px-5 text-sm font-semibold text-[#08152b]">
              Falar com especialista
            </button>
          </div>
        </div>
      ) : (
        <div className="grid items-stretch gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {lista.slice(0, limite).map((item, indice) => (
            <Card key={item.id} p={item} i={indice} onFalar={onFalar} />
          ))}
        </div>
      )}

      {lista.length > limite && (
        <button
          type="button"
          onClick={() => setLimite((atual) => atual + POR_PAGINA)}
          className="mx-auto mt-8 block min-h-12 rounded-full border border-line bg-white px-8 text-sm font-bold text-[#0d203b] transition-colors hover:border-[#c89650]"
        >
          Ver mais {Math.min(POR_PAGINA, lista.length - limite)} de {lista.length - limite} empreendimentos
        </button>
      )}
    </section>
  );
}
