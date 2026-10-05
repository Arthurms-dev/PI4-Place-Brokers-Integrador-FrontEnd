function isHoje(dataISO) {
  const data = new Date(dataISO);
  const hoje = new Date();
  return (
    data.getFullYear() === hoje.getFullYear() &&
    data.getMonth() === hoje.getMonth() &&
    data.getDate() === hoje.getDate()
  );
}

function isMesAtual(dataISO) {
  const data = new Date(dataISO);
  const hoje = new Date();
  return data.getFullYear() === hoje.getFullYear() && data.getMonth() === hoje.getMonth();
}

export default function AgendamentosSummary({ agendamentos }) {
  const hoje = agendamentos.filter((a) => isHoje(a.dataHora) && a.status !== "cancelado").length;
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
    { label: "Taxa de não comparecimento (mês)", valor: `${taxaNoShow}%` },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 sm:grid-cols-4">
      {cartoes.map((c) => (
        <div key={c.label} className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <p className="text-sm text-slate-500">{c.label}</p>
          <p className="mt-1 text-2xl font-semibold text-slate-900">{c.valor}</p>
        </div>
      ))}
    </div>
  );
}