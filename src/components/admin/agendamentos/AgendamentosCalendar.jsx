import { Icon } from "@/components/ui/Icon";
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

const BOTAO = "grid size-11 place-items-center rounded-full border border-line text-ink-2 transition-colors hover:border-gold hover:text-ink";

export default function AgendamentosCalendar({ agendamentos = [], semanaBase, onMudarSemana, onSelecionar }) {
  const inicio = inicioDaSemana(semanaBase);
  const dias = Array.from({ length: 7 }, (_, i) => {
    const d = new Date(inicio);
    d.setDate(d.getDate() + i);
    return d;
  });
  const hoje = new Date();
  const irParaHoje = () => onMudarSemana(Math.round((inicioDaSemana(hoje) - inicio) / 86400000));
  const curto = (d) => d.toLocaleDateString("pt-BR", { day: "2-digit", month: "short" });

  return (
    <div className="overflow-hidden rounded-2xl border border-line bg-card">
      <div className="flex items-center justify-between gap-2 border-b border-line-soft p-3">
        <button type="button" onClick={() => onMudarSemana(-7)} aria-label="Semana anterior" className={BOTAO}>
          <Icon name="chevronLeft" className="size-5" />
        </button>
        <div className="flex flex-1 flex-wrap items-center justify-center gap-x-3 gap-y-1">
          <p className="text-sm font-medium">{curto(inicio)} — {curto(dias[6])}</p>
          <button type="button" onClick={irParaHoje} className="h-9 rounded-full border border-line px-4 text-[13px] text-ink-2 transition-colors hover:border-gold hover:text-ink">
            Hoje
          </button>
        </div>
        <button type="button" onClick={() => onMudarSemana(7)} aria-label="Próxima semana" className={BOTAO}>
          <Icon name="chevronRight" className="size-5" />
        </button>
      </div>

      <div key={inicio.getTime()} className="animate-fade-in grid grid-cols-1 divide-y divide-line-soft md:grid-cols-7 md:divide-x md:divide-y-0">
        {dias.map((dia, i) => {
          const doDia = agendamentos
            .filter((a) => mesmoDia(new Date(a.dataHora), dia))
            .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
          const ehHoje = mesmoDia(dia, hoje);

          return (
            <div key={dia.toISOString()} className="p-3 md:min-h-[260px] md:p-2">
              <p className="mb-2 flex md:justify-center">
                <span className={`rounded-full px-2.5 py-0.5 text-xs font-medium ${ehHoje ? "bg-gold/15 text-gold" : "text-ink-3"}`}>
                  {DIAS_SEMANA[i]} {dia.getDate()}
                </span>
              </p>
              <div className="space-y-1.5">
                {doDia.length === 0 && <p className="text-[12px] text-ink-3 md:hidden">Sem compromissos</p>}
                {doDia.map((a) => (
                  <button
                    key={a.id}
                    type="button"
                    onClick={() => onSelecionar(a)}
                    className="block w-full rounded-xl border border-line bg-card-2 p-2.5 text-left text-xs transition duration-200 hover:-translate-y-0.5 hover:border-gold/60"
                  >
                    <p className="font-semibold text-gold">
                      {new Date(a.dataHora).toLocaleTimeString("pt-BR", { hour: "2-digit", minute: "2-digit" })}
                    </p>
                    <p className="truncate text-ink-2">{a.cliente?.nome ?? "—"}</p>
                    <div className="mt-1.5"><AgendamentoStatusBadge status={a.status} /></div>
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