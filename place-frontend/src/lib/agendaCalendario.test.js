import { describe, expect, it } from "vitest";
import { compromissosDeHoje, dobrarLinha, escaparIcs, gerarIcs, localDoCompromisso } from "./agendaCalendario";

const agora = new Date(2026, 9, 26, 10, 0); // 26/10/2026 10:00 (hora local)
const em = (h, m = 0, dia = 26) => new Date(2026, 9, dia, h, m).toISOString();

const visita = {
  id: "abc-123",
  tipo: "visita_imovel",
  dataHora: "2026-10-26T18:30:00.000Z",
  duracaoMinutos: 90,
  status: "agendado",
  observacoes: "Levar tabela, planta; ver 2 unidades",
  cliente: { nome: "Maria Souza", telefone: "(81) 99999-0000" },
  empreendimento: { nome: "Mar Azul", bairro: "Boa Viagem", cidade: "Recife", uf: "PE" },
};

describe("compromissosDeHoje", () => {
  it("mantém só os de hoje em aberto, em ordem de horário", () => {
    const lista = [
      { id: 1, dataHora: em(16), status: "confirmado" },
      { id: 2, dataHora: em(9), status: "agendado" },
      { id: 3, dataHora: em(11), status: "cancelado" },
      { id: 4, dataHora: em(11, 0, 27), status: "agendado" },
      { id: 5, dataHora: em(8), status: "realizado" },
    ];
    expect(compromissosDeHoje(lista, agora).map((a) => a.id)).toEqual([2, 1]);
  });

  it("aceita lista vazia ou nula", () => {
    expect(compromissosDeHoje(null, agora)).toEqual([]);
  });
});

describe("localDoCompromisso", () => {
  it("usa o empreendimento nas visitas e o local nas reuniões", () => {
    expect(localDoCompromisso(visita)).toBe("Mar Azul, Boa Viagem, Recife/PE");
    expect(localDoCompromisso({ tipo: "reuniao", local: "Café da esquina" })).toBe("Café da esquina");
    expect(localDoCompromisso({ tipo: "reuniao" })).toBe("Escritório Place Brokers");
  });
});

describe("gerarIcs", () => {
  const ics = gerarIcs(visita, new Date("2026-10-26T12:00:00.000Z"));

  it("gera um evento com início, fim (duração) e lembrete", () => {
    expect(ics.startsWith("BEGIN:VCALENDAR\r\n")).toBe(true);
    expect(ics).toContain("UID:agendamento-abc-123@placebrokers.com");
    expect(ics).toContain("DTSTART:20261026T183000Z");
    expect(ics).toContain("DTEND:20261026T200000Z");
    expect(ics).toContain("TRIGGER:-PT1H");
    expect(ics.trimEnd().endsWith("END:VCALENDAR")).toBe(true);
  });

  it("escapa vírgulas e ponto e vírgula", () => {
    expect(ics).toContain("LOCATION:Mar Azul\\, Boa Viagem\\, Recife/PE");
    expect(escaparIcs("a;b,c\nd")).toBe("a\\;b\\,c\\nd");
  });

  it("usa 60 minutos quando a duração não vem", () => {
    expect(gerarIcs({ ...visita, duracaoMinutos: null })).toContain("DTEND:20261026T193000Z");
  });
});

describe("dobrarLinha", () => {
  it("nenhuma linha passa de 75 bytes, mesmo com acentos", () => {
    const longa = `SUMMARY:${"ção".repeat(60)}`;
    const enc = new TextEncoder();
    for (const parte of dobrarLinha(longa).split("\r\n")) {
      expect(enc.encode(parte).length).toBeLessThanOrEqual(75);
    }
    expect(dobrarLinha(longa).replace(/\r\n /g, "")).toBe(longa);
  });
});
