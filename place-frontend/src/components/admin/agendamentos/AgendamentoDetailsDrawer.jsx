import { useState } from "react";
import Icon from "@/components/ui/Icon";
import AgendamentoStatusBadge from "./AgendamentoStatusBadge";
import AgendamentoTipoBadge from "./AgendamentoTipoBadge";

export default function AgendamentoDetailsDrawer({ agendamento, onFechar, onAtualizarStatus }) {
  const [motivoCancelamento, setMotivoCancelamento] = useState("");
  const [mostrarCancelamento, setMostrarCancelamento] = useState(false);
  const [enviando, setEnviando] = useState(false);
  const [erro, setErro] = useState("");

  if (!agendamento) return null;

  async function mudarStatus(status, extra = {}) {
    setErro("");
    setEnviando(true);
    try {
      await onAtualizarStatus(agendamento.id, status, extra);
      setMostrarCancelamento(false);
      setMotivoCancelamento("");
    } catch (err) {
      setErro(err.message ?? "Não foi possível atualizar o status.");
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/30">
      <div className="h-full w-full max-w-md overflow-y-auto bg-white p-6 shadow-xl">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-slate-900">Agendamento</h2>
          <button type="button" onClick={onFechar} className="rounded-md p-1 hover:bg-slate-100">
            <Icon name="x" className="h-5 w-5" />
          </button>
        </div>

        {erro && <div className="mb-4 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{erro}</div>}

        <div className="space-y-3 text-sm">
          <AgendamentoTipoBadge tipo={agendamento.tipo} />
          <p className="text-lg font-medium text-slate-900">
            {new Date(agendamento.dataHora).toLocaleString("pt-BR", { dateStyle: "full", timeStyle: "short" })}
          </p>
          <div><AgendamentoStatusBadge status={agendamento.status} /></div>

          <dl className="divide-y divide-slate-100 rounded-lg border border-slate-200">
            <div className="flex justify-between px-3 py-2">
              <dt className="text-slate-500">Cliente</dt>
              <dd className="font-medium text-slate-800">{agendamento.cliente?.nome ?? "—"}</dd>
            </div>
            <div className="flex justify-between px-3 py-2">
              <dt className="text-slate-500">Corretor</dt>
              <dd className="font-medium text-slate-800">{agendamento.corretor?.nome ?? "—"}</dd>
            </div>
            {agendamento.tipo === "visita_imovel" ? (
              <div className="flex justify-between px-3 py-2">
                <dt className="text-slate-500">Imóvel</dt>
                <dd className="font-medium text-slate-800">{agendamento.empreendimento?.nome ?? "—"}</dd>
              </div>
            ) : (
              <div className="flex justify-between px-3 py-2">
                <dt className="text-slate-500">Local</dt>
                <dd className="font-medium text-slate-800">{agendamento.local ?? "—"}</dd>
              </div>
            )}
            {agendamento.observacoes && (
              <div className="px-3 py-2">
                <dt className="text-slate-500">Observações</dt>
                <dd className="mt-1 text-slate-700">{agendamento.observacoes}</dd>
              </div>
            )}
            {agendamento.motivoCancelamento && (
              <div className="px-3 py-2">
                <dt className="text-slate-500">Motivo do cancelamento</dt>
                <dd className="mt-1 text-slate-700">{agendamento.motivoCancelamento}</dd>
              </div>
            )}
          </dl>
        </div>

        {!["cancelado", "realizado", "nao_compareceu"].includes(agendamento.status) && (
          <div className="mt-6 space-y-2">
            {agendamento.status === "agendado" && (
              <button
                type="button"
                disabled={enviando}
                onClick={() => mudarStatus("confirmado")}
                className="w-full rounded-lg bg-blue-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
              >
                Confirmar presença
              </button>
            )}

            <button
              type="button"
              disabled={enviando}
              onClick={() => mudarStatus("realizado")}
              className="w-full rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              Marcar como realizado
            </button>

            <button
              type="button"
              disabled={enviando}
              onClick={() => mudarStatus("nao_compareceu")}
              className="w-full rounded-lg bg-amber-500 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
            >
              Cliente não compareceu
            </button>

            {!mostrarCancelamento ? (
              <button
                type="button"
                onClick={() => setMostrarCancelamento(true)}
                className="w-full rounded-lg border border-red-300 px-4 py-2.5 text-sm font-medium text-red-600"
              >
                Cancelar agendamento
              </button>
            ) : (
              <div className="space-y-2 rounded-lg border border-red-200 p-3">
                <label className="block text-sm font-medium text-slate-700">Motivo do cancelamento</label>
                <textarea
                  value={motivoCancelamento}
                  onChange={(e) => setMotivoCancelamento(e.target.value)}
                  rows={2}
                  className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm"
                />
                <button
                  type="button"
                  disabled={enviando || !motivoCancelamento.trim()}
                  onClick={() => mudarStatus("cancelado", { motivoCancelamento })}
                  className="w-full rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white disabled:opacity-60"
                >
                  Confirmar cancelamento
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}