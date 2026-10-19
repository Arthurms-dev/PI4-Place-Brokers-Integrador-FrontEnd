import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { useEmpreendimentosPublicos } from "@/data/empreendimentosPublicos";
import FormularioContato from "./FormularioContato";

const ROTAS_PRIVADAS = /^\/(admin|corretor|gerente|viabilizador|login|register|acesso-negado)/;

const ContatoContext = createContext({
  abrirContato: () => console.error("ContatoProvider ausente: envolva a página com <ContatoProvider>."),
});

export const useContato = () => useContext(ContatoContext);

function JanelaContato({ inicial, canal, onClose }) {
  const { itens } = useEmpreendimentosPublicos();

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

  return (
    <div className="animate-fade-in fixed inset-0 z-[60] flex items-end justify-center bg-black/65 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div role="dialog" aria-modal="true" aria-label="Fale com um especialista" className="animate-slide-up sm:animate-fade-up max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-7">
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="font-display text-xl font-semibold">Fale com um especialista</h2>
            <p className="mt-1 text-[13px] text-ink-2">Deixe seus dados e um corretor entra em contato.</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-gold hover:text-ink">
            <Icon name="x" className="size-5" />
          </button>
        </div>
        <FormularioContato empreendimento={inicial} opcoes={itens} autoFoco aoVoltar={onClose} canal={canal} />
      </div>
    </div>
  );
}

export function ContatoProvider({ children }) {
  const { pathname } = useLocation();
  const [aberto, setAberto] = useState(false);
  const [inicial, setInicial] = useState(null);
  const [canal, setCanal] = useState("");

  const abrirContato = useCallback((empreendimento = null, canal = "") => {
    setInicial(empreendimento);
    setCanal(canal);
    setAberto(true);
  }, []);
  const fechar = useCallback(() => setAberto(false), []);
  const valor = useMemo(() => ({ abrirContato }), [abrirContato]);
  const mostrarBotao = !ROTAS_PRIVADAS.test(pathname) && !aberto;

  return (
    <ContatoContext.Provider value={valor}>
      {children}

      {mostrarBotao && (
        <button type="button" onClick={() => abrirContato(null, "botão flutuante")} aria-label="Fale com um especialista" className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex items-center gap-3 sm:right-6">
          <span className="animate-fade-in hidden rounded-full border border-line bg-card/95 px-4 py-2 text-[13px] font-medium text-ink shadow-lg backdrop-blur sm:block">Fale com especialista</span>
          <span className="relative grid size-14 place-items-center rounded-full bg-[#25D366] text-[#06210f] shadow-xl shadow-black/40 transition-transform hover:scale-105 active:scale-95">
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40" />
            <Icon name="messageCircle" className="size-7" />
          </span>
        </button>
      )}

      {aberto && <JanelaContato key={inicial?.id ?? "geral"} inicial={inicial} canal={canal} onClose={fechar} />}
    </ContatoContext.Provider>
  );
}
