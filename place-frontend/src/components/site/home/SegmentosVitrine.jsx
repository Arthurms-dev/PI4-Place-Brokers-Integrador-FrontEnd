import { useMemo } from "react";
import { Icon } from "@/components/ui/Icon";
import { resumirSegmentos } from "@/lib/catalogoHome";
import Reveal from "../Reveal";

/** Atalhos por perfil: quanto custa para entrar e quantos imóveis há em cada um. */
export default function SegmentosVitrine({ itens, ativo, onEscolher }) {
  const segmentos = useMemo(() => resumirSegmentos(itens), [itens]);
  if (segmentos.length < 2) return null;

  return (
    <section aria-labelledby="pb-d-perfis" className="mx-auto max-w-7xl px-4 pt-10 sm:px-6 sm:pt-12">
      <Reveal className="mb-5">
        <p className="pb-site-eyebrow">Para cada momento de vida</p>
        <h2 id="pb-d-perfis" className="text-2xl font-extrabold tracking-tight text-[#0b203b] sm:text-[29px]">
          Comece pelo seu perfil
        </h2>
      </Reveal>

      <div className={`grid gap-3 sm:grid-cols-2 ${segmentos.length === 3 ? "lg:grid-cols-3" : "lg:grid-cols-4"}`}>
        {segmentos.map((segmento, posicao) => {
          const selecionado = ativo === segmento.id;
          return (
            <Reveal key={segmento.id} atraso={posicao * 70}>
              <button
                type="button"
                onClick={() => onEscolher(selecionado ? "" : segmento.id)}
                aria-pressed={selecionado}
                className={`pb-c-filter group flex w-full items-center gap-3.5 rounded-2xl border bg-white p-3 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-lg ${
                  selecionado ? "border-[#c99041] ring-2 ring-[#e9ad5a]/40" : "border-[#dee6ef] hover:border-[#d6af78]"
                }`}
              >
                <span className="relative size-[76px] shrink-0 overflow-hidden rounded-xl bg-[#eef3f8]">
                  {segmento.capa?.image ? (
                    <img src={segmento.capa.image} alt="" loading="lazy" decoding="async" className="size-full object-cover transition-transform duration-500 group-hover:scale-110" />
                  ) : (
                    <Icon name="building" className="absolute inset-0 m-auto size-7 text-[#b07a35]" />
                  )}
                </span>
                <span className="min-w-0 flex-1">
                  <strong className="block text-[15px] leading-tight text-[#102843]">{segmento.rotulo}</strong>
                  {segmento.chamadaPreco && (
                    <span className="mt-1 block text-[12px] text-[#61748b]">
                      {segmento.chamadaPreco.rotulo}{" "}
                      <b className="font-extrabold text-[#9a6a2c]">{segmento.chamadaPreco.valor}</b>
                    </span>
                  )}
                  <span className="mt-0.5 block text-[11px] text-[#7a8ca1]">
                    {segmento.quantidade} {segmento.quantidade === 1 ? "imóvel" : "imóveis"}
                  </span>
                </span>
                <Icon name="arrowRight" className="size-4 shrink-0 text-[#a77537] transition-transform group-hover:translate-x-1" />
              </button>
            </Reveal>
          );
        })}
      </div>
    </section>
  );
}
