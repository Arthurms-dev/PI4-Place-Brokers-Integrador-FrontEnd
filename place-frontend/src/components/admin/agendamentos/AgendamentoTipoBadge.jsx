import { Icon } from "@/components/ui/Icon";

export default function AgendamentoTipoBadge({ tipo }) {
  const ehVisita = tipo === "visita_imovel";

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-slate-600">
      <Icon name={ehVisita ? "mapPin" : "home"} className="h-3.5 w-3.5" />
      {ehVisita ? "Visita ao imóvel" : "Reunião no escritório"}
    </span>
  );
}