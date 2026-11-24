import { useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { resumirProntos, resumirSegmentos } from "@/lib/catalogoHome";
import Reveal from "../Reveal";

const FILEIRA =
  "max-sm:-mx-4 max-sm:flex max-sm:snap-x max-sm:snap-mandatory max-sm:scroll-px-4 max-sm:gap-3 max-sm:overflow-x-auto max-sm:px-4 max-sm:pb-2";
const ITEM_FILEIRA = "max-sm:w-[80vw] max-sm:max-w-[320px] max-sm:shrink-0 max-sm:snap-start";

/**
 * No PC (a partir de 1280 px) os 4 perfis ficam numa fileira e o de nome mais longo (Minha Casa Minha Vida) ganha uma
 * coluna um pouco mais larga, para nada quebrar linha. Entre 1024 e 1279 px ficam 2 por linha, que também não quebra.
 */
export function colunasNoPc(segmentos) {
  const maior = Math.max(...segmentos.map((s) => s.rotulo.length));
  return segmentos.map((s) => (s.rotulo.length === maior && maior > 14 ? "1.3fr" : "1fr")).join(" ");
}

/** Atalhos por perfil: quanto custa para entrar e quantos imóveis há em cada um. */
export default function SegmentosVitrine({ itens, ativo, onEscolher, prontoAtivo = false, onPronto, onBuscarUsado }) {
  const segmentos = useMemo(() => resumirSegmentos(itens), [itens]);
  const prontos = useMemo(() => resumirProntos(itens), [itens]);
  if (segmentos.length < 2) return null;

  return (
    <section aria-labelledby="pb-d-perfis" className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-12">
      <Reveal className="mb-5">
        <p className="pb-site-eyebrow">Para cada momento de vida</p>
        <h2 id="pb-d-perfis" className="text-2xl font-extrabold tracking-tight text-[#0b203b] sm:text-[29px]">
          Comece pelo seu perfil
        </h2>
      </Reveal>

      {/* No celular os perfis viram uma fileira que desliza para o lado; do tablet para cima, a grade de sempre. */}
      <div className={FILEIRA}>
      <div
        className={`grid gap-3 max-sm:contents sm:grid-cols-2 ${segmentos.length === 3 ? "lg:grid-cols-3" : "xl:grid-cols-(--pb-colunas)"}`}
        style={{ "--pb-colunas": colunasNoPc(segmentos) }}
      >
        {segmentos.map((segmento, posicao) => {
          const selecionado = ativo === segmento.id;
          return (
            <Reveal key={segmento.id} atraso={posicao * 70} className={ITEM_FILEIRA}>
              <button
                type="button"
                onClick={() => onEscolher(selecionado ? "" : segmento.id)}
                aria-pressed={selecionado}
                className={`pb-c-filter group flex h-full w-full items-center gap-3.5 rounded-2xl border bg-white p-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg xl:gap-3 ${
                  selecionado ? "border-[#c99041] ring-2 ring-[#e9ad5a]/40" : "border-[#dee6ef] hover:border-[#d6af78]"
                }`}
              >
                <span className="relative size-[76px] shrink-0 overflow-hidden rounded-xl bg-[#eef3f8] xl:size-16">
                  {segmento.capa?.image ? (
                    <img src={segmento.capa.miniatura || segmento.capa.image} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <Icon name="building" className="absolute inset-0 m-auto size-7 text-[#b07a35]" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-[15px] leading-tight text-[#102843] xl:whitespace-nowrap">{segmento.rotulo}</strong>
                  {segmento.chamadaPreco && (
                    <span className="mt-1 block text-[12px] text-[#61748b] xl:whitespace-nowrap">
                      {segmento.chamadaPreco.rotulo}{" "}
                      <b className="font-extrabold text-[#9a6a2c]">{segmento.chamadaPreco.valor}</b>
                    </span>
                  )}
                  <span className="mt-0.5 block text-[12px] text-[#5b6e86]">
                    {segmento.quantidade} {segmento.quantidade === 1 ? "imóvel" : "imóveis"}
                  </span>
                </span>
                <Icon name="arrowRight" className="size-4 shrink-0 text-[#8f6129] transition-transform group-hover:translate-x-1" />
              </button>
            </Reveal>
          );
        })}
      </div>

      {((prontos && onPronto) || onBuscarUsado) && (
        <div className={`mt-3 grid gap-3 max-sm:contents ${prontos && onPronto && onBuscarUsado ? "md:grid-cols-2" : ""}`}>
          {prontos && onPronto && (
            <Reveal className={`h-full ${ITEM_FILEIRA}`}>
              <button
                type="button"
                onClick={onPronto}
                aria-pressed={prontoAtivo}
                className={`group flex h-full w-full items-center gap-4 rounded-2xl border bg-[#0b203b] p-3 text-left text-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-4 ${prontoAtivo ? "border-[#e9ad5a] ring-2 ring-[#e9ad5a]/40" : "border-[#0b203b]"}`}
              >
                <span className="relative size-[76px] shrink-0 overflow-hidden rounded-xl bg-white/10">
                  {prontos.capa?.image && <img src={prontos.capa.miniatura || prontos.capa.image} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-[16px] leading-tight">Pronto para morar</strong>
                  <span className="mt-1 block text-[12.5px] text-white/70">Mude já, sem esperar obra. {prontos.chamadaPreco && <>{prontos.chamadaPreco.rotulo} <b className="text-[#f3c47a]">{prontos.chamadaPreco.valor}</b></>}</span>
                  <span className="mt-0.5 block text-[12px] text-white/55">{prontos.quantidade} {prontos.quantidade === 1 ? "imóvel" : "imóveis"}</span>
                </span>
                <Icon name="arrowRight" className="size-4 shrink-0 text-[#f3c47a] transition-transform group-hover:translate-x-1" />
              </button>
            </Reveal>
          )}
          {onBuscarUsado && (
            <Reveal atraso={70} className={`h-full ${ITEM_FILEIRA}`}>
              <button
                type="button"
                onClick={onBuscarUsado}
                className="group flex h-full w-full items-center gap-4 rounded-2xl border border-dashed border-[#c99041] bg-[#fff8ee] p-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg sm:p-4"
              >
                <span className="grid size-[76px] shrink-0 place-items-center rounded-xl bg-[#f6e3c4] text-[#8a5d22]">
                  <Icon name="search" className="size-8" />
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-[16px] leading-tight text-[#102843]">Procura um usado ou pronto?</strong>
                  <span className="mt-1 block text-[12.5px] leading-snug text-[#5d7088]">Diga bairro, quartos e valor. A gente busca com as imobiliárias parceiras e volta com opções.</span>
                </span>
                <Icon name="arrowRight" className="size-4 shrink-0 text-[#8f6129] transition-transform group-hover:translate-x-1" />
              </button>
            </Reveal>
          )}
        </div>
      )}
      </div>
    </section>
  );
}
