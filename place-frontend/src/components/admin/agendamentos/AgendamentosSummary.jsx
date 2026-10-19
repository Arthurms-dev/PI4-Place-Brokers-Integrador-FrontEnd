function mesmoDia(dataISO, ref = new Date()) {
  const d = new Date(dataISO);
  return d.getFullYear() === ref.getFullYear() && d.getMonth() === ref.getMonth() && d.getDate() === ref.getDate();
}

function isMesAtual(dataISO) {
  const d = new Date(dataISO);
  const hoje = new Date();
  return d.getFullYear() === hoje.getFullYear() && d.getMonth() === hoje.getMonth();
}

export default function AgendamentosSummary({ agendamentos = [] }) {
  const hoje = agendamentos.filter((a) => mesmoDia(a.dataHora) && a.status !== "cancelado").length;
  const confirmados = agendamentos.filter((a) => a.status === "confirmado").length;
  const pendentes = agendamentos.filter((a) => a.status === "agendado").length;

  const doMes = agendamentos.filter((a) => isMesAtual(a.dataHora));
  const concluidosOuFalta = doMes.filter((a) => a.status === "realizado" || a.status === "nao_compareceu");
  const taxaNoShow = concluidosOuFalta.length
    ? Math.round((concluidosOuFalta.filter((a) => a.status === "nao_compareceu").length / concluidosOuFalta.length) * 100)
    : 0;

  const cartoes = [
    { label: "Hoje", valor: hoje },
    { label: "Confirmados", valor: confirmados },
    { label: "Aguardando confirmação", valor: pendentes },
    { label: "Não comparecimento (mês)", valor: `${taxaNoShow}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
      {cartoes.map((c, i) => (
        <div
          key={c.label}
          style={{ animationDelay: `${i * 70}ms` }}
          className="animate-fade-up rounded-2xl border border-line bg-card p-4 transition-colors hover:border-gold/40"
        >
          <p className="text-[12px] text-ink-3">{c.label}</p>
          <p className="mt-1 text-2xl font-semibold">{c.valor}</p>
        </div>
      ))}
    </div>
  );
}