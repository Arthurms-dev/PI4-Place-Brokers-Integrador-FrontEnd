import { useEffect, useRef, useState } from "react";
import { Icon } from "@/components/ui/Icon";
import { registrarAtividade } from "@/services/leadAtividades";
import {
  atalhosLembrete,
  baixarIcsLembrete,
  formatarTelefone,
  linkLigar,
  linkWhatsApp,
  paraCampoDataHora,
  tempoDesde,
  urgencia,
} from "@/lib/atendimento";

const COR_ESPERA = {
  ok: "bg-emerald-500/15 text-emerald-300",
  atencao: "bg-amber-500/15 text-amber-300",
  atrasado: "bg-danger/15 text-danger",
};
const quandoTexto = (iso) =>
  new Date(iso).toLocaleString("pt-BR", { weekday: "short", day: "2-digit", month: "2-digit", hour: "2-digit", minute: "2-digit" });

/** Atualiza a cada 30 s, para o "há X min" do lead novo andar sozinho. */
function useAgora() {
  const [agora, setAgora] = useState(() => new Date());
  useEffect(() => {
    const t = setInterval(() => setAgora(new Date()), 30000);
    return () => clearInterval(t);
  }, []);
  return agora;
}

function LembreteFolha({ lead, onClose, onSalvo }) {
  const [quando, setQuando] = useState("");
  const [nota, setNota] = useState("");
  const [salvando, setSalvando] = useState(false);
  const [erro, setErro] = useState("");
  const [salvo, setSalvo] = useState(null);
  const atalhos = atalhosLembrete();

  useEffect(() => {
    const aoTeclar = (e) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", aoTeclar);
    const rolagem = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", aoTeclar);
      document.body.style.overflow = rolagem;
    };
  }, [onClose]);

  async function salvar(e) {
    e.preventDefault();
    if (!quando) return setErro("Escolha quando retornar.");
    const data = new Date(quando);
    if (data <= new Date()) return setErro("Escolha um horário daqui pra frente.");
    setSalvando(true);
    setErro("");
    try {
      const atividade = await registrarAtividade(lead.id, {
        tipo: "observacao",
        descricao: nota.trim() || "Pediu para retornar em outro horário.",
        proximoContatoEm: data.toISOString(),
      });
      const retorno = { atividadeId: atividade.id, leadId: lead.id, proximoContatoEm: atividade.proximoContatoEm, nota: atividade.descricao, atrasado: false };
      setSalvo(retorno);
      onSalvo(retorno);
    } catch (err) {
      setErro(err.message);
    } finally {
      setSalvando(false);
    }
  }

  const campo = "h-12 w-full rounded-xl border border-line bg-card-2 px-3.5 text-base text-ink outline-none focus:border-gold scheme-dark sm:text-sm";

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/65 sm:items-center sm:p-4" onMouseDown={(e) => e.target === e.currentTarget && onClose()}>
      <div className="animate-fade-up max-h-[94dvh] w-full space-y-4 overflow-y-auto rounded-t-3xl border border-line bg-card p-5 pb-[max(1.25rem,env(safe-area-inset-bottom))] sm:max-w-md sm:rounded-3xl sm:p-7">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <h2 className="text-lg font-semibold">Lembrete de retorno</h2>
            <p className="truncate text-[13px] text-ink-2">{lead.nome}{lead.empreendimento?.nome ? ` · ${lead.empreendimento.nome}` : ""}</p>
          </div>
          <button type="button" onClick={onClose} aria-label="Fechar" className="grid size-11 shrink-0 place-items-center rounded-full border border-line text-ink-2 hover:border-gold hover:text-ink">
            <Icon name="x" className="size-5" />
          </button>
        </div>

        {salvo ? (
          <div className="space-y-3" role="status">
            <p className="rounded-xl border border-emerald-400/30 bg-emerald-500/10 p-3 text-[13px] text-emerald-200">
              Lembrete salvo para <b>{quandoTexto(salvo.proximoContatoEm)}</b>. Ele aparece no seu Início e no histórico do cliente.
            </p>
            <button
              type="button"
              onClick={() => baixarIcsLembrete({ id: salvo.atividadeId, nome: lead.nome, telefone: lead.telefone, empreendimento: lead.empreendimento?.nome, nota: salvo.nota, quando: salvo.proximoContatoEm })}
              className="inline-flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] hover:brightness-110"
            >
              <Icon name="bell" className="size-4.5" /> Pôr alarme no celular
            </button>
            <p className="text-center text-[11px] text-ink-3">Abre no calendário do celular e toca na hora marcada, mesmo com o site fechado.</p>
            <button type="button" onClick={onClose} className="h-11 w-full rounded-xl border border-line text-sm text-ink-2 hover:text-ink">Fechar</button>
          </div>
        ) : (
          <form onSubmit={salvar} noValidate className="space-y-3.5">
            <div className="flex flex-wrap gap-2">
              {atalhos.map((a) => (
                <button key={a.rotulo} type="button" onClick={() => setQuando(paraCampoDataHora(a.data))}
                  aria-pressed={quando === paraCampoDataHora(a.data)}
                  className={`h-10 rounded-full border px-4 text-[13px] ${quando === paraCampoDataHora(a.data) ? "border-gold bg-gold/15 text-gold" : "border-line text-ink-2 hover:text-ink"}`}>
                  {a.rotulo}
                </button>
              ))}
            </div>
            <label className="block text-xs text-ink-2">
              Dia e hora
              <input type="datetime-local" value={quando} min={paraCampoDataHora(new Date())} onChange={(e) => setQuando(e.target.value)} className={`${campo} mt-1.5`} />
            </label>
            <label className="block text-xs text-ink-2">
              Nota (opcional)
              <input value={nota} onChange={(e) => setNota(e.target.value)} maxLength={300} placeholder="Ex.: pediu para ligar depois do almoço" className={`${campo} mt-1.5`} />
            </label>
            {erro && <p role="alert" className="text-xs text-danger">{erro}</p>}
            <button type="submit" disabled={salvando} className="h-12 w-full rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] hover:brightness-110 disabled:opacity-60">
              {salvando ? "Salvando..." : "Salvar lembrete"}
            </button>
          </form>
        )}
      </div>
    </div>
  );
}

/**
 * Ações rápidas do lead para o corretor: número fácil de copiar, ligar, WhatsApp e lembrete.
 * Ligar ou abrir o WhatsApp registra o contato no histórico (de onde sai o tempo de retorno)
 * e tira o lead de "Novo".
 */
export function AtendimentoLead({ lead, retorno, onIniciarAtendimento, onRetorno }) {
  const agora = useAgora();
  const [copiado, setCopiado] = useState(false);
  const [lembrete, setLembrete] = useState(false);
  const ultimoRegistro = useRef(0);
  const espera = lead.status === "novo" ? urgencia(lead.criadoEm, agora) : null;

  function registrarContato(tipo) {
    if (Date.now() - ultimoRegistro.current < 2 * 60 * 1000) return; // evita duplicar com toques seguidos
    ultimoRegistro.current = Date.now();
    registrarAtividade(lead.id, {
      tipo,
      descricao: tipo === "ligacao" ? "Ligou para o cliente pelo app." : "Abriu a conversa no WhatsApp pelo app.",
    }).catch(() => {});
    if (lead.status === "novo") onIniciarAtendimento?.(lead);
  }

  async function copiar() {
    try {
      await navigator.clipboard.writeText(formatarTelefone(lead.telefone));
      setCopiado(true);
      setTimeout(() => setCopiado(false), 1800);
    } catch {
      /* sem permissão: o número continua selecionável para copiar segurando */
    }
  }

  const botao = "inline-flex h-11 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold transition";

  return (
    <div className="space-y-2.5">
      {(espera || retorno) && (
        <div className="flex flex-wrap gap-2">
          {espera && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${COR_ESPERA[espera]}`}>
              <Icon name="clock" className="size-3.5" /> Aguardando retorno {tempoDesde(lead.criadoEm, agora)}
            </span>
          )}
          {retorno && (
            <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-medium ${retorno.atrasado || new Date(retorno.proximoContatoEm) < agora ? "bg-danger/15 text-danger" : "bg-gold/15 text-gold"}`}>
              <Icon name="bell" className="size-3.5" /> Retornar {quandoTexto(retorno.proximoContatoEm)}
            </span>
          )}
        </div>
      )}

      {lead.telefone && (
        <div className="flex items-center gap-2 rounded-xl bg-card-2 px-3 py-2">
          <Icon name="phone" className="size-4 shrink-0 text-gold" />
          <span className="min-w-0 flex-1 select-all font-mono text-[15px] tracking-wide text-ink" title="Segure para copiar">
            {formatarTelefone(lead.telefone)}
          </span>
          <button type="button" onClick={copiar} className="h-9 shrink-0 rounded-lg border border-line px-3 text-[12px] text-ink-2 hover:border-gold hover:text-ink">
            {copiado ? "Copiado!" : "Copiar"}
          </button>
        </div>
      )}

      <div className={`grid gap-2 ${lead.telefone ? "grid-cols-3" : "grid-cols-1"}`}>
        {lead.telefone && (<>
        <a href={linkLigar(lead.telefone)} onClick={() => registrarContato("ligacao")} className={`${botao} bg-gold-gradient text-[#1a1408] hover:brightness-110`}>
          <Icon name="phone" className="size-4.5" /> Ligar
        </a>
        <a href={linkWhatsApp(lead.telefone)} target="_blank" rel="noreferrer" onClick={() => registrarContato("whatsapp")} className={`${botao} bg-[#25D366] text-[#06210f] hover:brightness-105`}>
          <Icon name="messageCircle" className="size-4.5" /> WhatsApp
        </a>
        </>)}
        <button type="button" onClick={() => setLembrete(true)} className={`${botao} border border-line text-ink-2 hover:border-gold hover:text-ink`}>
          <Icon name="bell" className="size-4.5" /> Lembrete
        </button>
      </div>

      {lembrete && (
        <LembreteFolha
          lead={lead}
          onClose={() => setLembrete(false)}
          onSalvo={(r) => {
            onRetorno?.(lead, r);
            if (lead.status === "novo") onIniciarAtendimento?.(lead);
          }}
        />
      )}
    </div>
  );
}
