import AgendamentoStatusBadge from "./AgendamentoStatusBadge";

const DIAS_SEMANA = ["Dom", "Seg", "Ter", "Qua", "Qui", "Sex", "Sáb"];

function inicioDaSemana(data) {
  const d = new Date(data);
  d.setDate(d.getDate() - d.getDay());
  d.setHours(0, 0, 0, 0);
  return d;
}

function mesmoDia(a, b) {
  return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();
}

export default function AgendamentosCalendar({ agendamentos = [], semanaBase, onMudarSemana,onSelecionar }) {
  const inicio = inicioDaSemana(semanaBase);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(d.getDate() + i);
    return d;
  });

  return (
    <div className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-4 py-3">
        <button
          type="button"
          onClick={() => onMudarSemana(-7)}
          className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
        >
          ← Semana anterior
        </button>
        <p className="text-sm font-medium text-slate-700">
          {inicio.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })} —{" "}
          {dias[6].toLocaleDateString("pt-BR", { day: "2-digit", month: "short" })}
        </p>
        <button
          type="button"
          onClick={() => onMudarSemana(7)}
          className="rounded-md px-2 py-1 text-sm text-slate-600 hover:bg-slate-100"
        >
          Próxima semana →
        </button>
      </div>

      <div className="grid grid-cols-7 divide-x divide-slate-100">
        {dias.map((dia, i) => {
          const doDia = agendamentos
            .filter((a) => mesmoDia(new Date(a.dataHora), dia))
            .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));

          return (
            <div key={dia.toISOString()} className="min-h-[220px] p-2">
              <p className="mb-2 text-center text-xs font-medium text-slate-500">
                {DIAS_SEMANA[i]} {dia.getDate()}
              </p>
              <div className="space-y-1.5">
                {doDia.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onSelecionar(a)}
                    className="block w-full rounded-md border border-slate-200 bg-slate-50 p-1.5 text-left text-xs hover:border-slate-300 hover:bg-white"
                  >
                    <p className="font-medium text-slate-800">
                      {new Date(a.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="truncate text-slate-600">{a.cliente?.nome ?? "—"}</p>
                    <div className="mt-1"><AgendamentoStatusBadge status={a.status} /></div>
                  </button>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}