import { Icon } from "@/components/ui/Icon";

export function ClientesSummary({ clientes }) {
  const total = clientes.length;
  const viaLead = clientes.filter((c) => c.leadOrigem).length;
  const cadastroDireto = total - viaLead;

  const inicioMes = new Date();
  inicioMes.setDate(1);
  inicioMes.setHours(0, 0, 0, 0);
  const novosEsteMes = clientes.filter(
    (c) => c.criadoEm && new Date(c.criadoEm) >= inicioMes
  ).length;

  const cards = [
    { label: "Total de clientes", valor: total, icone: "users" },
    { label: "Vindos de leads", valor: viaLead, icone: "git-branch" },
    { label: "Cadastro direto", valor: cadastroDireto, icone: "user-plus" },
    { label: "Novos este mês", valor: novosEsteMes, icone: "calendar-plus" },
  ];

  return (
    <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
      {cards.map((card) => (
        <div
          key={card.label}
          className="rounded-xl border border-line bg-card p-4 flex items-center gap-3"
        >
          <div className="rounded-lg bg-gold/10 p-2 text-gold">
            <Icon name={card.icone} size={18} />
          </div>
          <div>
            <p className="text-2xl font-semibold text-ink">{card.valor}</p>
            <p className="text-xs text-ink-2">{card.label}</p>
          </div>
        </div>
      ))}
    </div>
  );
}