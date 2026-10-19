import { Icon } from "@/components/ui/Icon";

export default function AgendamentoTipoBadge({ tipo }) {
  const ehVisita = tipo === "visita_imovel";

  return (
    <span className="inline-flex items-center gap-1.5 text-xs font-medium text-ink-2">
      <Icon name={ehVisita ? "mapPin" : "home"} className="size-3.5 text-gold" />
      {ehVisita ? "Visita ao imóvel" : "Reunião no escritório"}
    </span>
  );
}