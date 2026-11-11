import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';

function Foto({ foto, titulo, indice, principal, className }) {
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [foto.src]);
  if (falhou) {
    return <div role="img" aria-label={`Imagem ${indice + 1} de ${titulo} indisponível`} className={`grid place-items-center bg-[#172c46] text-sm text-white/80 ${className}`}>
      Imagem indisponível
    </div>;
  }
  return <img
    src={foto.src}
    alt={foto.alt}
    width="1280"
    height="800"
    loading={principal ? 'eager' : 'lazy'}
    fetchPriority={principal ? 'high' : 'auto'}
    decoding="async"
    draggable={false}
    onError={() => setFalhou(true)}
    className={className}
  />;
}

/** Galeria pública responsiva; somente URLs entregues pelo catálogo e filtradas pela camada de dados. */
export default function GaleriaImovelPremium({ imagens = [], titulo = 'Empreendimento' }) {
  const fotos = useMemo(() => Array.isArray(imagens) ? imagens.filter((f) => f?.src) : [], [imagens]);
  const [atual, setAtual] = useState(0);
  const [ampliada, setAmpliada] = useState(false);
  const trilho = useRef(null);
  const expandirRef = useRef(null);
  const fecharRef = useRef(null);

  const irPara = useCallback((indice) => {
    if (!fotos.length) return;
    const novo = Math.max(0, Math.min(fotos.length - 1, indice));
    setAtual(novo);
    const el = trilho.current;
    if (el) {
      const movimentoReduzido = window.matchMedia?.('(prefers-reduced-motion: reduce)')?.matches;
      el.scrollTo({ left: novo * el.clientWidth, behavior: movimentoReduzido ? 'auto' : 'smooth' });
    }
  }, [fotos.length]);

  useEffect(() => {
    setAtual(0);
    setAmpliada(false);
    trilho.current?.scrollTo({ left: 0, behavior: 'instant' });
  }, [titulo]);

  useEffect(() => {
    if (atual >= fotos.length && fotos.length) setAtual(fotos.length - 1);
  }, [atual, fotos.length]);

  useEffect(() => {
    if (!ampliada) return undefined;
    const anterior = document.activeElement;
    fecharRef.current?.focus();
    return () => { if (anterior?.isConnected) anterior.focus?.(); };
  }, [ampliada]);

  useEffect(() => {
    if (!ampliada) return undefined;
    const tecla = (evento) => {
      if (evento.key === 'Escape') {
        evento.preventDefault();
        evento.stopImmediatePropagation?.();
        setAmpliada(false);
      } else if (evento.key === 'ArrowLeft') {
        evento.preventDefault();
        irPara(atual - 1);
      } else if (evento.key === 'ArrowRight') {
        evento.preventDefault();
        irPara(atual + 1);
      }
    };
    document.addEventListener('keydown', tecla, true);
    return () => document.removeEventListener('keydown', tecla, true);
  }, [ampliada, atual, irPara]);

  if (fotos.length === 0) return (
    <div className="grid aspect-[4/3] place-content-center gap-2 rounded-2xl bg-[#172c46] px-5 text-center text-white">
      <span className="text-3xl text-[#e9ad5a]" aria-hidden="true">⌂</span>
      <p className="text-sm font-semibold">Galeria em preparação</p>
      <p className="max-w-xs text-xs text-white/60">Peça mais imagens deste empreendimento ao especialista.</p>
    </div>
  );
  const foco = fotos[Math.min(atual, fotos.length - 1)];

  return (
    <section aria-label={`Fotos de ${titulo}`} className="min-w-0 space-y-3">
      <div className="relative overflow-hidden rounded-2xl bg-[#122842] shadow-lg shadow-[#08152b]/10">
        <div
          ref={trilho}
          aria-label="Galeria do empreendimento. Deslize horizontalmente para ver outras fotos."
          onScroll={(evento) => {
            const el = evento.currentTarget;
            if (el.clientWidth) setAtual(Math.max(0, Math.min(fotos.length - 1, Math.round(el.scrollLeft / el.clientWidth))));
          }}
          className="flex aspect-[4/3] snap-x snap-mandatory overflow-x-auto overscroll-x-contain scroll-smooth [scrollbar-width:none] sm:aspect-[16/10] [&::-webkit-scrollbar]:hidden"
        >
          {fotos.map((foto, i) => (
            <div key={`${foto.src}-${i}`} className="h-full w-full shrink-0 snap-center overflow-hidden">
              <Foto foto={foto} titulo={titulo} indice={i} principal={i === 0} className="h-full w-full object-cover" />
            </div>
          ))}
        </div>
        <div className="pointer-events-none absolute inset-x-0 top-0 h-20 bg-gradient-to-b from-black/40 to-transparent" />
        <span className="pointer-events-none absolute left-3 top-3 rounded-full bg-[#08152b]/75 px-3 py-1.5 text-xs font-medium text-white backdrop-blur">
          {fotos.length} {fotos.length === 1 ? 'imagem' : 'imagens'}
        </span>
        <button
          ref={expandirRef}
          type="button"
          onClick={() => setAmpliada(true)}
          aria-label="Ampliar foto selecionada"
          className="absolute right-3 top-3 inline-flex min-h-11 items-center gap-2 rounded-full bg-[#08152b]/85 px-4 text-xs font-semibold text-white backdrop-blur transition hover:bg-[#08152b] focus-visible:outline-2 focus-visible:outline-[#e9ad5a]"
        >
          <span aria-hidden="true">⛶</span> Ampliar
        </button>
        <span aria-live="polite" className="pointer-events-none absolute bottom-3 left-3 rounded-full bg-[#08152b]/85 px-3 py-1.5 text-xs text-white">
          {atual + 1} / {fotos.length}
        </span>
        {fotos.length > 1 && <>
          <button type="button" disabled={atual === 0} aria-label="Foto anterior" onClick={() => irPara(atual - 1)} className="absolute left-2 top-1/2 grid min-h-11 min-w-11 -translate-y-1/2 place-items-center rounded-full bg-[#08152b]/80 text-2xl text-white disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-[#e9ad5a] sm:left-3">‹</button>
          <button type="button" disabled={atual === fotos.length - 1} aria-label="Próxima foto" onClick={() => irPara(atual + 1)} className="absolute right-2 top-1/2 grid min-h-11 min-w-11 -translate-y-1/2 place-items-center rounded-full bg-[#08152b]/80 text-2xl text-white disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-[#e9ad5a] sm:right-3">›</button>
        </>}
      </div>
      {fotos.length > 1 && <>
        <div aria-label="Miniaturas das fotos" className="flex max-w-full gap-2 overflow-x-auto overscroll-x-contain pb-1 [scrollbar-width:thin]">
          {fotos.map((foto, i) => (
            <button
              key={`miniatura-${foto.src}-${i}`}
              type="button"
              onClick={() => irPara(i)}
              aria-label={`Ver foto ${i + 1}: ${foto.alt}`}
              aria-current={i === atual ? 'true' : undefined}
              className={`h-[4.4rem] w-[6rem] shrink-0 overflow-hidden rounded-xl border-2 transition-opacity focus-visible:outline-2 focus-visible:outline-[#e9ad5a] ${i === atual ? 'border-[#e9ad5a] opacity-100' : 'border-transparent opacity-70 hover:opacity-100'}`}
            >
              <img src={foto.src} alt="" width="128" height="96" loading="lazy" decoding="async" className="h-full w-full object-cover" />
            </button>
          ))}
        </div>
        <p className="text-center text-xs text-ink-3 sm:hidden">Deslize a foto para navegar pela galeria.</p>
      </>}
      <p className="px-1 text-xs leading-relaxed text-ink-3">Imagens de apresentação do empreendimento. Acabamentos e características devem ser confirmados com o especialista.</p>

      {ampliada && createPortal(
        <div role="dialog" aria-modal="true" aria-label={`Imagem ampliada — ${titulo}`} className="fixed inset-0 z-[100] flex flex-col bg-[#050b15]/98 p-3 text-white sm:p-6">
          <header className="flex shrink-0 items-center justify-between gap-3 pb-3">
            <div className="min-w-0"><p className="truncate text-sm font-semibold">{titulo}</p><p className="text-xs text-white/60">Foto {atual + 1} de {fotos.length}</p></div>
            <button ref={fecharRef} type="button" onClick={() => setAmpliada(false)} className="min-h-11 rounded-full border border-white/30 px-5 text-sm font-semibold hover:bg-white/15 focus-visible:outline-2 focus-visible:outline-[#e9ad5a]">Fechar <span aria-hidden="true">×</span></button>
          </header>
          <div className="flex min-h-0 flex-1 items-center justify-center" onMouseDown={(e) => { if (e.target === e.currentTarget) setAmpliada(false); }}>
            <img src={foco.src} alt={foco.alt} className="max-h-full max-w-full object-contain" />
          </div>
          {fotos.length > 1 && <footer className="flex shrink-0 items-center justify-between gap-3 pt-3">
            <button type="button" disabled={atual === 0} onClick={() => irPara(atual - 1)} className="min-h-11 rounded-full border border-white/30 px-5 text-sm disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-[#e9ad5a]">← Anterior</button>
            <span className="text-xs text-white/60">Use as setas do teclado</span>
            <button type="button" disabled={atual === fotos.length - 1} onClick={() => irPara(atual + 1)} className="min-h-11 rounded-full border border-white/30 px-5 text-sm disabled:opacity-30 focus-visible:outline-2 focus-visible:outline-[#e9ad5a]">Próxima →</button>
          </footer>}
        </div>, document.body,
      )}
    </section>
  );
}
