// Atendimento do lead pelo corretor: tempo de espera, links de ligação/WhatsApp
// e lembrete de retorno com alarme no calendário do celular (.ics).
import { dataIcs, dobrarLinha, escaparIcs } from "@/lib/agendaCalendario";

const MIN = 60 * 1000;

/** Desde quando o lead está com o corretor (a roleta ou o repasse); leads antigos usam a data de criação. */
export const chegadaDoLead = (lead) => lead.atribuidoEm ?? lead.criadoEm;

/** Só os dígitos do telefone, sem o 55 (a API guarda DDD + número). */
export const digitosTelefone = (tel = "") => String(tel).replace(/\D/g, "").replace(/^55(?=\d{10,11}$)/, "");

/** (81) 99999-9999 */
export function formatarTelefone(tel = "") {
  const d = digitosTelefone(tel);
  if (d.length === 11) return `(${d.slice(0, 2)}) ${d.slice(2, 7)}-${d.slice(7)}`;
  if (d.length === 10) return `(${d.slice(0, 2)}) ${d.slice(2, 6)}-${d.slice(6)}`;
  return tel;
}

/** Abre o discador do celular. */
export const linkLigar = (tel) => `tel:+55${digitosTelefone(tel)}`;

/** Abre a conversa no WhatsApp, sem mensagem pronta (o corretor fala do jeito dele). */
export const linkWhatsApp = (tel) => `https://wa.me/55${digitosTelefone(tel)}`;

/** "agora", "há 5 min", "há 2 h", "há 3 dias" */
export function tempoDesde(iso, agora = new Date()) {
  const min = Math.max(0, Math.floor((agora - new Date(iso)) / MIN));
  if (min < 1) return "agora";
  if (min < 60) return `há ${min} min`;
  const h = Math.floor(min / 60);
  if (h < 24) return `há ${h} h`;
  const d = Math.floor(h / 24);
  return `há ${d} ${d === 1 ? "dia" : "dias"}`;
}

/**
 * Quanto o lead novo está esperando: até 5 min "ok", até 15 min "atencao", depois "atrasado".
 * Quem retorna primeiro leva o cliente, por isso o alerta é curto.
 */
export function urgencia(iso, agora = new Date()) {
  const min = (agora - new Date(iso)) / MIN;
  if (min <= 5) return "ok";
  if (min <= 15) return "atencao";
  return "atrasado";
}

/** Atalhos do lembrete: em 1 hora, hoje às 18h (se ainda der), amanhã às 9h. */
export function atalhosLembrete(agora = new Date()) {
  const emUmaHora = new Date(agora.getTime() + 60 * MIN);
  emUmaHora.setSeconds(0, 0);
  const hoje18 = new Date(agora);
  hoje18.setHours(18, 0, 0, 0);
  const amanha9 = new Date(agora);
  amanha9.setDate(amanha9.getDate() + 1);
  amanha9.setHours(9, 0, 0, 0);
  return [
    { rotulo: "Em 1 hora", data: emUmaHora },
    ...(hoje18 - agora > 30 * MIN ? [{ rotulo: "Hoje, 18h", data: hoje18 }] : []),
    { rotulo: "Amanhã, 9h", data: amanha9 },
  ];
}

/** Valor para <input type="datetime-local"> no fuso do aparelho. */
export function paraCampoDataHora(data) {
  const p = (n) => String(n).padStart(2, "0");
  return `${data.getFullYear()}-${p(data.getMonth() + 1)}-${p(data.getDate())}T${p(data.getHours())}:${p(data.getMinutes())}`;
}

/**
 * .ics do lembrete, com alarme na hora marcada: no celular, o calendário desperta
 * mesmo com o site fechado.
 */
export function gerarIcsLembrete({ id, nome, telefone, empreendimento, nota, quando }, agora = new Date()) {
  const inicio = new Date(quando);
  const fim = new Date(inicio.getTime() + 15 * MIN);
  const titulo = `Retornar: ${nome}${empreendimento ? ` (${empreendimento})` : ""}`;
  const descricao = [telefone && `Telefone: ${formatarTelefone(telefone)}`, nota && `Nota: ${nota}`, "Lembrete da área do corretor Place Brokers"]
    .filter(Boolean)
    .join("\n");
  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Place Brokers//Lembrete do Corretor//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:lembrete-${id}@placebrokers.com`,
    `DTSTAMP:${dataIcs(agora)}`,
    `DTSTART:${dataIcs(inicio)}`,
    `DTEND:${dataIcs(fim)}`,
    `SUMMARY:${escaparIcs(titulo)}`,
    `DESCRIPTION:${escaparIcs(descricao)}`,
    ...(telefone ? [`URL:${linkLigar(telefone)}`] : []),
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:PT0M",
    `DESCRIPTION:${escaparIcs(titulo)}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];
  return linhas.map(dobrarLinha).join("\r\n") + "\r\n";
}

export function baixarIcsLembrete(dados) {
  const blob = new Blob([gerarIcsLembrete(dados)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = `retorno-${String(dados.nome ?? "cliente").split(" ")[0].toLowerCase()}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
