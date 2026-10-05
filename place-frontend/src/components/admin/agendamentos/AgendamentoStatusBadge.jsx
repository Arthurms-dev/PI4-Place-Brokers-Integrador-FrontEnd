const ESTILOS = {
  agendado: "bg-slate-100 text-slate-700 ring-slate-200",
  confirmado: "bg-blue-50 text-blue-700 ring-blue-200",
  realizado: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  cancelado: "bg-red-50 text-red-700 ring-red-200",
  nao_compareceu: "bg-amber-50 text-amber-800 ring-amber-200",
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
    <span className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ring-1 ring-inset ${estilo}`}>
      {label}
    </span>
  );
}