import { useEffect, useMemo, useRef, useState } from "react";

/** Galeria touch-first. Sem biblioteca adicional, usando scroll-snap nativo do navegador. */
export default function GaleriaMobile({ imagens = [], titulo = "Empreendimento" }) {
  const slides = useMemo(() => imagens
    .map((foto, i) => typeof foto === "string"
      ? { src: foto, alt: `${titulo} — imagem ${i + 1}` }
      : { src: foto?.src || foto?.url, alt: foto?.alt || `${titulo} — imagem ${i + 1}` })
    .filter((foto) => foto.src), [imagens, titulo]);
  const trilho = useRef(null);
  const [atual, setAtual] = useState(0);
  const [zoom, setZoom] = useState(false);

  useEffect(() => {
    setAtual(0);
    setZoom(false);
    trilho.current?.scrollTo({ left: 0, behavior: "instant" });
  }, [titulo]);

  useEffect(() => {
    if (!zoom) return undefined;
    // Intercepta Escape antes do modal externo: o primeiro Escape fecha só a foto ampliada.
    const onKeyDown = (e) => {
      if (e.key !== "Escape") return;
      e.preventDefault();
      e.stopImmediatePropagation?.();
      setZoom(false);
    };
    document.addEventListener("keydown", onKeyDown, true);
    return () => document.removeEventListener("keydown", onKeyDown, true);
  }, [zoom]);

  const ir = (indice) => {
    const destino = Math.min(Math.max(0, indice), slides.length - 1);
    const node = trilho.current;
    if (!node) return;
    const reduzir = window.matchMedia?.("(prefers-reduced-motion: reduce)")?.matches;
    node.scrollTo({ left: destino * node.clientWidth, behavior: reduzir ? "instant" : "smooth" });
    setAtual(destino);
  };

  if (!slides.length) return (
    <div className="grid aspect-4/3 place-items-center rounded-xl border border-line bg-card-2 text-sm text-ink-3">
      Imagens em preparação
    </div>
  );
  const slide = slides[Math.min(atual, slides.length - 1)];
  const ehPlanta = (s) => /planta/i.test(s.alt);
  return (
    <div className="min-w-0 space-y-2" aria-label={`Galeria de ${titulo}`}>
      <div className="relative overflow-hidden bg-card-2 sm:rounded-2xl">
        <div
          ref={trilho}
          aria-label="Fotos do empreendimento. Deslize horizontalmente para navegar."
          onScroll={(e) => {
            const el = e.currentTarget;
            if (el.clientWidth) setAtual(Math.min(slides.length - 1, Math.max(0, Math.round(el.scrollLeft / el.clientWidth))));
          }}
          className="flex aspect-4/3 w-full snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] sm:aspect-16/10 [&::-webkit-scrollbar]:hidden"
        >
          {slides.map((foto, i) => (
            <img
              key={`${foto.src}-${i}`}
              src={foto.src}
              alt={foto.alt}
              width="1280"
              height="720"
              loading={i === 0 ? "eager" : "lazy"}
              decoding="async"
              draggable={false}
              className={`size-full shrink-0 snap-center select-none ${ehPlanta(foto) ? "bg-[#f7f6f3] object-contain" : "object-cover"}`}
            />
          ))}
        </div>
        <span className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-black/70 px-3 py-1.5 text-xs font-medium text-white backdrop-blur" aria-live="polite">
          {atual + 1} de {slides.length}
        </span>
        <button
          type="button"
          aria-label="Ampliar imagem atual"
          onClick={() => setZoom(true)}
          className="absolute right-3 top-3 grid min-h-11 min-w-11 place-items-center rounded-full bg-black/70 px-3 text-xs font-semibold text-white backdrop-blur focus-visible:outline-2 focus-visible:outline-gold"
        >
          <span aria-hidden="true">⛶</span>
        </button>
        {slides.length > 1 && (
          <>
            <button type="button" aria-label="Foto anterior" disabled={atual === 0} onClick={() => ir(atual - 1)} className="absolute left-2 top-1/2 grid min-h-11 min-w-11 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-xl text-white disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-gold sm:left-3">‹</button>
            <button type="button" aria-label="Próxima foto" disabled={atual === slides.length - 1} onClick={() => ir(atual + 1)} className="absolute right-2 top-1/2 grid min-h-11 min-w-11 -translate-y-1/2 place-items-center rounded-full bg-black/70 text-xl text-white disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-gold sm:right-3">›</button>
          </>
        )}
      </div>
      {slides.length > 1 && (
        <>
          <p className="px-3 text-center text-xs text-ink-3 sm:hidden">Deslize para o lado para ver mais fotos</p>
          <div className="flex max-w-full gap-2 overflow-x-auto overscroll-x-contain px-3 pb-1 [scrollbar-width:thin] sm:px-0" aria-label="Miniaturas da galeria">
            {slides.map((foto, i) => (
              <button key={`thumb-${foto.src}-${i}`} type="button" onClick={() => ir(i)} aria-label={`Ver imagem ${i + 1}: ${foto.alt}`} aria-current={i === atual ? "true" : undefined} className={`h-16 w-24 shrink-0 overflow-hidden rounded-lg border-2 focus-visible:outline-2 focus-visible:outline-gold ${i === atual ? "border-gold" : "border-transparent opacity-65"}`}>
                <img src={foto.src} alt="" loading="lazy" decoding="async" className={`size-full ${ehPlanta(foto) ? "bg-white object-contain" : "object-cover"}`} />
              </button>
            ))}
          </div>
        </>
      )}
      {zoom && (
        <div role="dialog" aria-modal="true" aria-label={`Imagem ampliada de ${titulo}`} className="fixed inset-0 z-[90] flex flex-col bg-black/95 p-3 pb-[max(0.75rem,env(safe-area-inset-bottom))]">
          <div className="flex shrink-0 items-center justify-between gap-2 text-sm text-white">
            <p>{atual + 1} de {slides.length}</p>
            <button type="button" autoFocus onClick={() => setZoom(false)} className="min-h-12 rounded-xl border border-white/40 px-5 font-medium">Fechar</button>
          </div>
          <div className="flex min-h-0 flex-1 items-center justify-center">
            <img src={slide.src} alt={slide.alt} className="max-h-full max-w-full object-contain" />
          </div>
          {slides.length > 1 && <div className="flex shrink-0 justify-between gap-3">
            <button type="button" disabled={atual === 0} onClick={() => ir(atual - 1)} className="min-h-12 rounded-xl border border-white/40 px-5 text-white disabled:opacity-30">← Anterior</button>
            <button type="button" disabled={atual === slides.length - 1} onClick={() => ir(atual + 1)} className="min-h-12 rounded-xl border border-white/40 px-5 text-white disabled:opacity-30">Próxima →</button>
          </div>}
        </div>
      )}
    </div>
  );
}
