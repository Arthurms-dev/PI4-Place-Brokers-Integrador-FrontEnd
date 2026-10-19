import { useState } from "react";
import { Icon } from "@/components/ui/Icon";
import AgendamentoDrawer from "./AgendamentoDrawer";
import AgendamentoStatusBadge from "./AgendamentoStatusBadge";
import AgendamentoTipoBadge from "./AgendamentoTipoBadge";

const ENCERRADOS = ["realizado", "cancelado", "nao_compareceu"];
const paraInput = (d) => {
  const p = (n) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}T${p(d.getHours())}:${p(d.getMinutes())}`;
};
const zap = (tel, nome) => `https://wa.me/55${(tel ?? "").replace(/\D/g, "")}?text=${encodeURIComponent(`Olá, ${nome}! Aqui é da Place Brokers.`)}`;
const BOTAO = "h-12 w-full rounded-xl border text-sm font-medium transition-colors disabled:opacity-50";

function Linha({ rotulo, children }) {
  return (
    <div className="flex justify-between gap-4 px-4 py-3">
      <dt className="text-ink-3">{rotulo}</dt>
      <dd className="text-right font-medium">{children}</dd>
    </div>
  );
}

export default function AgendamentoDetailsDrawer({ agendamento, onFechar, onAtualizarStatus, onRemarcar }) {
  const [motivo, setMotivo] = useState("");
  const [cancelando, setCancelando] = useState(false);
  const [remarcando, setRemarcando] = useState(false);
  const [novaData, setNovaData] = useState("");
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  if (!agendamento) return null;

  const encerrado = ENCERRADOS.includes(agendamento.status);
  const passou = new Date(agendamento.dataHora) <= new Date();

  async function executar(acao) {
    setErro("");
    setEnviando(true);
    try {
      await acao();
    } catch (err) {
      setErro(err.message ?? "Não foi possível concluir a ação.");
    } finally {
      setEnviando(false);
    }
  }
  const mudarStatus = (status, extra = {}) =>
    executar(async () => {
      await onAtualizarStatus(agendamento.id, status, extra);
      setCancelando(false);
      setMotivo("");
    });
  const remarcar = () =>
    executar(async () => {
      await onRemarcar(agendamento.id, new Date(novaData).toISOString());
      setRemarcando(false);
    });

  return (
    <AgendamentoDrawer titulo="Agendamento" onFechar={onFechar}>
      <div className="space-y-4 text-sm">
        {erro && <p role="alert" className="rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-danger">{erro}</p>}

        <div className="space-y-2">
          <AgendamentoTipoBadge tipo={agendamento.tipo} />
          <p className="text-xl font-semibold capitalize">
            {new Date(agendamento.dataHora).toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })}
          </p>
          <AgendamentoStatusBadge status={agendamento.status} />
        </div>

        <dl className="divide-y divide-line-soft rounded-2xl border border-line bg-card-2">
          <Linha rotulo="Cliente">{agendamento.cliente?.nome ?? "—"}</Linha>
          <Linha rotulo="Corretor">{agendamento.corretor?.nome ?? "—"}</Linha>
          {agendamento.tipo === "visita_imovel" ? (
            <Linha rotulo="Imóvel">{agendamento.empreendimento?.nome ?? "—"}</Linha>
          ) : (
            <Linha rotulo="Local">{agendamento.local ?? "—"}</Linha>
          )}
          {agendamento.observacoes && (
            <div className="px-4 py-3">
              <dt className="text-ink-3">Observações</dt>
              <dd className="mt-1 text-ink-2">{agendamento.observacoes}</dd>
            </div>
          )}
          {agendamento.motivoCancelamento && (
            <div className="px-4 py-3">
              <dt className="text-ink-3">Motivo do cancelamento</dt>
              <dd className="mt-1 text-ink-2">{agendamento.motivoCancelamento}</dd>
            </div>
          )}
        </dl>

        <div className="space-y-2">
          {agendamento.cliente?.telefone && (
            <a href={zap(agendamento.cliente.telefone, agendamento.cliente.nome)} target="_blank" rel="noreferrer"
              className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[#25D366] text-sm font-semibold text-[#06210f] transition hover:brightness-105">
              <Icon name="messageCircle" className="size-5" /> Chamar no WhatsApp
            </a>
          )}

          {!encerrado && (
            <>
              {agendamento.status === "agendado" && (
                <button type="button" disabled={enviando} onClick={() => mudarStatus("confirmado")} className={`${BOTAO} border-sky-400/40 text-sky-300 hover:bg-sky-500/10`}>
                  Confirmar presença
                </button>
              )}
              {passou && (
                <>
                  <button type="button" disabled={enviando} onClick={() => mudarStatus("realizado")} className={`${BOTAO} border-emerald-400/40 text-emerald-300 hover:bg-emerald-500/10`}>
                    Marcar como realizado
                  </button>
                  <button type="button" disabled={enviando} onClick={() => mudarStatus("nao_compareceu")} className={`${BOTAO} border-amber-400/40 text-amber-300 hover:bg-amber-500/10`}>
                    Cliente não compareceu
                  </button>
                </>
              )}

              {onRemarcar && !remarcando && (
                <button type="button" onClick={() => { setNovaData(paraInput(new Date(agendamento.dataHora))); setRemarcando(true); }} className={`${BOTAO} border-line text-ink-2 hover:border-gold hover:text-ink`}>
                  Remarcar
                </button>
              )}
              {remarcando && (
                <div className="animate-fade-in space-y-2 rounded-2xl border border-line p-3">
                  <input type="datetime-local" value={novaData} onChange={(e) => setNovaData(e.target.value)} aria-label="Nova data e hora"
                    className="h-12 w-full rounded-xl border border-line bg-card-2 px-3.5 text-sm outline-none focus:border-gold scheme-dark" />
                  <div className="grid grid-cols-2 gap-2">
                    <button type="button" onClick={() => setRemarcando(false)} className={`${BOTAO} border-line text-ink-2`}>Voltar</button>
                    <button type="button" disabled={enviando || !novaData} onClick={remarcar} className="h-12 rounded-xl bg-gold-gradient text-sm font-semibold text-[#1a1408] disabled:opacity-50">
                      {enviando ? "Salvando..." : "Salvar"}
                    </button>
                  </div>
                </div>
              )}

              {!cancelando ? (
                <button type="button" onClick={() => setCancelando(true)} className={`${BOTAO} border-danger/40 text-danger hover:bg-danger/10`}>
                  Cancelar agendamento
                </button>
              ) : (
                <div className="animate-fade-in space-y-2 rounded-2xl border border-danger/30 p-3">
                  <label className="block text-xs text-ink-2">
                    Motivo do cancelamento
                    <textarea value={motivo} onChange={(e) => setMotivo(e.target.value)} rows={2}
                      className="mt-1.5 w-full rounded-xl border border-line bg-card-2 px-3.5 py-3 text-sm outline-none focus:border-gold scheme-dark" />
                  </label>
                  <button type="button" disabled={enviando || !motivo.trim()} onClick={() => mudarStatus("cancelado", { motivoCancelamento: motivo.trim() })}
                    className="h-12 w-full rounded-xl bg-danger text-sm font-semibold text-white disabled:opacity-50">
                    Confirmar cancelamento
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>
    </AgendamentoDrawer>
  );
}