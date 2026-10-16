import { lazy, Suspense, useEffect, useMemo, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { buscarEmpreendimentoPorId, formatarFaixa } from "@/services/empreendimentos";
import { registrarEvento } from "@/services/eventos";
import { BotaoFavorito } from "./favoritos";
import FormularioContato from "./FormularioContato";
import { useContato } from "./ContatoProvider";
import { Etiquetas } from "./home/pecas";

const MiniMapa = lazy(() => import("./MiniMapa"));
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

function Galeria({ imagens, titulo }) {
  const trilho = useRef(null);
  const [atual, setAtual] = useState(0);
  const ir = (i) => trilho.current?.scrollTo({ left: i * trilho.current.clientWidth, behavior: "smooth" });
  if (imagens.length === 0) return <div className="grid aspect-16/10 place-items-center rounded-2xl bg-card-2 text-gold/50"><Icon name="building" className="size-14" /></div>;

  return (
    <div className="space-y-2">
      <div className="relative overflow-hidden bg-card-2 sm:rounded-2xl">
        <div ref={trilho} onScroll={(e) => setAtual(Math.round(e.currentTarget.scrollLeft / e.currentTarget.clientWidth))}
          className="flex aspect-4/3 snap-x snap-mandatory overflow-x-auto scroll-smooth [scrollbar-width:none] sm:aspect-16/10 [&::-webkit-scrollbar]:hidden">
          {imagens.map((src, i) => <img key={src + i} src={src} alt={`${titulo} — foto ${i + 1}`} loading={i ? "lazy" : "eager"} decoding="async" className="size-full shrink-0 snap-center object-cover" />)}
        </div>
        {imagens.length > 1 && (
          <>
            <span className="absolute bottom-3 right-3 rounded-full bg-page/80 px-3 py-1 text-xs backdrop-blur">{atual + 1} / {imagens.length}</span>
            {atual > 0 && <button type="button" aria-label="Foto anterior" onClick={() => ir(atual - 1)} className="absolute left-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-page/80 backdrop-blur transition hover:bg-page sm:grid"><Icon name="chevronLeft" className="size-5" /></button>}
            {atual < imagens.length - 1 && <button type="button" aria-label="Próxima foto" onClick={() => ir(atual + 1)} className="absolute right-3 top-1/2 hidden size-11 -translate-y-1/2 place-items-center rounded-full bg-page/80 backdrop-blur transition hover:bg-page sm:grid"><Icon name="chevronRight" className="size-5" /></button>}
          </>
        )}
      </div>
      {imagens.length > 1 && (
        <div className="hidden gap-2 overflow-x-auto sm:flex [scrollbar-width:none] [&::-webkit-scrollbar]:hidden">
          {imagens.map((src, i) => (
            <button key={src + i} type="button" onClick={() => ir(i)} aria-label={`Ver foto ${i + 1}`} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 transition ${i === atual ? "border-gold" : "border-transparent opacity-60 hover:opacity-100"}`}>
              <img src={src} alt="" loading="lazy" className="size-full object-cover" />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function EmpreendimentoModal({ item, onClose }) {
  const { abrirContato } = useContato();
  const [det, setDet] = useState(null);

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
    if (item.origem !== "api") return undefined;
    let ativo = true;
    buscarEmpreendimentoPorId(item.id).then((d) => ativo && setDet(d)).catch(() => {});
    if (UUID.test(item.id)) registrarEvento({ tipo: "visualizacao_empreendimento", empreendimentoId: item.id });
    return () => {
      ativo = false;
    };
  }, [item]);

  const imagens = useMemo(() => {
    const extras = [...(det?.imagens ?? [])].sort((a, b) => (a.ordem ?? 0) - (b.ordem ?? 0)).map((i) => i.url);
    return [item.image, ...item.galeria, ...extras].filter(Boolean).filter((u, i, l) => l.indexOf(u) === i);
  }, [item, det]);

  const lat = det?.latitude ?? item.lat;
  const lng = det?.longitude ?? item.lng;
  const lazer = det?.lazer?.length ? det.lazer : item.lazer;
  const descricao = det?.descricao ?? item.description;
  const vagas = det ? formatarFaixa(det.vagas_min, det.vagas_max, "vaga", "vagas") : item.vagasTexto;
  const dados = [
    ["Quartos", item.quartosTexto],
    ["Garagem", vagas],
    ["Metragem", item.area],
    ["Valores", item.preco],
  ].filter(([, v]) => v);
  const sobre = { id: item.id, title: item.title };

  return (
    <div className="animate-fade-in fixed inset-0 z-[55] bg-black/75 sm:flex sm:items-center sm:justify-center sm:p-6" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label={item.title} className="animate-slide-up sm:animate-fade-up flex h-full w-full flex-col bg-page sm:h-auto sm:max-h-[94dvh] sm:max-w-6xl sm:rounded-3xl sm:border sm:border-line">
        <div className="flex items-center justify-between gap-3 border-b border-line-soft px-4 py-3">
          <button type="button" onClick={onClose} className="inline-flex h-11 items-center gap-2 rounded-full border border-line px-5 text-sm font-medium transition-colors hover:border-gold">
            <Icon name="chevronLeft" className="size-5" /> Voltar
          </button>
          <BotaoFavorito id={item.id} titulo={item.title} className="border border-line" />
        </div>

        <div className="flex-1 overflow-y-auto pb-24 sm:pb-6">
          <div className="grid gap-6 sm:p-6 lg:grid-cols-[1.5fr_1fr]">
            <div className="space-y-6">
              <Galeria imagens={imagens} titulo={item.title} />

              <div className="space-y-6 px-4 sm:px-0">
                <div className="space-y-3">
                  <Etiquetas p={item} />
                  <h1 className="text-3xl font-semibold sm:text-4xl">{item.title}</h1>
                  <p className="flex items-center gap-1.5 text-[14px] text-ink-2"><Icon name="mapPin" className="size-4 text-gold" /> {item.bairro ? `${item.bairro} · ` : ""}{item.city}{item.construtora ? ` · ${item.construtora}` : ""}</p>
                </div>

                {!item.disponivel && (
                  <p className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-ink-2">Unidades esgotadas neste lançamento. Fale com um especialista para conhecer opções parecidas.</p>
                )}

                {dados.length > 0 && (
                  <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
                    {dados.map(([rotulo, valor]) => (
                      <div key={rotulo} className="rounded-xl border border-line-soft bg-card-2 p-3">
                        <dt className="text-[12px] text-ink-3">{rotulo}</dt>
                        <dd className="mt-0.5 text-[14px] font-semibold leading-snug">{valor}</dd>
                      </div>
                    ))}
                  </dl>
                )}

                {descricao && <p className="text-[15px] leading-relaxed text-ink-2">{descricao}</p>}
                {lazer?.length > 0 && (
                  <div>
                    <h2 className="mb-2 text-[13px] font-semibold uppercase tracking-wide text-gold">Lazer e diferenciais</h2>
                    <div className="flex flex-wrap gap-2">{lazer.map((l) => <span key={l} className="rounded-full border border-line px-3 py-1.5 text-[13px] text-ink-2">{l}</span>)}</div>
                  </div>
                )}

                {lat != null && lng != null && (
                  <div className="space-y-3">
                    <h2 className="text-[13px] font-semibold uppercase tracking-wide text-gold">Localização</h2>
                    <div className="h-60 overflow-hidden rounded-2xl border border-line sm:h-72">
                      <Suspense fallback={<div className="grid size-full place-items-center text-sm text-ink-3">Carregando mapa…</div>}>
                        <MiniMapa lat={lat} lng={lng} />
                      </Suspense>
                    </div>
                    <a href={`https://www.google.com/maps/search/?api=1&query=${lat},${lng}`} target="_blank" rel="noreferrer" className="flex h-12 w-full items-center justify-center gap-2 rounded-xl border border-line text-sm font-medium transition-colors hover:border-gold sm:w-auto sm:px-6">
                      <Icon name="mapPin" className="size-4 text-gold" /> Ver no Google Maps
                    </a>
                  </div>
                )}
              </div>
            </div>

            <aside className="hidden lg:block">
              <div className="sticky top-0 space-y-4 rounded-2xl border border-gold/40 bg-card p-6 shadow-xl shadow-black/30">
                <div>
                  <p className="text-[12px] uppercase tracking-wide text-ink-3">{item.preco.startsWith("A partir") ? "A partir de" : "Valores"}</p>
                  <p className="text-3xl font-semibold text-gold">{item.preco.replace("A partir de ", "")}</p>
                </div>
                <div className="hairline-gold" />
                <h2 className="text-lg font-semibold">Fale com um especialista</h2>
                <FormularioContato empreendimento={sobre} canal="detalhe do empreendimento" />
              </div>
            </aside>
          </div>
        </div>

        <div className="flex items-center gap-3 border-t border-line-soft bg-page/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))] backdrop-blur lg:hidden">
          <div className="min-w-0 flex-1">
            <p className="text-[11px] uppercase tracking-wide text-ink-3">{item.preco.startsWith("A partir") ? "A partir de" : "Valores"}</p>
            <p className="truncate text-lg font-semibold text-gold">{item.preco.replace("A partir de ", "")}</p>
          </div>
          <button type="button" onClick={() => abrirContato(sobre, "detalhe do empreendimento")} className="h-12 shrink-0 rounded-xl bg-gold-gradient px-6 text-sm font-semibold text-[#1a1408]">Falar com especialista</button>
        </div>
      </div>
    </div>
  );
}
