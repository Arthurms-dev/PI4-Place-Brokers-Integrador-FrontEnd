const ESTILOS = {
  agendado: "bg-white/10 text-ink-2 ring-white/10",
  confirmado: "bg-sky-500/15 text-sky-300 ring-sky-400/25",
  realizado: "bg-emerald-500/15 text-emerald-300 ring-emerald-400/25",
  cancelado: "bg-danger/15 text-danger ring-danger/25",
  nao_compareceu: "bg-amber-500/15 text-amber-300 ring-amber-400/25",
};

const LABELS = {
  agendado: "Agendado",
  confirmado: "Confirmado",
  realizado: "Realizado",
  cancelado: "Cancelado",
  nao_compareceu: "Não compareceu",
};

export default function AgendamentoStatusBadge({ status }) {
  const estilo = ESTILOS[status] ?? ESTILOS.agendado;
  const label = LABELS[status] ?? status;

  return (
    <span className={`inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-[11px] font-medium ring-1 ring-inset ${estilo}`}>
      {label}
    </span>
  );
}