// Utilitários da agenda do corretor: aviso do dia e exportação para o
// calendário do celular (.ics). Tudo roda no navegador, sem chamada à API.

export const STATUS_ENCERRADOS = ["realizado", "cancelado", "nao_compareceu"];
const DURACAO_PADRAO_MIN = 60;

const mesmoDia = (a, b) =>
  a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth() && a.getDate() === b.getDate();

/**
 * Compromissos de hoje que ainda vão acontecer ou estão em aberto
 * (agendado/confirmado), em ordem de horário.
 * @param {Array<{ dataHora: string, status: string }>} agendamentos
 * @param {Date} [agora]
 */
export function compromissosDeHoje(agendamentos, agora = new Date()) {
  return (agendamentos ?? [])
    .filter((a) => a?.dataHora && !STATUS_ENCERRADOS.includes(a.status) && mesmoDia(new Date(a.dataHora), agora))
    .sort((a, b) => new Date(a.dataHora) - new Date(b.dataHora));
}

/** Onde o compromisso acontece, em texto. */
export function localDoCompromisso(ag) {
  if (ag.tipo === "visita_imovel" && ag.empreendimento) {
    const e = ag.empreendimento;
    const cidade = [e.cidade, e.uf].filter(Boolean).join("/");
    return [e.nome, e.bairro, cidade].filter(Boolean).join(", ");
  }
  return ag.local || "Escritório Place Brokers";
}

export function tituloDoCompromisso(ag) {
  const cliente = ag.cliente?.nome ?? "cliente";
  return ag.tipo === "visita_imovel"
    ? `Visita: ${ag.empreendimento?.nome ?? "imóvel"} com ${cliente}`
    : `Reunião com ${cliente}`;
}

// ---------- .ics (RFC 5545) ----------

const pad = (n) => String(n).padStart(2, "0");

/** Data em UTC no formato do iCalendar: 20261026T150000Z */
export function dataIcs(data) {
  const d = new Date(data);
  return (
    `${d.getUTCFullYear()}${pad(d.getUTCMonth() + 1)}${pad(d.getUTCDate())}` +
    `T${pad(d.getUTCHours())}${pad(d.getUTCMinutes())}${pad(d.getUTCSeconds())}Z`
  );
}

/** Escapa texto conforme o iCalendar (\\, ;, , e quebras de linha). */
export function escaparIcs(texto) {
  return String(texto ?? "")
    .replace(/\\/g, "\\\\")
    .replace(/;/g, "\\;")
    .replace(/,/g, "\\,")
    .replace(/\r?\n/g, "\\n");
}

/** Quebra linhas com mais de 75 bytes (UTF-8), como pede a especificação. */
export function dobrarLinha(linha) {
  const enc = new TextEncoder();
  const partes = [];
  let atual = "";
  let bytes = 0;
  for (const ch of linha) {
    const tam = enc.encode(ch).length;
    const limite = partes.length === 0 ? 75 : 74; // continuação começa com 1 espaço
    if (bytes + tam > limite) {
      partes.push(atual);
      atual = "";
      bytes = 0;
    }
    atual += ch;
    bytes += tam;
  }
  partes.push(atual);
  return partes.join("\r\n ");
}

/**
 * Gera o conteúdo .ics de um agendamento.
 * @param {object} ag Agendamento no formato da API (dataHora, duracaoMinutos, cliente, empreendimento...)
 * @param {Date} [agora] usado no DTSTAMP (facilita teste)
 */
export function gerarIcs(ag, agora = new Date()) {
  const inicio = new Date(ag.dataHora);
  const fim = new Date(inicio.getTime() + (ag.duracaoMinutos || DURACAO_PADRAO_MIN) * 60000);

  const descricao = [
    ag.cliente?.nome && `Cliente: ${ag.cliente.nome}`,
    ag.cliente?.telefone && `Telefone: ${ag.cliente.telefone}`,
    ag.observacoes && `Obs.: ${ag.observacoes}`,
    "Criado pela área do corretor Place Brokers",
  ]
    .filter(Boolean)
    .join("\n");

  const linhas = [
    "BEGIN:VCALENDAR",
    "VERSION:2.0",
    "PRODID:-//Place Brokers//Agenda do Corretor//PT-BR",
    "CALSCALE:GREGORIAN",
    "METHOD:PUBLISH",
    "BEGIN:VEVENT",
    `UID:agendamento-${ag.id}@placebrokers.com`,
    `DTSTAMP:${dataIcs(agora)}`,
    `DTSTART:${dataIcs(inicio)}`,
    `DTEND:${dataIcs(fim)}`,
    `SUMMARY:${escaparIcs(tituloDoCompromisso(ag))}`,
    `LOCATION:${escaparIcs(localDoCompromisso(ag))}`,
    `DESCRIPTION:${escaparIcs(descricao)}`,
    "BEGIN:VALARM",
    "ACTION:DISPLAY",
    "TRIGGER:-PT1H",
    `DESCRIPTION:${escaparIcs(tituloDoCompromisso(ag))}`,
    "END:VALARM",
    "END:VEVENT",
    "END:VCALENDAR",
  ];

  return linhas.map(dobrarLinha).join("\r\n") + "\r\n";
}

/** Baixa o .ics; no celular, o arquivo abre direto no app de calendário. */
export function baixarIcs(ag) {
  const blob = new Blob([gerarIcs(ag)], { type: "text/calendar;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  const dia = new Date(ag.dataHora).toISOString().slice(0, 10);
  link.href = url;
  link.download = `place-brokers-${ag.tipo === "visita_imovel" ? "visita" : "reuniao"}-${dia}.ics`;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
