import { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Icon } from "@/components/ui/Icon";
import { MOCK_PROPERTIES } from "@/data/imoveis";
import { registrarEvento } from "@/services/eventos";
import { enviarLead } from "@/services/leadsPublico";

const ROTAS_PRIVADAS = /^\/(admin|corretor|gerente|viabilizador|login|register|acesso-negado)/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const ContatoContext = createContext({
  abrirContato: () => console.error("ContatoProvider ausente: envolva a página com <ContatoProvider>."),
});

export const useContato = () => useContext(ContatoContext);

const apenasDigitos = (v = "") => v.replace(/\D/g, "").slice(0, 11);
function mascarar(v) {
  const d = apenasDigitos(v);
  if (d.length <= 2) return d ? `(${d}` : "";
  if (d.length <= 6) return `(${d.slice(0, 2)}) ${d.slice(2)}`;
  if (d.length <= 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
}

const FIELD =
  "h-12 w-full rounded-xl border bg-card-2 px-3.5 text-sm text-ink outline-none transition-colors placeholder:text-ink-3 scheme-dark";

function Campo({ rotulo, erro, children }) {
  return (
    <label className="block text-xs text-ink-2">
      {rotulo}
      <div className="mt-1.5">{children}</div>
      {erro && <span className="mt-1 block text-[11px] text-danger">{erro}</span>}
    </label>
  );
}

function ContatoModal({ inicial, onClose }) {
  const [form, setForm] = useState({ empreendimento: inicial ? String(inicial.id) : "", nome: "", email: "", telefone: "" });
  const [erros, setErros] = useState({});
  const [erroGeral, setErroGeral] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [enviado, setEnviado] = useState(false);
  const primeiro = useRef(null);

  useEffect(() => {
    primeiro.current?.focus();
    const aoTeclar = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", aoTeclar);
    const overflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = overflow;
    };
  }, [onClose]);

  const escolhido = MOCK_PROPERTIES.find((p) => String(p.id) === form.empreendimento) ?? null;
  const set = (campo) => (e) => {
    const valor = campo === "telefone" ? mascarar(e.target.value) : e.target.value;
    setForm((f) => ({ ...f, [campo]: valor }));
  };

  function validar() {
    const e = {};
    if (!form.empreendimento) e.empreendimento = "Escolha o empreendimento de interesse.";
    if (!form.nome.trim()) e.nome = "Informe seu nome.";
    if (!EMAIL_REGEX.test(form.email.trim())) e.email = "Informe um e-mail válido.";
    const d = apenasDigitos(form.telefone);
    if (d.length < 10) e.telefone = "Informe um telefone com DDD.";
    return e;
  }

  async function enviar(ev) {
    ev.preventDefault();
    const e = validar();
    setErros(e);
    setErroGeral("");
    if (Object.keys(e).length) return;

    setEnviando(true);
    try {
      await enviarLead({ nome: form.nome.trim(), email: form.email.trim(), telefone: apenasDigitos(form.telefone), empreendimento: escolhido });
      registrarEvento({ tipo: "contato" });
      setEnviado(true);
    } catch (err) {
      setErros({ ...(err.fieldErrors ?? {}) });
      setErroGeral(err.message);
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-[60] flex items-end justify-center bg-black/65 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Fale com um especialista"
        className="animate-fade-up max-h-[94dvh] w-full overflow-y-auto rounded-t-3xl border border-line bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] shadow-2xl sm:max-w-md sm:rounded-3xl sm:p-7"
      >
        <div className="mb-4 flex items-start justify-between gap-3">
          <div>
            <h2 className="text-lg font-semibold">{enviado ? "Recebemos seu contato!" : "Fale com um especialista"}</h2>
            <p className="mt-1 text-[13px] text-ink-2">
              {enviado ? "Em breve um especialista entrará em contato." : "Deixe seus dados e um corretor entra em contato."}
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Fechar"
            className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-gold hover:text-ink"
          >
            <Icon name="x" className="size-5" />
          </button>
        </div>

        {enviado ? (
          <div className="animate-fade-up space-y-5 py-2 text-center" role="status">
            <span className="mx-auto grid size-16 place-items-center rounded-full bg-emerald-500/15 text-emerald-300">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.4" strokeLinecap="round" strokeLinejoin="round" className="size-8" aria-hidden="true">
                <path d="M5 12.5l4.5 4.5L19 7.5" pathLength="1" strokeDasharray="1" style={{ animation: "check-draw 0.6s 0.15s ease-out both" }} />
              </svg>
            </span>
            <p className="text-sm text-ink-2">
              Recebemos as suas informações. <strong className="text-ink">Um especialista da Place Brokers entrará em contato</strong> com você em breve.
            </p>
            <button type="button" onClick={onClose} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110">
              Voltar ao site
            </button>
          </div>
        ) : (
          <form onSubmit={enviar} noValidate className="space-y-3.5">
            <Campo rotulo="Empreendimento de interesse" erro={erros.empreendimento}>
              <select ref={primeiro} value={form.empreendimento} onChange={set("empreendimento")} className={`${FIELD} ${erros.empreendimento ? "border-danger" : "border-line focus:border-gold"}`}>
                <option value="" disabled>Escolha pelo nome...</option>
                {MOCK_PROPERTIES.map((p) => (
                  <option key={p.id} value={p.id}>{p.title} — {p.city}</option>
                ))}
                <option value="geral">Ainda não decidi</option>
              </select>
            </Campo>
            <Campo rotulo="Nome" erro={erros.nome}>
              <input value={form.nome} onChange={set("nome")} autoComplete="name" className={`${FIELD} ${erros.nome ? "border-danger" : "border-line focus:border-gold"}`} />
            </Campo>
            <Campo rotulo="WhatsApp (com DDD)" erro={erros.telefone}>
              <input value={form.telefone} onChange={set("telefone")} inputMode="tel" autoComplete="tel" placeholder="(81) 99999-9999" className={`${FIELD} ${erros.telefone ? "border-danger" : "border-line focus:border-gold"}`} />
            </Campo>
            <Campo rotulo="E-mail" erro={erros.email}>
              <input type="email" value={form.email} onChange={set("email")} autoComplete="email" className={`${FIELD} ${erros.email ? "border-danger" : "border-line focus:border-gold"}`} />
            </Campo>

            {erroGeral && <p role="alert" className="text-xs text-danger">{erroGeral}</p>}

            <button type="submit" disabled={enviando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] transition hover:brightness-110 disabled:cursor-not-allowed disabled:opacity-60">
              {enviando ? "Enviando..." : "Quero falar com um especialista"}
            </button>
            <p className="text-center text-[11px] text-ink-3">Seus dados são usados só para o contato sobre o empreendimento.</p>
          </form>
        )}
      </div>
    </div>
  );
}

export function ContatoProvider({ children }) {
  const { pathname } = useLocation();
  const [aberto, setAberto] = useState(false);
  const [inicial, setInicial] = useState(null);

  const abrirContato = useCallback((empreendimento = null) => {
    setInicial(empreendimento);
    setAberto(true);
  }, []);
  const fechar = useCallback(() => setAberto(false), []);
  const valor = useMemo(() => ({ abrirContato }), [abrirContato]);

  const mostrarBotao = !ROTAS_PRIVADAS.test(pathname) && !aberto;

  return (
    <ContatoContext.Provider value={valor}>
      {children}

      {mostrarBotao && (
        <button
          type="button"
          onClick={() => abrirContato(null)}
          aria-label="Fale com um especialista"
          className="fixed bottom-[max(1rem,env(safe-area-inset-bottom))] right-4 z-50 flex items-center gap-3 sm:right-6"
        >
          <span className="animate-fade-in hidden rounded-full border border-line bg-card/95 px-4 py-2 text-[13px] font-medium text-ink shadow-lg backdrop-blur sm:block">
            Fale com especialista
          </span>
          <span className="relative grid size-14 place-items-center rounded-full bg-[#25D366] text-[#06210f] shadow-xl shadow-black/40 transition-transform hover:scale-105 active:scale-95">
            <span className="absolute inset-0 -z-10 animate-ping rounded-full bg-[#25D366]/40" />
            <Icon name="messageCircle" className="size-7" />
          </span>
        </button>
      )}

      {aberto && <ContatoModal key={inicial?.id ?? "geral"} inicial={inicial} onClose={fechar} />}
    </ContatoContext.Provider>
  );
}