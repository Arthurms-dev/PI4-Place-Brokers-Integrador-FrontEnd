export const LEAD_STATUSES = [
  { value: "novo", label: "Novo", badge: "border-info bg-info/12 text-[#bcd8ff]", dot: "bg-info" },
  { value: "em_atendimento", label: "Em atendimento", badge: "border-gold bg-gold/15 text-[#f3d3a0]", dot: "bg-gold" },
  { value: "convertido", label: "Convertido", badge: "border-[#2fbf7f] bg-ok/12 text-[#7ff0bc]", dot: "bg-ok" },
  { value: "perdido", label: "Perdido", badge: "border-danger bg-danger/12 text-[#ffb3b3]", dot: "bg-danger" },
];

export const STATUS_BY_VALUE = Object.fromEntries(LEAD_STATUSES.map((s) => [s.value, s]));

export function formatLocation(empreendimento) {
  if (!empreendimento) return "";
  return `${empreendimento.bairro}, ${empreendimento.cidade}/${empreendimento.uf}`;
}

export function needsAttention(lead) {
  return lead.status === "novo" && !lead.corretor;
}