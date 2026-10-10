import { lazy, Suspense, useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { useContato } from "@/components/site/ContatoProvider";
import { registrarEvento } from "@/services/eventos";

const MiniMapa = lazy(() => import("./MiniMapa"));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const brl = (n) => Number(n).toLocaleString("pt-BR", { style: "currency", currency: "BRL", maximumFractionDigits: 0 });

/**
 */
function Galeria({ imagens, titulo }) {
  const trilho = useRef(null);
  const [atual, setAtual] = useState(0);
  const ir = (i) => trilho.current?.scrollTo({ left: i * trilho.current.clientWidth, behavior: "smooth" });

  return (
    <div className="relative overflow-hidden bg-card-2 sm:rounded-2xl">
      <div
        ref={trilho}
        onScroll={(e) => setAtual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
        className="flex aspect-4/3 snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] sm:aspect-16/10 [&::-webkit-scrollbar]:hidden"
      >
        {imagens.map((src, i) => (
          <img
            key={src + i}
            src={src}
            alt={`${titulo} — foto ${i + 1}`}
            loading={i === 0 ? "eager" : "lazy"}
            decoding="async"
            className="size-full shrink-0 snap-center object-cover"
          />
        ))}
      </div>

      {imagens.length > 1 && (
        <>
          <span className="absolute bottom-3 right-3 rounded-full bg-page/80 px-3 py-1 text-xs backdrop-blur">
            {atual + 1} / {imagens.length}
          </span>
          {["Anterior", "Próxima"].map((rotulo, k) => {
            const destino = atual + (k ? 1 : -1);
            if (destino < 0 || destino >= imagens.length) return null;
            return (
              <button
                key={rotulo}
                type="button"
                onClick={() => ir(destino)}
                aria-label={`Foto ${rotulo.toLowerCase()}`}
                className={`absolute top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-page/80 backdrop-blur transition hover:bg-page sm:grid ${k ? "right-3" : "left-3"}`}
              >
                <Icon name={k ? "chevronRight" : "chevronLeft"} className="size-5" />
              </button>
            );
          })}
        </>
      )}
    </div>
  );
}

function Dado({ icone, rotulo, valor }) {
  return (
    <div className="rounded-xl border border-line-soft bg-card-2 p-3">
      <div className="flex items-center gap-1.5 text-[12px] text-ink-3">
        {icone && <Icon name={icone} className="size-4" />} {rotulo}
      </div>
      <div className="mt-1 text-[15px] font-semibold">{valor}</div>
    </div>
  );
}

export function EmpreendimentoModal({ imovel, onClose }) {
  const { abrirContato } = useContato();
  const falar = () => abrirContato({ id: imovel.id, title: imovel.title });

  useEffect(() => {
    const aoTeclar = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", aoTeclar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  useEffect(() => {
    if (UUID.test(String(imovel.id))) registrarEvento({ tipo: "visualizacao_empreendimento", empreendimentoId: imovel.id });
  }, [imovel.id]);

  const imagens = imovel.galeria?.length ? imovel.galeria : [imovel.image];
  const temMapa = imovel.lat != null && imovel.lng != null;
  const preco = imovel.parcelaAPartir ? `${brl(imovel.parcelaAPartir)}/mês` : imovel.price;
  const dados = [
    { icone: "bedDouble", rotulo: "Quartos", valor: imovel.bedrooms },
    imovel.vagas != null && { icone: "car", rotulo: "Garagem", valor: `${imovel.vagas} ${imovel.vagas === 1 ? "vaga" : "vagas"}` },
    imovel.area && { icone: "map", rotulo: "Metragem", valor: imovel.area },
    imovel.parcelaAPartir && { icone: "clock", rotulo: "Parcelas a partir de", valor: brl(imovel.parcelaAPartir) },
  ].filter(Boolean);

  return (
    <div className="fixed inset-0 z-[55] bg-black/70 sm:flex sm:items-center sm:justify-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={imovel.title} className="animate-fade-up flex h-full w-full flex-col bg-page sm:h-auto sm:max-h-[92dvh] sm:max-w-5xl sm:rounded-3xl sm:border sm:border-line">
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3">
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium transition-colors hover:border-gold">
            <Icon name="chevronLeft" className="size-5" /> Voltar
          </button>
          <span className="rounded-full bg-gold/15 px-3 py-1 text-[12px] font-medium text-gold">{imovel.type}</span>
        </div>

        <div className="flex-1 overflow-y-auto pb-24 sm:pb-6">
          <div className="grid gap-6 sm:p-6 lg:grid-cols-[1.35fr_1fr]">
            <div className="space-y-5">
              <Galeria imagens={imagens} titulo={imovel.title} />
              <div className="space-y-5 px-4 sm:px-0">
                <div>
                  <h1 className="text-2xl font-semibold sm:text-3xl">{imovel.title}</h1>
                  <p className="mt-1 flex items-center gap-1.5 text-sm text-ink-2"><Icon name="mapPin" className="size-4 text-gold" /> {imovel.city}</p>
                </div>
                <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 lg:grid-cols-2">
                  {dados.map((d) => <Dado key={d.rotulo} {...d} />)}
                </div>
                <p className="text-sm leading-relaxed text-ink-2">{imovel.description}</p>
                {imovel.entrega && <p className="text-sm"><span className="text-ink-3">Previsão de entrega:</span> {imovel.entrega}</p>}
                {imovel.lazer?.length > 0 && (
                  <div className="flex flex-wrap gap-2">
                    {imovel.lazer.map((item) => <span key={item} className="rounded-full border border-line px-3 py-1 text-[12px] text-ink-2">{item}</span>)}
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-4 px-4 sm:px-0">
              <div className="rounded-2xl border border-gold/30 bg-gold/10 p-5">
                <div className="text-[12px] text-ink-3">{imovel.parcelaAPartir ? "Parcelas a partir de" : "Valores"}</div>
                <div className="mt-0.5 text-2xl font-semibold text-gold">{preco}</div>
                <button type="button" onClick={falar} className="mt-4 hidden h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 sm:block">
                  Quero falar com um especialista
                </button>
              </div>

              {temMapa && (
                <div className="space-y-3">
                  <div className="h-56 overflow-hidden rounded-2xl border border-line sm:h-64">
                    <Suspense fallback={<div className="grid size-full place-items-center text-sm text-ink-3">Carregando mapa…</div>}>
                      <MiniMapa lat={imovel.lat} lng={imovel.lng} />
                    </Suspense>
                  </div>
                  <a
                    href={`https://www.google.com/maps/search/?api=1&query=${imovel.lat},${imovel.lng}`}
                    target="_blank"
                    rel="noreferrer"
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-medium transition-colors hover:border-gold"
                  >
                    <Icon name="mapPin" className="size-4 text-gold" /> Ver no Google Maps
                  </a>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="border-t border-line-soft bg-page/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur sm:hidden">
          <button type="button" onClick={falar} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408]">
            Quero falar com um especialista
          </button>
        </div>
      </div>
    </div>
  );
}