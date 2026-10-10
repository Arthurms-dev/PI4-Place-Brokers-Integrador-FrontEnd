import AgendamentoStatusBadge from "./AgendamentoStatusBadge";
import AgendamentoTipoBadge from "./AgendamentoTipoBadge";

function formatarDataHora(iso) {
  return new Date(iso).toLocaleString("pt-BR", { dateStyle: "short", timeStyle: "short" });
}

export default function AgendamentosTable({ agendamentos = [], onSelecionar }) {
  if (!agendamentos.length) {
    return (
      <div className="animate-fade-in rounded-2xl border border-dashed border-line p-10 text-center text-sm text-ink-2">
        Nenhum agendamento encontrado com os filtros atuais.
      </div>
    );
  }

  return (
    <div className="animate-fade-in">
      {/* PC: tabela */}
      <div className="hidden overflow-x-auto rounded-2xl border border-line bg-card md:block">
        <table className="min-w-full text-sm">
          <thead className="border-b border-line-soft text-left text-[11px] font-medium uppercase tracking-wide text-ink-3">
            <tr>
              {["Data/hora", "Tipo", "Cliente", "Corretor", "Imóvel", "Status"].map((t) => (
                <th key={t} className="px-4 py-3">{t}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-line-soft">
            {agendamentos.map((a) => (
              <tr key={a.id} onClick={() => onSelecionar(a)} className="cursor-pointer transition-colors hover:bg-card-2">
                <td className="whitespace-nowrap px-4 py-3 font-medium">{formatarDataHora(a.dataHora)}</td>
                <td className="px-4 py-3"><AgendamentoTipoBadge tipo={a.tipo} /></td>
                <td className="px-4 py-3 text-ink-2">{a.cliente?.nome ?? "—"}</td>
                <td className="px-4 py-3 text-ink-2">{a.corretor?.nome ?? "—"}</td>
                <td className="px-4 py-3 text-ink-2">{a.empreendimento?.nome ?? "—"}</td>
                <td className="px-4 py-3"><AgendamentoStatusBadge status={a.status} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* celular: cartões */}
      <ul className="space-y-2 md:hidden">
        {agendamentos.map((a, i) => (
          <li key={a.id} style={{ animationDelay: `${Math.min(i, 6) * 50}ms` }} className="animate-fade-up">
            <button
              type="button"
              onClick={() => onSelecionar(a)}
              className="w-full space-y-2 rounded-2xl border border-line bg-card p-4 text-left transition-colors hover:border-gold/50"
            >
              <div className="flex items-start justify-between gap-3">
                <div className="min-w-0">
                  <p className="text-[13px] font-semibold text-gold">{formatarDataHora(a.dataHora)}</p>
                  <p className="truncate font-semibold">{a.cliente?.nome ?? "—"}</p>
                </div>
                <AgendamentoStatusBadge status={a.status} />
              </div>
              <p className="truncate text-[13px] text-ink-2">
                {a.corretor?.nome ?? "—"} · {a.tipo === "visita_imovel" ? a.empreendimento?.nome ?? "Imóvel" : a.local ?? "Escritório"}
              </p>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}