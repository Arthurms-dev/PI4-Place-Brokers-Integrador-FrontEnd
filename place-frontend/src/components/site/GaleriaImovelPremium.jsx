import { useEffect, useMemo, useRef, useState } from "react";
import { createPortal } from "react-dom";
import { Icon } from "@/components/ui/Icon";
import "@/styles/galeria.css";

function Foto({ foto, principal = false, className = "" }) {
  const [falhou, setFalhou] = useState(false);
  useEffect(() => setFalhou(false), [foto.src]);
  return falhou ? (
    <span role="img" aria-label={`${foto.alt} — imagem indisponível`} className={`pb-gallery-missing ${className}`}><Icon name="building" /><span>Imagem indisponível</span></span>
  ) : (
    <img src={foto.src} alt={foto.alt} loading={principal ? "eager" : "lazy"} decoding="async" draggable={false} onError={() => setFalhou(true)} className={className} />
  );
}

export default function GaleriaImovelPremium({ imagens = [], titulo = "Empreendimento" }) {
  const fotos = useMemo(() => Array.isArray(imagens) ? imagens.filter((foto) => foto?.src) : [], [imagens]);
  const [atual, setAtual] = useState(0);
  const [ampliada, setAmpliada] = useState(false);
  const [zoom, setZoom] = useState(false);
  const janela = useRef(null);
  const fechar = useRef(null);
  const toque = useRef(null);
  const indice = Math.min(atual, Math.max(0, fotos.length - 1));
  const foco = fotos[indice];

  function selecionar(novo) {
    setAtual(Math.max(0, Math.min(fotos.length - 1, novo)));
    setZoom(false);
  }

  function abrir(novo) {
    selecionar(novo);
    setAmpliada(true);
  }

  useEffect(() => {
    setAtual(0);
    setAmpliada(false);
    setZoom(false);
  }, [titulo]);

  useEffect(() => {
    if (!ampliada) return undefined;
    const anterior = document.activeElement;
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    fechar.current?.focus();
    return () => {
      document.body.style.overflow = overflow;
      if (anterior?.isConnected) anterior.focus?.();
    };
  }, [ampliada]);

  useEffect(() => {
    if (!ampliada) return undefined;
    function aoTeclar(evento) {
      if (evento.key === "Escape") {
        evento.preventDefault();
        evento.stopImmediatePropagation();
        setAmpliada(false);
      } else if (evento.key === "ArrowLeft" || evento.key === "ArrowRight") {
        evento.preventDefault();
        selecionar(indice + (evento.key === "ArrowRight" ? 1 : -1));
      } else if (evento.key === "Tab") {
        const botoes = [...janela.current.querySelectorAll('button:not(:disabled), a[href], [tabindex="0"]')];
        const primeiro = botoes[0];
        const ultimo = botoes[botoes.length - 1];
        if (evento.shiftKey && (document.activeElement === primeiro || !janela.current.contains(document.activeElement))) {
          evento.preventDefault();
          ultimo?.focus();
        } else if (!evento.shiftKey && (document.activeElement === ultimo || !janela.current.contains(document.activeElement))) {
          evento.preventDefault();
          primeiro?.focus();
        }
      }
    }
    document.addEventListener("keydown", aoTeclar, true);
    return () => document.removeEventListener("keydown", aoTeclar, true);
  }, [ampliada, indice, fotos.length]);

  useEffect(() => {
    if (ampliada) janela.current?.querySelector('[aria-current="true"]')?.scrollIntoView?.({ block: "nearest", inline: "nearest" });
  }, [ampliada, indice]);

  if (!foco) return <div className="pb-gallery-empty"><Icon name="building" className="size-12" /><strong>Conheça cada detalhe com a Place</strong><p>Peça as imagens deste empreendimento ao especialista.</p></div>;

  const visiveis = fotos.slice(0, 5);
  return (
    <section aria-label={`Fotos de ${titulo}`} className="pb-gallery">
      <div className={`pb-gallery-mosaic pb-gallery-count-${visiveis.length}`}>
        {visiveis.map((foto, i) => (
          <button key={`${foto.src}-${i}`} type="button" onClick={() => abrir(i)} aria-label={`Ampliar foto ${i + 1} de ${titulo}`} className="pb-gallery-tile">
            <Foto foto={foto} principal={i === 0} />
            {i === 0 && <span className="pb-gallery-photo-label"><Icon name="eye" className="size-4" /> Conheça de perto</span>}
            {i === 4 && fotos.length > 5 && <span className="pb-gallery-more">+{fotos.length - 5} fotos</span>}
          </button>
        ))}
      </div>
      <div className="pb-gallery-toolbar">
        <p><strong>{fotos.length} {fotos.length === 1 ? "foto" : "fotos"}</strong><span> · {titulo}</span></p>
        <button type="button" onClick={() => abrir(0)}><Icon name="columns" className="size-4" />{fotos.length === 1 ? "Ampliar foto" : "Ver todas as fotos"}<Icon name="arrowRight" className="size-4" /></button>
      </div>
      <p className="pb-gallery-disclaimer">Imagens de apresentação. Confirme acabamentos e características com o especialista.</p>
      {ampliada && createPortal(
        <div ref={janela} role="dialog" aria-modal="true" aria-label={`Galeria de ${titulo}`} className="pb-gallery-viewer">
          <header className="pb-gallery-viewer-header">
            <div><strong>{titulo}</strong><p aria-live="polite">Foto {indice + 1} de {fotos.length}</p></div>
            <div className="pb-gallery-viewer-actions">
              <button type="button" aria-pressed={zoom} onClick={() => setZoom((valor) => !valor)}>{zoom ? "Reduzir" : "Ampliar"}</button>
              <button ref={fechar} type="button" onClick={() => setAmpliada(false)} aria-label="Fechar galeria"><Icon name="x" /><span>Fechar</span></button>
            </div>
          </header>
          <div className={`pb-gallery-viewer-photo ${zoom ? "is-zoomed" : ""}`}
            onTouchStart={(e) => { toque.current = e.touches.length === 1 ? { x: e.touches[0].clientX, y: e.touches[0].clientY } : null; }}
            onTouchEnd={(e) => {
              const inicio = toque.current;
              toque.current = null;
              if (!inicio || zoom || !e.changedTouches[0]) return;
              const dx = e.changedTouches[0].clientX - inicio.x;
              const dy = e.changedTouches[0].clientY - inicio.y;
              if (Math.abs(dx) > 50 && Math.abs(dx) > Math.abs(dy)) selecionar(indice + (dx < 0 ? 1 : -1));
            }}>
            <Foto key={foco.src} foto={foco} principal className="pb-gallery-viewer-image" />
          </div>
          <footer className="pb-gallery-viewer-footer">
            <div className="pb-gallery-viewer-navigation">
              <button type="button" aria-label="Foto anterior" disabled={indice === 0} onClick={() => selecionar(indice - 1)}><Icon name="chevronLeft" /> Anterior</button>
              <p>{foco.alt}</p>
              <button type="button" aria-label="Próxima foto" disabled={indice === fotos.length - 1} onClick={() => selecionar(indice + 1)}>Próxima <Icon name="chevronRight" /></button>
            </div>
            {fotos.length > 1 && <div className="pb-gallery-thumbnails" aria-label="Escolher foto">{fotos.map((foto, i) => <button key={`${foto.src}-${i}`} type="button" aria-label={`Ver foto ${i + 1}`} aria-current={i === indice ? "true" : undefined} onClick={() => selecionar(i)}><Foto foto={foto} /></button>)}</div>}
            <p className="pb-gallery-help">Deslize no celular ou use as setas do teclado. Esc para fechar.</p>
          </footer>
        </div>, document.body,
      )}
    </section>
  );
}
