import AgendamentoStatusBadge from "./AgendamentoStatusBadge";
import AgendamentoTipoBadge from "./AgendamentoTipoBadge";

function formatarDataHora(iso) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function AgendamentosTable({ agendamentos = [], onSelecionar }) {
  if (!agendamentos.length) {
    return (
      <div className="rounded-xl border border-dashed border-slate-300 p-10 text-center text-sm text-slate-500">
        Nenhum agendamento encontrado com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-xl border border-slate-200 bg-white shadow-sm">
      <table className="min-w-full divide-y divide-slate-200 text-sm">
        <thead className="bg-slate-50 text-left text-xs font-medium uppercase tracking-wide text-slate-500">
          <tr>
            <th className="px-4 py-3">Data/hora</th>
            <th className="px-4 py-3">Tipo</th>
            <th className="px-4 py-3">Cliente</th>
            <th className="px-4 py-3">Corretor</th>
            <th className="px-4 py-3">Imóvel</th>
            <th className="px-4 py-3">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-slate-100">
          {agendamentos.map((a) => (
            <tr
              key={a.id}
              onClick={() => onSelecionar(a)}
              className="cursor-pointer hover:bg-slate-50"
            >
              <td className="whitespace-nowrap px-4 py-3 font-medium text-slate-900">{formatarDataHora(a.dataHora)}</td>
              <td className="px-4 py-3"><AgendamentoTipoBadge tipo={a.tipo} /></td>
              <td className="px-4 py-3 text-slate-700">{a.cliente?.nome ?? "—"}</td>
              <td className="px-4 py-3 text-slate-700">{a.corretor?.nome ?? "—"}</td>
              <td className="px-4 py-3 text-slate-700">{a.empreendimento?.nome ?? "—"}</td>
              <td className="px-4 py-3"><AgendamentoStatusBadge status={a.status} /></td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}